<?php

namespace laravel\app\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;use function App\Http\Controllers\Api\now;use function App\Http\Controllers\Api\response;

class ActionController
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->actions()->with('goal:id,title')->latest();
        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }
        return response()->json($query->limit(100)->get());
    }

    public function store(Request $request): JsonResponse
    {
        $action = $request->user()->actions()->create($this->validated($request));
        return response()->json($action->load('goal:id,title'), 201);
    }

    public function update(Request $request, int $action): JsonResponse
    {
        $model = $request->user()->actions()->findOrFail($action);
        $data = $this->validated($request, false);
        if (($data['status'] ?? null) === 'completed' && $model->status !== 'completed') {
            $data['completed_at'] = now();
        } elseif (($data['status'] ?? null) === 'open') {
            $data['completed_at'] = null;
        }
        $model->update($data);
        return response()->json($model->fresh()->load('goal:id,title'));
    }

    public function destroy(Request $request, int $action): JsonResponse
    {
        $request->user()->actions()->findOrFail($action)->delete();
        return response()->json([], 204);
    }

    private function validated(Request $request, bool $creating = true): array
    {
        return $request->validate([
            'title' => [$creating ? 'required' : 'sometimes', 'string', 'max:180'],
            'goal_id' => ['nullable', 'integer', Rule::exists('goals', 'id')->where(fn ($q) => $q->where('user_id', $request->user()->id))],
            'status' => ['sometimes', 'in:open,completed'],
            'due_date' => ['nullable', 'date'],
        ]);
    }
}
