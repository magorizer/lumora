<?php

namespace laravel\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use laravel\app\Models\Goal;
use laravel\app\Models\User;

class ActionItem extends Model
{
    protected $table = 'actions';

    protected $fillable = ['user_id', 'goal_id', 'title', 'status', 'due_date', 'completed_at'];

    protected function casts(): array
    {
        return ['due_date' => 'date:Y-m-d', 'completed_at' => 'datetime'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function goal(): BelongsTo { return $this->belongsTo(Goal::class); }
}
