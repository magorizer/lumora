<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('life_areas', function (Blueprint $table): void {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('user_preferences', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('reflection_style')->default('balanced');
            $table->string('timezone', 80)->default('UTC');
            $table->boolean('reminders_enabled')->default(false);
            $table->timestamp('onboarding_completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('user_life_areas', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('life_area_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('priority')->default(0);
            $table->timestamps();
            $table->unique(['user_id', 'life_area_id']);
        });

        Schema::create('goals', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('life_area_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 160);
            $table->text('why')->nullable();
            $table->unsignedTinyInteger('progress')->default(0);
            $table->string('status')->default('active');
            $table->date('target_date')->nullable();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('checkins', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('checkin_date');
            $table->string('mood', 40);
            $table->unsignedTinyInteger('energy');
            $table->json('energizers')->nullable();
            $table->json('drainers')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'checkin_date']);
        });

        Schema::create('checkin_life_area', function (Blueprint $table): void {
            $table->foreignId('checkin_id')->constrained()->cascadeOnDelete();
            $table->foreignId('life_area_id')->constrained()->cascadeOnDelete();
            $table->primary(['checkin_id', 'life_area_id']);
        });

        Schema::create('checkin_goal', function (Blueprint $table): void {
            $table->foreignId('checkin_id')->constrained()->cascadeOnDelete();
            $table->foreignId('goal_id')->constrained()->cascadeOnDelete();
            $table->primary(['checkin_id', 'goal_id']);
        });

        Schema::create('memories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('category', 40)->default('insight');
            $table->string('title', 160)->nullable();
            $table->text('content');
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();
            $table->index(['user_id', 'category']);
        });

        Schema::create('actions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('goal_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 180);
            $table->string('status')->default('open');
            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('patterns', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('fingerprint')->unique();
            $table->string('type', 60);
            $table->string('title', 180);
            $table->text('summary');
            $table->json('evidence');
            $table->unsignedTinyInteger('confidence')->default(50);
            $table->string('status')->default('active');
            $table->timestamp('last_detected_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('weekly_reviews', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('week_start');
            $table->json('summary');
            $table->foreignId('focus_life_area_id')->nullable()->constrained('life_areas')->nullOnDelete();
            $table->foreignId('focus_goal_id')->nullable()->constrained('goals')->nullOnDelete();
            $table->text('focus_note')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'week_start']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_reviews');
        Schema::dropIfExists('patterns');
        Schema::dropIfExists('actions');
        Schema::dropIfExists('memories');
        Schema::dropIfExists('checkin_goal');
        Schema::dropIfExists('checkin_life_area');
        Schema::dropIfExists('checkins');
        Schema::dropIfExists('goals');
        Schema::dropIfExists('user_life_areas');
        Schema::dropIfExists('user_preferences');
        Schema::dropIfExists('life_areas');
    }
};
