<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for the SOBHA Construction Quality & Defect Management System.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('location');
            $table->string('status')->default('Active');
            $table->timestamps();
        });

        Schema::create('divisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('sub_divisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('division_id')->constrained('divisions')->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sub_division_id')->nullable()->constrained('sub_divisions')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('total_sub_activities_override')->nullable();
            $table->string('scheduled_date')->default('1 Dec 2023');
            $table->string('scheduled_time')->default('11:00PM');
            $table->timestamps();
        });

        Schema::create('sub_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained('activities')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('insp_req_count')->default(0);
            $table->string('scheduled_date')->default('18 Nov 2023');
            $table->string('scheduled_time')->default('11:00PM');
            $table->timestamps();
        });

        Schema::create('defect_threshold_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->foreignId('division_id')->nullable()->constrained('divisions')->nullOnDelete();
            $table->foreignId('sub_division_id')->nullable()->constrained('sub_divisions')->nullOnDelete();
            $table->foreignId('activity_id')->nullable()->constrained('activities')->nullOnDelete();
            $table->foreignId('sub_activity_id')->nullable()->constrained('sub_activities')->nullOnDelete();
            $table->string('defect_type');
            $table->integer('defect_threshold')->default(50);
            $table->integer('sporadic_threshold')->default(5);
            $table->integer('chronic_threshold')->default(15);
            $table->integer('severity_index')->default(5);
            $table->integer('control_index')->default(5);
            $table->timestamps();

            $table->index(['project_id', 'division_id', 'sub_division_id']);
            $table->index(['activity_id', 'sub_activity_id']);
            $table->index(['severity_index', 'control_index']);
        });

        Schema::create('foremen', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('employee_code')->unique();
            $table->string('role')->default('Site Foreman');
            $table->string('trade');
            $table->string('phone');
            $table->string('project_name')->nullable();
            $table->integer('active_inspections')->default(0);
            $table->timestamps();
        });

        Schema::create('inspection_requests', function (Blueprint $table) {
            $table->id();
            $table->string('ir_number')->unique();
            $table->foreignId('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->foreignId('activity_id')->nullable()->constrained('activities')->nullOnDelete();
            $table->foreignId('sub_activity_id')->nullable()->constrained('sub_activities')->nullOnDelete();
            $table->foreignId('foreman_id')->nullable()->constrained('foremen')->nullOnDelete();
            $table->string('location_unit');
            $table->string('status')->default('Pending'); // Pending, In Review, Approved, Rejected
            $table->integer('defects_logged')->default(0);
            $table->string('requested_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspection_requests');
        Schema::dropIfExists('foremen');
        Schema::dropIfExists('defect_threshold_mappings');
        Schema::dropIfExists('sub_activities');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('sub_divisions');
        Schema::dropIfExists('divisions');
        Schema::dropIfExists('projects');
    }
};
