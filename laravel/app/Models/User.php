<?php

namespace laravel\app\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use laravel\app\Models\WeeklyReview;
use laravel\app\Support\Roles;
use laravel\app\Models\LifeArea;
use laravel\database\factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use laravel\app\Models\ActionItem;
use laravel\app\Models\Checkin;
use laravel\app\Models\Goal;
use laravel\app\Models\Memory;
use laravel\app\Models\Pattern;
use laravel\app\Models\UserPreference;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'clerk_user_id',
        'name',
        'email',
        'password',
        'first_name',
        'last_name',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'clerk_user_id',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }


    public function preference(): HasOne
    {
        return $this->hasOne(UserPreference::class);
    }

    public function lifeAreas(): BelongsToMany
    {
        return $this->belongsToMany(LifeArea::class, 'user_life_areas')->withPivot('priority')->withTimestamps();
    }

    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    public function checkins(): HasMany
    {
        return $this->hasMany(Checkin::class);
    }

    public function memories(): HasMany
    {
        return $this->hasMany(Memory::class);
    }

    public function actions(): HasMany
    {
        return $this->hasMany(ActionItem::class);
    }

    public function patterns(): HasMany
    {
        return $this->hasMany(Pattern::class);
    }

    public function weeklyReviews(): HasMany
    {
        return $this->hasMany(WeeklyReview::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(Roles::SUPER_ADMIN);
    }
}
