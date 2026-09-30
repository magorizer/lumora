<?php

namespace laravel\app\Services;

use laravel\app\Contracts\InsightEngine;
use laravel\app\Models\Pattern;
use laravel\app\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;use function App\Services\collect;use function App\Services\now;

class RuleBasedInsightEngine implements InsightEngine
{
    public function detect(User $user, CarbonImmutable $from, CarbonImmutable $to): Collection
    {
        $checkins = $user->checkins()
            ->with(['lifeAreas:id,name,slug', 'goals:id,title'])
            ->whereBetween('checkin_date', [$from->toDateString(), $to->toDateString()])
            ->orderBy('checkin_date')
            ->get();

        $insights = collect();

        if ($checkins->count() >= 3) {
            $insights = $insights
                ->merge($this->recurringMood($checkins))
                ->merge($this->lifeAreaMoodPairs($checkins))
                ->merge($this->lifeAreaEnergyPairs($checkins))
                ->merge($this->repeatedListItems($checkins, 'energizers', 'energy_source', 'Repeated source of energy'))
                ->merge($this->repeatedListItems($checkins, 'drainers', 'energy_drain', 'Repeated drain on your energy'));
        }

        $insights = $insights->merge($this->goalSignals($user, $from, $to));

        return $insights
            ->map(fn (array $insight) => $this->persist($user, $insight))
            ->values();
    }

    private function recurringMood(Collection $checkins): Collection
    {
        $total = $checkins->count();

        return $checkins->groupBy('mood')
            ->map(fn (Collection $group, string $mood) => ['mood' => $mood, 'count' => $group->count()])
            ->filter(fn (array $row) => $row['count'] >= 3 && ($row['count'] / $total) >= 0.45)
            ->map(function (array $row) use ($total): array {
                $label = Str::headline($row['mood']);
                $percent = (int) round(($row['count'] / $total) * 100);

                return [
                    'type' => 'recurring_state',
                    'key' => $row['mood'],
                    'title' => "$label has been showing up often",
                    'summary' => "$label appeared in {$row['count']} of your last {$total} check-ins in this period.",
                    'evidence' => ['mood' => $row['mood'], 'count' => $row['count'], 'total' => $total, 'percent' => $percent],
                    'confidence' => min(95, 55 + ($row['count'] * 7)),
                ];
            });
    }

    private function lifeAreaMoodPairs(Collection $checkins): Collection
    {
        $pairs = [];
        foreach ($checkins as $checkin) {
            foreach ($checkin->lifeAreas as $area) {
                $key = $area->id.'|'.$checkin->mood;
                $pairs[$key] ??= ['area' => $area, 'mood' => $checkin->mood, 'count' => 0, 'dates' => []];
                $pairs[$key]['count']++;
                $pairs[$key]['dates'][] = $checkin->checkin_date->toDateString();
            }
        }

        return collect($pairs)
            ->filter(fn (array $pair) => $pair['count'] >= 3)
            ->map(function (array $pair): array {
                $mood = Str::lower(Str::headline($pair['mood']));
                return [
                    'type' => 'life_area_state',
                    'key' => $pair['area']->id.'-'.$pair['mood'],
                    'title' => $pair['area']->name.' and '.$mood.' often appeared together',
                    'summary' => "You selected {$pair['area']->name} on {$pair['count']} check-ins where you also felt {$mood}.",
                    'evidence' => ['life_area_id' => $pair['area']->id, 'life_area' => $pair['area']->name, 'mood' => $pair['mood'], 'count' => $pair['count'], 'dates' => $pair['dates']],
                    'confidence' => min(92, 58 + ($pair['count'] * 6)),
                ];
            });
    }

    private function lifeAreaEnergyPairs(Collection $checkins): Collection
    {
        $rows = [];
        foreach ($checkins as $checkin) {
            foreach ($checkin->lifeAreas as $area) {
                $rows[$area->id] ??= ['area' => $area, 'energies' => []];
                $rows[$area->id]['energies'][] = $checkin->energy;
            }
        }

        return collect($rows)
            ->filter(fn (array $row) => count($row['energies']) >= 3)
            ->map(function (array $row): ?array {
                $avg = round(array_sum($row['energies']) / count($row['energies']), 1);
                if ($avg > 2.4 && $avg < 4.2) {
                    return null;
                }
                $direction = $avg <= 2.4 ? 'lower' : 'higher';
                return [
                    'type' => 'life_area_energy',
                    'key' => $row['area']->id.'-'.$direction,
                    'title' => $row['area']->name.' has tended to coincide with '.$direction.' energy',
                    'summary' => "Across ".count($row['energies'])." check-ins involving {$row['area']->name}, your average energy was {$avg}/5.",
                    'evidence' => ['life_area_id' => $row['area']->id, 'life_area' => $row['area']->name, 'average_energy' => $avg, 'count' => count($row['energies'])],
                    'confidence' => min(90, 56 + (count($row['energies']) * 6)),
                ];
            })
            ->filter();
    }

    private function repeatedListItems(Collection $checkins, string $field, string $type, string $title): Collection
    {
        $counts = [];
        foreach ($checkins as $checkin) {
            foreach (($checkin->{$field} ?? []) as $item) {
                $normalized = Str::lower(trim((string) $item));
                if ($normalized === '') {
                    continue;
                }
                $counts[$normalized] = ($counts[$normalized] ?? 0) + 1;
            }
        }

        return collect($counts)
            ->filter(fn (int $count) => $count >= 2)
            ->sortDesc()
            ->take(3)
            ->map(fn (int $count, string $item) => [
                'type' => $type,
                'key' => Str::slug($item),
                'title' => $title,
                'summary' => '“'.Str::headline($item).'” appeared '.$count.' times in your check-ins.',
                'evidence' => ['item' => $item, 'count' => $count],
                'confidence' => min(90, 58 + ($count * 8)),
            ]);
    }

    private function goalSignals(User $user, CarbonImmutable $from, CarbonImmutable $to): Collection
    {
        return $user->goals()
            ->with(['actions' => fn ($query) => $query->whereBetween('created_at', [$from->startOfDay(), $to->endOfDay()])])
            ->where('status', 'active')
            ->get()
            ->map(function ($goal) use ($to): ?array {
                $completed = $goal->actions->where('status', 'completed')->count();
                $recentActivity = $goal->actions->filter(fn ($action) => $action->updated_at?->gte($to->subDays(7)))->count();

                if ($completed >= 2) {
                    return [
                        'type' => 'goal_consistency',
                        'key' => (string) $goal->id,
                        'title' => 'You are creating momentum on '.$goal->title,
                        'summary' => "You completed {$completed} actions connected to this goal during the period.",
                        'evidence' => ['goal_id' => $goal->id, 'goal' => $goal->title, 'completed_actions' => $completed],
                        'confidence' => min(92, 62 + ($completed * 7)),
                    ];
                }

                if ($goal->created_at?->lte($to->subDays(7)) && $recentActivity === 0) {
                    return [
                        'type' => 'goal_attention',
                        'key' => (string) $goal->id,
                        'title' => $goal->title.' may need fresh attention',
                        'summary' => 'There has not been a recorded action on this active goal in the last 7 days.',
                        'evidence' => ['goal_id' => $goal->id, 'goal' => $goal->title, 'days_without_action' => 7],
                        'confidence' => 72,
                    ];
                }

                return null;
            })
            ->filter();
    }

    private function persist(User $user, array $insight): Pattern
    {
        $fingerprint = hash('sha256', $user->id.'|'.$insight['type'].'|'.$insight['key']);

        $pattern = Pattern::query()->firstOrNew(['fingerprint' => $fingerprint]);
        $pattern->fill([
            'user_id' => $user->id,
            'type' => $insight['type'],
            'title' => $insight['title'],
            'summary' => $insight['summary'],
            'evidence' => $insight['evidence'],
            'confidence' => $insight['confidence'],
            'last_detected_at' => now(),
        ]);
        if (! $pattern->exists) {
            $pattern->status = 'active';
        }
        $pattern->save();

        return $pattern;
    }
}
