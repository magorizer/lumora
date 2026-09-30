<?php

namespace laravel\app\Http\Controllers\Api;

use laravel\app\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;use function App\Http\Controllers\Api\response;

class UserController
{
    public function profile(Request $request): JsonResponse
    {
        return response()->json($this->profileData($request->user()));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $user->fill($data)->save();

        return response()->json($this->profileData($user));
    }

    private function profileData(User $user): array
    {
        return [
            ...$user->toArray(),
            'roles' => $user->getRoleNames(),
        ];
    }
}
