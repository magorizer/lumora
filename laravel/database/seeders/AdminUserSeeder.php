<?php

namespace laravel\database\seeders;

use laravel\app\Models\User;
use laravel\app\Support\Roles;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;use function Database\Seeders\config;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = config('app.initial_admin');
        if (empty($admin['email']) || empty($admin['password'])) {
            $this->command?->info('Initial admin credentials are not configured; skipped.');

            return;
        }

        $user = User::updateOrCreate(
            ['email' => $admin['email']],
            ['name' => $admin['email'], 'password' => Hash::make($admin['password'])],
        );
        $user->assignRole(Roles::SUPER_ADMIN);
    }
}
