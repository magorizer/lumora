<?php

namespace laravel\app\Http\Controllers\Api;

use laravel\app\Services\WeeklyReviewService;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;use function App\Http\Controllers\Api\response;

class DashboardController
{
    public function show(Request $request, WeeklyReviewService $reviews): JsonResponse
    {
        $user = $request->user();
        $preference = $user->preference()->firstOrCreate(['user_id' => $user->id]);
        $today = CarbonImmutable::now($preference->timezone ?: 'UTC')->startOfDay();

        return response()->json([
            'onboarding_completed' => $preference->onboarding_completed_at !== null,
            'today_checkin' => $user->checkins()->with(['lifeAreas:id,name,slug,icon', 'goals:id,title'])->whereDate('checkin_date', $today)->first(),
            'active_goals' => $user->goals()->with('lifeArea:id,name,slug')->where('status', 'active')->orderBy('created_at')->limit(3)->get(),
            'open_actions' => $user->actions()->with('goal:id,title')->where('status', 'open')->orderByRaw('due_date is null, due_date asc')->latest()->limit(6)->get(),
            'recent_patterns' => $user->patterns()->where('status', '!=', 'dismissed')->latest('last_detected_at')->limit(3)->get(),
            'weekly_review' => $reviews->generate($user, $today->startOfWeek(CarbonImmutable::MONDAY)),
        ]);
    }
}
