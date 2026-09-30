<?php

use laravel\app\Http\Controllers\Api\ActionController;
use laravel\app\Http\Controllers\Api\CheckinController;
use laravel\app\Http\Controllers\Api\ClerkWebhookController;
use laravel\app\Http\Controllers\Api\DashboardController;
use laravel\app\Http\Controllers\Api\GoalController;
use laravel\app\Http\Controllers\Api\LifeAreaController;
use laravel\app\Http\Controllers\Api\MemoryController;
use laravel\app\Http\Controllers\Api\OnboardingController;
use laravel\app\Http\Controllers\Api\PatternController;
use laravel\app\Http\Controllers\Api\UserController;
use laravel\app\Http\Controllers\Api\WeeklyReviewController;
use laravel\app\Http\Middleware\ClerkAuth;
use Illuminate\Support\Facades\Route;

Route::middleware(ClerkAuth::class)->group(function (): void {
    Route::get('/users/profile', [UserController::class, 'profile']);
    Route::put('/users/profile', [UserController::class, 'updateProfile']);

    Route::get('/life-areas', [LifeAreaController::class, 'index']);
    Route::get('/onboarding', [OnboardingController::class, 'show']);
    Route::post('/onboarding', [OnboardingController::class, 'store']);
    Route::get('/dashboard', [DashboardController::class, 'show']);

    Route::apiResource('goals', GoalController::class)->except(['show']);
    Route::apiResource('checkins', CheckinController::class)->except(['show']);
    Route::apiResource('memories', MemoryController::class)->except(['show']);
    Route::apiResource('actions', ActionController::class)->except(['show']);

    Route::get('/patterns', [PatternController::class, 'index']);
    Route::put('/patterns/{pattern}/feedback', [PatternController::class, 'feedback']);

    Route::get('/weekly-reviews/current', [WeeklyReviewController::class, 'current']);
    Route::get('/weekly-reviews', [WeeklyReviewController::class, 'index']);
    Route::put('/weekly-reviews/{review}', [WeeklyReviewController::class, 'update']);
});

Route::post('/clerk/webhook', [ClerkWebhookController::class, 'handle']);
