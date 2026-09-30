<?php

namespace laravel\app\Http\Controllers\Api;

use laravel\app\Models\LifeArea;
use Illuminate\Http\JsonResponse;use function App\Http\Controllers\Api\response;

class LifeAreaController
{
    public function index(): JsonResponse
    {
        return response()->json(LifeArea::query()->orderBy('sort_order')->get(['id', 'slug', 'name', 'icon']));
    }
}
