<?php

namespace laravel\app\Http\Middleware;

use laravel\app\Models\User;
use Closure;
use Exception;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;use function App\Http\Middleware\config;use function App\Http\Middleware\now;use function App\Http\Middleware\response;

class ClerkAuth
{
    public function handle(Request $request, Closure $next): mixed
    {
        $jwt = $request->bearerToken();
        if (!$jwt) {
            return $this->unauthorized('Unauthorized');
        }

        $kid = $this->parseKeyId($jwt);
        if (!$kid) {
            return $this->unauthorized('Invalid token');
        }

        $jwks = $this->loadKeyset();
        if (!$this->hasKey($jwks, $kid)) {
            $jwks = $this->refreshKeyset($kid, $jwks);
        }
        if (!$this->hasKey($jwks, $kid)) {
            return $this->unauthorized('Invalid token');
        }

        $claims = $this->decodeToken($jwt, $jwks);
        if (!$claims || !isset($claims->sub) || !is_string($claims->sub)) {
            return $this->unauthorized('Invalid token');
        }

        $user = User::where('clerk_user_id', $claims->sub)->first();
        if (!$user) {
            return response()->json([
                'status' => 'validation_failed',
                'message' => 'User not found',
                'errors' => 'user_not_found',
            ], 403);
        }

        $request->setUserResolver(fn (): User => $user);

        return $next($request);
    }

    private function parseKeyId(string $jwt): ?string
    {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            return null;
        }

        try {
            $header = json_decode(JWT::urlsafeB64Decode($parts[0]), true, 512, JSON_THROW_ON_ERROR);
        } catch (Exception) {
            return null;
        }

        $kid = $header['kid'] ?? null;

        return is_string($kid) && $kid !== '' && strlen($kid) <= 255 ? $kid : null;
    }

    private function loadKeyset(): ?array
    {
        $url = config('services.clerk.jwks_url');
        if (!$url) {
            if (Cache::add('clerk.jwks.config_error', true, now()->addHour())) {
                Log::error('Clerk JWKS URL is not configured.');
            }

            return null;
        }

        $keyset = $this->withLock(fn (): ?array => Cache::remember(
            'clerk.jwks',
            now()->addHour(),
            fn (): ?array => $this->fetchKeyset($url),
        ));

        return $keyset ?? Cache::get('clerk.jwks');
    }

    private function refreshKeyset(string $kid, ?array $jwks): ?array
    {
        if (Cache::has('clerk.jwks.cooldown')) {
            return $jwks;
        }

        $keyset = $this->withLock(function () use ($kid, $jwks): ?array {
            $current = Cache::get('clerk.jwks', $jwks);
            if ($this->hasKey($current, $kid) || !Cache::add('clerk.jwks.cooldown', true, now()->addMinute())) {
                return $current;
            }

            $fresh = $this->fetchKeyset(config('services.clerk.jwks_url'));
            if ($fresh) {
                Cache::put('clerk.jwks', $fresh, now()->addHour());

                return $fresh;
            }

            return $current;
        });

        return $keyset ?? Cache::get('clerk.jwks', $jwks);
    }

    private function withLock(Closure $callback): mixed
    {
        try {
            return Cache::lock('clerk.jwks.lock', 10)->block(10, $callback);
        } catch (LockTimeoutException) {
            return null;
        }
    }

    private function fetchKeyset(?string $url): ?array
    {
        if (!$url) {
            return null;
        }

        $response = Http::timeout(5)->acceptJson()->get($url);
        $jwks = $response->successful() ? $response->json() : null;

        return $this->isValidKeyset($jwks) ? $jwks : null;
    }

    private function hasKey(?array $jwks, string $kid): bool
    {
        if (!$this->isValidKeyset($jwks)) {
            return false;
        }

        return in_array($kid, array_column($jwks['keys'], 'kid'), true);
    }

    private function isValidKeyset(mixed $jwks): bool
    {
        return is_array($jwks) && isset($jwks['keys']) && is_array($jwks['keys']) && $jwks['keys'] !== [];
    }

    private function decodeToken(string $jwt, ?array $jwks): ?object
    {
        try {
            return JWT::decode($jwt, JWK::parseKeySet($jwks ?? []));
        } catch (ExpiredException|SignatureInvalidException|Exception) {
            return null;
        }
    }

    private function unauthorized(string $error): mixed
    {
        return response()->json(['error' => $error], 401);
    }
}
