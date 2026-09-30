<?php

namespace laravel\tests\Feature\Lumora;

use laravel\app\Models\Checkin;
use laravel\app\Models\LifeArea;
use laravel\app\Models\User;
use laravel\app\Services\RuleBasedInsightEngine;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use laravel\tests\TestCase;use function Tests\Feature\Lumora\app;

class RuleBasedInsightEngineTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_detects_a_repeated_state_and_life_area_pair(): void
    {
        $user = User::factory()->create();
        $work = LifeArea::query()->create(['slug' => 'work', 'name' => 'Work', 'sort_order' => 1]);

        foreach (range(0, 3) as $offset) {
            $checkin = Checkin::query()->create([
                'user_id' => $user->id,
                'checkin_date' => CarbonImmutable::parse('2026-09-01')->addDays($offset),
                'mood' => 'tense',
                'energy' => 2,
                'energizers' => ['walk'],
                'drainers' => ['urgent work'],
            ]);
            $checkin->lifeAreas()->attach($work->id);
        }

        $patterns = app(RuleBasedInsightEngine::class)->detect(
            $user,
            CarbonImmutable::parse('2026-09-01'),
            CarbonImmutable::parse('2026-09-07'),
        );

        $this->assertTrue($patterns->contains(fn ($pattern) => $pattern->type === 'recurring_state'));
        $this->assertTrue($patterns->contains(fn ($pattern) => $pattern->type === 'life_area_state'));
        $this->assertTrue($patterns->contains(fn ($pattern) => $pattern->type === 'energy_drain'));
    }
}
