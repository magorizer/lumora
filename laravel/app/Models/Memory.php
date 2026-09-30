<?php

namespace laravel\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use laravel\app\Models\User;

class Memory extends Model
{
    protected $fillable = ['user_id', 'category', 'title', 'content', 'is_pinned'];

    protected function casts(): array
    {
        return ['is_pinned' => 'boolean'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
