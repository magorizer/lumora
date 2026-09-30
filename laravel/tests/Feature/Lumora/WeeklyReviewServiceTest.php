<?php

namespace laravel\tests\Feature\Lumora;

use laravel\app\Models\ActionItem;
use laravel\app\Models\Checkin;
use laravel\app\Models\Goal;
use laravel\app\Models\User;
use laravel\app\Services\WeeklyReviewService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use laravel\tests\TestCase;use function Tests\Feature\Lumora\app;

class WeeklyReviewServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_aggregates_a_week_into_a_review(): void
    {
        $user = User::factory()->create();
        $goal = Goal::query()->create([
            'user_id' => $user->id,
            'title' => 'Build Lumora',
            'progress' => 25,
        ]);

        foreach (range(0, 2) as $offset) {
            Checkin::query()->create([
                'user_id' => $user->id,
                'checkin_date' => CarbonImmutable::parse('2026-09-28')->addDays($offset),
                'mood' => $offset === 0 ? 'calm' : 'hopeful',
                'energy' => 4,
                'energizers' => ['own project'],
                'drainers' => ['poor sleep'],
            ]);
        }

        ActionItem::query()->create([
            'user_id' => $user->id,
            'goal_id' => $goal->id,
            'title' => 'Finish the check-in flow',
            'status' => 'completed',
            'completed_at' => CarbonImmutable::parse('2026-09-29 10:00:00'),
        ]);

        $review = app(WeeklyReviewService::class)->generate($user, CarbonImmutable::parse('2026-09-28'));

        $this->assertSame(3, $review->summary['checkin_count']);
        $this->assertSame(4.0, $review->summary['average_energy']);
        $this->assertSame(1, $review->summary['actions_completed']);
        $this->assertArrayHasKey('own project', $review->summary['energizers']);
    }
}
