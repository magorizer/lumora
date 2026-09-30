<?php

namespace laravel\app\Http\Controllers\Api;

use laravel\app\Models\WeeklyReview;
use laravel\app\Services\WeeklyReviewService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;use function App\Http\Controllers\Api\response;

class WeeklyReviewController
{
    public function current(Request $request, WeeklyReviewService $service): JsonResponse
    {
        $timezone = $request->user()->preference?->timezone ?: 'UTC';
        $start = CarbonImmutable::now($timezone)->startOfWeek(CarbonImmutable::MONDAY);
        return response()->json($service->generate($request->user(), $start));
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->weeklyReviews()->with(['focusLifeArea:id,name,slug', 'focusGoal:id,title'])->latest('week_start')->limit(26)->get()
        );
    }

    public function update(Request $request, int $review): JsonResponse
    {
        $model = $request->user()->weeklyReviews()->findOrFail($review);
        $data = $request->validate([
            'focus_life_area_id' => ['nullable', 'integer', 'exists:life_areas,id'],
            'focus_goal_id' => ['nullable', 'integer', Rule::exists('goals', 'id')->where(fn ($q) => $q->where('user_id', $request->user()->id))],
            'focus_note' => ['nullable', 'string', 'max:1000'],
        ]);
        $model->update($data);
        return response()->json($model->fresh()->load(['focusLifeArea:id,name,slug', 'focusGoal:id,title']));
    }
}
