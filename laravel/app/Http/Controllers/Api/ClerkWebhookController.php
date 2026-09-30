<?php

namespace laravel\app\Http\Controllers\Api;

use laravel\app\Models\User;
use laravel\app\Support\ClerkEvents;
use laravel\app\Support\Roles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Svix\Exception\WebhookVerificationException;
use Svix\Webhook;use function App\Http\Controllers\Api\collect;use function App\Http\Controllers\Api\config;use function App\Http\Controllers\Api\response;

class ClerkWebhookController
{
    public function handle(Request $request): mixed
    {
        $secret = config('services.clerk.webhook_secret');
        if (!$secret) {
            Log::error('Clerk webhook secret is not configured.');

            return response()->json(['error' => 'Webhook not configured'], 500);
        }

        try {
            $event = (new Webhook($secret))->verify($request->getContent(), $this->headers($request));
        } catch (WebhookVerificationException) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        return match ($event['type'] ?? null) {
            ClerkEvents::CREATED => $this->created($event['data'] ?? []),
            ClerkEvents::UPDATED => $this->updated($event['data'] ?? []),
            ClerkEvents::DELETED => $this->deleted($event['data'] ?? []),
            default => response()->noContent(),
        };
    }

    private function headers(Request $request): array
    {
        return collect($request->headers->all())
            ->map(fn (array $values): string => $values[0] ?? '')
            ->all();
    }

    private function created(array $data): mixed
    {
        $clerkId = $data['id'] ?? null;
        $email = $this->primaryEmail($data);
        if (!$clerkId || !$email) {
            return response()->json(['error' => 'Email is required'], 422);
        }

        $existing = User::where('email', $email)->first();
        if ($existing) {
            if (!$existing->clerk_user_id) {
                $existing->update([
                    'clerk_user_id' => $clerkId,
                    'first_name' => $data['first_name'] ?? $existing->first_name,
                    'last_name' => $data['last_name'] ?? $existing->last_name,
                    'avatar' => $data['image_url'] ?? $existing->avatar,
                ]);
                $existing->assignRole(Roles::USER);

                return response()->json(['message' => 'User linked']);
            }

            if ($existing->clerk_user_id !== $clerkId) {
                Log::warning('Clerk user email already belongs to another Clerk user.', ['user_id' => $existing->id]);
            }

            return response()->json(['message' => 'User already exists']);
        }

        $user = User::create([
            'clerk_user_id' => $clerkId,
            'email' => $email,
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'avatar' => $data['image_url'] ?? null,
            'name' => $this->name($data, $email),
            'password' => null,
        ]);
        $user->assignRole(Roles::USER);

        return response()->json(['message' => 'User created']);
    }

    private function updated(array $data): mixed
    {
        $user = User::where('clerk_user_id', $data['id'] ?? null)->first();
        if (!$user) {
            return response()->noContent();
        }

        $email = $this->primaryEmail($data) ?? $user->email;
        $user->update([
            'email' => $email,
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'avatar' => $data['image_url'] ?? null,
            'name' => $this->name($data, $email),
        ]);

        return response()->noContent();
    }

    private function deleted(array $data): mixed
    {
        $user = User::where('clerk_user_id', $data['id'] ?? null)->first();
        $user?->delete();

        return response()->noContent();
    }

    private function primaryEmail(array $data): ?string
    {
        $emails = $data['email_addresses'] ?? [];
        if (!is_array($emails)) {
            return null;
        }

        $primaryId = $data['primary_email_address_id'] ?? null;
        foreach ($emails as $email) {
            if (is_array($email) && ($email['id'] ?? null) === $primaryId) {
                return $email['email_address'] ?? null;
            }
        }

        $first = $emails[0] ?? null;

        return is_array($first) ? ($first['email_address'] ?? null) : null;
    }

    private function name(array $data, string $email): string
    {
        $fullName = trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? ''));
        if (!empty($data['username'])) {
            return $data['username'];
        }

        return $fullName ?: $email;
    }
}
