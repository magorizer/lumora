<?php

namespace laravel\app\Http\Controllers\Api;

use laravel\app\Contracts\InsightEngine;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;use function App\Http\Controllers\Api\response;

class PatternController
{
    public function index(Request $request, InsightEngine $engine): JsonResponse
    {
        $timezone = $request->user()->preference?->timezone ?: 'UTC';
        $to = CarbonImmutable::now($timezone)->startOfDay();
        $engine->detect($request->user(), $to->subDays(59), $to);

        $query = $request->user()->patterns()->latest('last_detected_at');
        if (! $request->boolean('include_dismissed')) {
            $query->where('status', '!=', 'dismissed');
        }
        return response()->json($query->limit(50)->get());
    }

    public function feedback(Request $request, int $pattern): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:active,confirmed,dismissed']]);
        $model = $request->user()->patterns()->findOrFail($pattern);
        $model->update($data);
        return response()->json($model->fresh());
    }
}
