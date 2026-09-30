<?php

namespace laravel\app\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;use function App\Http\Controllers\Api\response;

class MemoryController
{
    public function index(Request $request): JsonResponse
    {
        return response()->json($request->user()->memories()->orderByDesc('is_pinned')->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $memory = $request->user()->memories()->create($this->validated($request));
        return response()->json($memory, 201);
    }

    public function update(Request $request, int $memory): JsonResponse
    {
        $model = $request->user()->memories()->findOrFail($memory);
        $model->update($this->validated($request, false));
        return response()->json($model->fresh());
    }

    public function destroy(Request $request, int $memory): JsonResponse
    {
        $request->user()->memories()->findOrFail($memory)->delete();
        return response()->json([], 204);
    }

    private function validated(Request $request, bool $creating = true): array
    {
        return $request->validate([
            'category' => ['sometimes', 'in:insight,value,person,preference,resource,context'],
            'title' => ['nullable', 'string', 'max:160'],
            'content' => [$creating ? 'required' : 'sometimes', 'string', 'max:3000'],
            'is_pinned' => ['sometimes', 'boolean'],
        ]);
    }
}
