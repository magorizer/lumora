<?php

namespace laravel\app\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use laravel\app\Models\User;

class Pattern extends Model
{
    protected $fillable = [
        'user_id', 'fingerprint', 'type', 'title', 'summary', 'evidence', 'confidence', 'status', 'last_detected_at',
    ];

    protected function casts(): array
    {
        return ['evidence' => 'array', 'confidence' => 'integer', 'last_detected_at' => 'datetime'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
