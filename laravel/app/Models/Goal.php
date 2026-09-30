<?php

namespace laravel\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use laravel\app\Models\ActionItem;
use laravel\app\Models\Checkin;
use laravel\app\Models\LifeArea;
use laravel\app\Models\User;

class Goal extends Model
{
    protected $fillable = ['user_id', 'life_area_id', 'title', 'why', 'progress', 'status', 'target_date', 'archived_at'];

    protected function casts(): array
    {
        return ['target_date' => 'date', 'archived_at' => 'datetime', 'progress' => 'integer'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function lifeArea(): BelongsTo { return $this->belongsTo(LifeArea::class); }
    public function actions(): HasMany { return $this->hasMany(ActionItem::class); }
    public function checkins(): BelongsToMany { return $this->belongsToMany(Checkin::class, 'checkin_goal'); }
}
