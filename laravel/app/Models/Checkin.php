<?php

namespace laravel\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use laravel\app\Models\Goal;
use laravel\app\Models\LifeArea;
use laravel\app\Models\User;

class Checkin extends Model
{
    protected $fillable = ['user_id', 'checkin_date', 'mood', 'energy', 'energizers', 'drainers', 'note'];

    protected function casts(): array
    {
        return [
            'checkin_date' => 'date:Y-m-d',
            'energy' => 'integer',
            'energizers' => 'array',
            'drainers' => 'array',
        ];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function lifeAreas(): BelongsToMany { return $this->belongsToMany(LifeArea::class, 'checkin_life_area'); }
    public function goals(): BelongsToMany { return $this->belongsToMany(Goal::class, 'checkin_goal'); }
}
