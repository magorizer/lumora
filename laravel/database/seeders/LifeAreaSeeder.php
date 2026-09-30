<?php

namespace laravel\database\seeders;

use laravel\app\Models\LifeArea;
use Illuminate\Database\Seeder;

class LifeAreaSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            ['slug' => 'work', 'name' => 'Work', 'icon' => 'briefcase-outline'],
            ['slug' => 'relationships', 'name' => 'Relationships', 'icon' => 'people-outline'],
            ['slug' => 'health', 'name' => 'Health', 'icon' => 'heart-outline'],
            ['slug' => 'money', 'name' => 'Money', 'icon' => 'wallet-outline'],
            ['slug' => 'personal-growth', 'name' => 'Personal growth', 'icon' => 'leaf-outline'],
            ['slug' => 'spirituality', 'name' => 'Spirituality', 'icon' => 'sparkles-outline'],
            ['slug' => 'rest', 'name' => 'Rest & recovery', 'icon' => 'moon-outline'],
            ['slug' => 'other', 'name' => 'Other', 'icon' => 'ellipse-outline'],
        ];

        foreach ($areas as $index => $area) {
            LifeArea::query()->updateOrCreate(
                ['slug' => $area['slug']],
                [...$area, 'sort_order' => $index + 1],
            );
        }
    }
}
