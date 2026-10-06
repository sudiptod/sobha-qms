<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DefectThresholdMapping extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'division_id',
        'sub_division_id',
        'activity_id',
        'sub_activity_id',
        'defect_type',
        'defect_threshold',
        'sporadic_threshold',
        'chronic_threshold',
        'severity_index',
        'control_index',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function subDivision(): BelongsTo
    {
        return $this->belongsTo(SubDivision::class);
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function subActivity(): BelongsTo
    {
        return $this->belongsTo(SubActivity::class);
    }

    /**
     * Scope a query to apply the 7 cascading dropdown filters and global search.
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when($filters['search'] ?? null, function (Builder $q, string $search) {
                $q->where('defect_type', 'like', '%' . $search . '%');
            })
            ->when($filters['project_id'] ?? null, fn (Builder $q, $v) => $q->where('project_id', $v))
            ->when($filters['division_id'] ?? null, fn (Builder $q, $v) => $q->where('division_id', $v))
            ->when($filters['sub_division_id'] ?? null, fn (Builder $q, $v) => $q->where('sub_division_id', $v))
            ->when($filters['activity_id'] ?? null, fn (Builder $q, $v) => $q->where('activity_id', $v))
            ->when($filters['sub_activity_id'] ?? null, fn (Builder $q, $v) => $q->where('sub_activity_id', $v))
            ->when($filters['severity_index'] ?? null, fn (Builder $q, $v) => $q->where('severity_index', $v))
            ->when($filters['control_index'] ?? null, fn (Builder $q, $v) => $q->where('control_index', $v));
    }
}
