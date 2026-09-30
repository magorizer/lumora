<?php

namespace laravel\app\Contracts;

use laravel\app\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

interface InsightEngine
{
    /** @return Collection<int, array<string, mixed>> */
    public function detect(User $user, CarbonImmutable $from, CarbonImmutable $to): Collection;
}
