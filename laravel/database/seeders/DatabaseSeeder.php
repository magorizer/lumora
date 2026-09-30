<?php

namespace laravel\database\seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use laravel\database\seeders\AdminUserSeeder;
use laravel\database\seeders\LifeAreaSeeder;
use laravel\database\seeders\RolesSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,
            LifeAreaSeeder::class,
            AdminUserSeeder::class,
        ]);
    }
}
