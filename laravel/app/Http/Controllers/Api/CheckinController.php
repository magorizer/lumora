<?php

namespace laravel\app\Http\Controllers\Api;

use laravel\app\Models\Checkin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;use function App\Http\Controllers\Api\response;

class CheckinController
{
    public function index(Request $request): JsonResponse
    {
        $limit = min(90, max(1, (int) $request->integer('limit', 30)));
        return response()->json(
            $request->user()->checkins()
                ->with(['lifeAreas:id,name,slug,icon', 'goals:id,title'])
                ->latest('checkin_date')
                ->limit($limit)
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $user = $request->user();

        $checkin = DB::transaction(function () use ($user, $data): Checkin {
            $lifeAreas = $data['life_area_ids'] ?? [];
            $goals = $data['goal_ids'] ?? [];
            unset($data['life_area_ids'], $data['goal_ids']);
            $checkin = $user->checkins()->updateOrCreate(['checkin_date' => $data['checkin_date']], $data);
            $checkin->lifeAreas()->sync($lifeAreas);
            $checkin->goals()->sync($goals);
            return $checkin;
        });

        return response()->json($checkin->load(['lifeAreas:id,name,slug,icon', 'goals:id,title']), 201);
    }

    public function update(Request $request, int $checkin): JsonResponse
    {
        $model = $request->user()->checkins()->findOrFail($checkin);
        $data = $this->validated($request, false, $model->id);
        DB::transaction(function () use ($model, $data): void {
            if (array_key_exists('life_area_ids', $data)) {
                $model->lifeAreas()->sync($data['life_area_ids']);
            }
            if (array_key_exists('goal_ids', $data)) {
                $model->goals()->sync($data['goal_ids']);
            }
            unset($data['life_area_ids'], $data['goal_ids']);
            $model->update($data);
        });
        return response()->json($model->fresh()->load(['lifeAreas:id,name,slug,icon', 'goals:id,title']));
    }

    public function destroy(Request $request, int $checkin): JsonResponse
    {
        $request->user()->checkins()->findOrFail($checkin)->delete();
        return response()->json([], 204);
    }

    private function validated(Request $request, bool $creating = true, ?int $ignoreId = null): array
    {
        return $request->validate([
            'checkin_date' => [
                $creating ? 'required' : 'sometimes',
                'date',
                Rule::unique('checkins', 'checkin_date')->where(fn ($q) => $q->where('user_id', $request->user()->id))->ignore($ignoreId),
            ],
            'mood' => [$creating ? 'required' : 'sometimes', 'in:calm,tense,tired,energized,scattered,hopeful,low,content'],
            'energy' => [$creating ? 'required' : 'sometimes', 'integer', 'min:1', 'max:5'],
            'energizers' => ['nullable', 'array', 'max:8'],
            'energizers.*' => ['string', 'max:80'],
            'drainers' => ['nullable', 'array', 'max:8'],
            'drainers.*' => ['string', 'max:80'],
            'note' => ['nullable', 'string', 'max:5000'],
            'life_area_ids' => ['sometimes', 'array', 'max:6'],
            'life_area_ids.*' => ['integer', 'exists:life_areas,id'],
            'goal_ids' => ['sometimes', 'array', 'max:3'],
            'goal_ids.*' => [
                'integer',
                Rule::exists('goals', 'id')->where(fn ($q) => $q->where('user_id', $request->user()->id)),
            ],
        ]);
    }
}
