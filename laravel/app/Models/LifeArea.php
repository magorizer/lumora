<?php

namespace laravel\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use laravel\app\Models\User;

class LifeArea extends Model
{
    protected $fillable = ['slug', 'name', 'icon', 'sort_order'];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_life_areas')->withPivot('priority')->withTimestamps();
    }
}
