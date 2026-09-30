<?php

namespace laravel\app\Services;

use laravel\app\Contracts\InsightEngine;
use laravel\app\Models\User;
use laravel\app\Models\WeeklyReview;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class WeeklyReviewService
{
    public function __construct(private readonly InsightEngine $insightEngine) {}

    public function generate(User $user, CarbonImmutable $weekStart): WeeklyReview
    {
        $weekStart = $weekStart->startOfWeek(CarbonImmutable::MONDAY);
        $weekEnd = $weekStart->endOfWeek(CarbonImmutable::SUNDAY);

        $checkins = $user->checkins()
            ->with('lifeAreas:id,name,slug')
            ->whereBetween('checkin_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->orderBy('checkin_date')
            ->get();

        $actionsCreated = $user->actions()
            ->whereBetween('created_at', [$weekStart->startOfDay(), $weekEnd->endOfDay()])
            ->count();

        $actionsCompleted = $user->actions()
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$weekStart->startOfDay(), $weekEnd->endOfDay()])
            ->count();

        $patterns = $this->insightEngine->detect($user, $weekStart->subDays(21), $weekEnd)
            ->filter(fn ($pattern) => $pattern->status !== 'dismissed')
            ->sortByDesc('confidence')
            ->take(4)
            ->values();

        $summary = [
            'week_end' => $weekEnd->toDateString(),
            'checkin_count' => $checkins->count(),
            'mood_distribution' => $this->distribution($checkins->pluck('mood')),
            'average_energy' => $checkins->isEmpty() ? null : round((float) $checkins->avg('energy'), 1),
            'life_areas' => $this->lifeAreaCounts($checkins),
            'energizers' => $this->listCounts($checkins, 'energizers'),
            'drainers' => $this->listCounts($checkins, 'drainers'),
            'actions_completed' => $actionsCompleted,
            'actions_created' => $actionsCreated,
            'goal_progress' => $user->goals()->where('status', 'active')->get(['id', 'title', 'progress'])->toArray(),
            'patterns' => $patterns->map(fn ($pattern) => [
                'id' => $pattern->id,
                'title' => $pattern->title,
                'summary' => $pattern->summary,
                'confidence' => $pattern->confidence,
            ])->all(),
        ];

        return WeeklyReview::query()->updateOrCreate(
            ['user_id' => $user->id, 'week_start' => $weekStart->toDateString()],
            ['summary' => $summary],
        )->load(['focusLifeArea:id,name,slug', 'focusGoal:id,title']);
    }

    private function distribution(Collection $values): array
    {
        $total = $values->count();
        if ($total === 0) {
            return [];
        }

        return $values->countBy()->sortDesc()->map(fn ($count) => [
            'count' => $count,
            'percent' => (int) round(($count / $total) * 100),
        ])->all();
    }

    private function lifeAreaCounts(Collection $checkins): array
    {
        $counts = [];
        foreach ($checkins as $checkin) {
            foreach ($checkin->lifeAreas as $area) {
                $counts[$area->name] = ($counts[$area->name] ?? 0) + 1;
            }
        }
        arsort($counts);
        return array_slice($counts, 0, 5, true);
    }

    private function listCounts(Collection $checkins, string $field): array
    {
        $counts = [];
        foreach ($checkins as $checkin) {
            foreach (($checkin->{$field} ?? []) as $item) {
                $label = trim((string) $item);
                if ($label !== '') {
                    $counts[$label] = ($counts[$label] ?? 0) + 1;
                }
            }
        }
        arsort($counts);
        return array_slice($counts, 0, 5, true);
    }
}
