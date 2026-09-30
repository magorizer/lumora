<?php

namespace laravel\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use laravel\app\Models\Goal;
use laravel\app\Models\LifeArea;
use laravel\app\Models\User;

class WeeklyReview extends Model
{
    protected $fillable = ['user_id', 'week_start', 'summary', 'focus_life_area_id', 'focus_goal_id', 'focus_note'];

    protected function casts(): array
    {
        return ['week_start' => 'date:Y-m-d', 'summary' => 'array'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function focusLifeArea(): BelongsTo { return $this->belongsTo(LifeArea::class, 'focus_life_area_id'); }
    public function focusGoal(): BelongsTo { return $this->belongsTo(Goal::class, 'focus_goal_id'); }
}
