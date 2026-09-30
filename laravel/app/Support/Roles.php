<?php

namespace laravel\app\Support;

final class Roles
{
    public const SUPER_ADMIN = 'super-admin';

    public const USER = 'user';

    public static function all(): array
    {
        return [self::SUPER_ADMIN, self::USER];
    }
}
