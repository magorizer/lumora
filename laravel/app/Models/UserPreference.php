<?php

namespace laravel\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use laravel\app\Models\User;

class UserPreference extends Model
{
    protected $fillable = ['user_id', 'reflection_style', 'timezone', 'reminders_enabled', 'onboarding_completed_at'];

    protected function casts(): array
    {
        return [
            'reminders_enabled' => 'boolean',
            'onboarding_completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
