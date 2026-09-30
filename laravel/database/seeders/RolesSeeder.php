<?php

namespace laravel\database\seeders;

use laravel\app\Support\Roles;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Roles::all() as $role) {
            Role::firstOrCreate(['name' => $role]);
        }
    }
}
