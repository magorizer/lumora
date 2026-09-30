<?php

namespace laravel\app\Http\Controllers\Api;

use laravel\app\Models\Goal;
use laravel\app\Models\LifeArea;
use laravel\app\Models\UserPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;use function App\Http\Controllers\Api\collect;use function App\Http\Controllers\Api\now;use function App\Http\Controllers\Api\response;

class OnboardingController
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $preference = $user->preference()->firstOrCreate(['user_id' => $user->id]);

        return response()->json([
            'completed' => $preference->onboarding_completed_at !== null,
            'reflection_style' => $preference->reflection_style,
            'timezone' => $preference->timezone,
            'life_area_ids' => $user->lifeAreas()->pluck('life_areas.id'),
            'goals' => $user->goals()->where('status', 'active')->with('lifeArea:id,name,slug')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'life_area_ids' => ['required', 'array', 'min:1', 'max:6'],
            'life_area_ids.*' => ['integer', 'exists:life_areas,id'],
            'reflection_style' => ['sometimes', 'in:gentle,balanced,direct'],
            'timezone' => ['sometimes', 'timezone'],
            'goals' => ['required', 'array', 'min:1', 'max:3'],
            'goals.*.title' => ['required', 'string', 'max:160'],
            'goals.*.why' => ['nullable', 'string', 'max:1000'],
            'goals.*.life_area_id' => ['nullable', 'integer', 'exists:life_areas,id'],
        ]);

        $user = $request->user();

        DB::transaction(function () use ($user, $data): void {
            $selectedIds = collect($data['life_area_ids'])->map(fn ($id) => (int) $id)->unique()->values();
            $validIds = LifeArea::query()->whereIn('id', $selectedIds)->pluck('id');
            $sync = $validIds->mapWithKeys(fn ($id, $index) => [$id => ['priority' => $index + 1]])->all();
            $user->lifeAreas()->sync($sync);

            UserPreference::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'reflection_style' => $data['reflection_style'] ?? 'balanced',
                    'timezone' => $data['timezone'] ?? 'UTC',
                    'onboarding_completed_at' => now(),
                ],
            );

            if ($user->goals()->where('status', 'active')->doesntExist()) {
                foreach ($data['goals'] as $goal) {
                    Goal::query()->create([
                        'user_id' => $user->id,
                        'life_area_id' => $goal['life_area_id'] ?? null,
                        'title' => $goal['title'],
                        'why' => $goal['why'] ?? null,
                    ]);
                }
            }
        });

        return $this->show($request);
    }
}
