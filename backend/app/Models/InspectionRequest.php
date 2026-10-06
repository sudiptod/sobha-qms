<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InspectionRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'ir_number',
        'project_id',
        'activity_id',
        'sub_activity_id',
        'foreman_id',
        'location_unit',
        'status',
        'defects_logged',
        'requested_date',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function subActivity(): BelongsTo
    {
        return $this->belongsTo(SubActivity::class);
    }

    public function foreman(): BelongsTo
    {
        return $this->belongsTo(Foreman::class);
    }
}
