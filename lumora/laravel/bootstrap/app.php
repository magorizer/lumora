<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function (): void {
            $apiDomain = config('app.api_domain');
            $adminDomain = config('app.admin_domain');

            if ($apiDomain) {
                Route::middleware('api')
                    ->domain($apiDomain)
                    ->group(base_path('routes/api.php'));
            }

            if ($adminDomain) {
                Route::middleware('web')
                    ->domain($adminDomain)
                    ->group(base_path('routes/web.php'));
            } else {
                Route::middleware('web')
                    ->group(base_path('routes/web.php'));
            }

            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend(HandleCors::class);
        $middleware->redirectGuestsTo(function (Request $request) {
            $apiDomain = config('app.api_domain');
            if ($request->expectsJson()) {
                return null;
            }
            if ($apiDomain && str_contains($request->getHost(), $apiDomain)) {
                return null;
            }

            return route('nova.login');
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
