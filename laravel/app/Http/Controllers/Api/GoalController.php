<?php

namespace laravel\app\Http\Controllers\Api;

use laravel\app\Models\Goal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;use function App\Http\Controllers\Api\now;use function App\Http\Controllers\Api\response;

class GoalController
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->goals()->with(['lifeArea:id,name,slug', 'actions' => fn ($q) => $q->latest()->limit(10)])->latest();
        if ($request->boolean('active_only')) {
            $query->where('status', 'active');
        }
        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateGoal($request);
        if ($request->user()->goals()->where('status', 'active')->count() >= 3) {
            return response()->json(['message' => 'Keep at most three active goals at a time.'], 422);
        }
        $goal = $request->user()->goals()->create($data);
        return response()->json($goal->load('lifeArea:id,name,slug'), 201);
    }

    public function update(Request $request, int $goal): JsonResponse
    {
        $model = $request->user()->goals()->findOrFail($goal);
        $data = $this->validateGoal($request, false);
        if (($data['status'] ?? null) === 'active' && $model->status !== 'active' && $request->user()->goals()->where('status', 'active')->count() >= 3) {
            return response()->json(['message' => 'Keep at most three active goals at a time.'], 422);
        }
        $model->fill($data);
        if (($data['status'] ?? null) === 'archived') {
            $model->archived_at = now();
        } elseif (($data['status'] ?? null) === 'active') {
            $model->archived_at = null;
        }
        $model->save();
        return response()->json($model->load(['lifeArea:id,name,slug', 'actions']));
    }

    public function destroy(Request $request, int $goal): JsonResponse
    {
        $request->user()->goals()->findOrFail($goal)->delete();
        return response()->json([], 204);
    }

    private function validateGoal(Request $request, bool $creating = true): array
    {
        return $request->validate([
            'title' => [$creating ? 'required' : 'sometimes', 'string', 'max:160'],
            'why' => ['nullable', 'string', 'max:1000'],
            'life_area_id' => ['nullable', 'integer', 'exists:life_areas,id'],
            'progress' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'status' => ['sometimes', 'in:active,completed,archived'],
            'target_date' => ['nullable', 'date'],
        ]);
    }
}
