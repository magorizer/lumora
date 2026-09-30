<?php

namespace laravel\app\Providers;

use laravel\app\Contracts\InsightEngine;
use laravel\app\Services\RuleBasedInsightEngine;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(InsightEngine::class, RuleBasedInsightEngine::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
