<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'activity_id',
        'name',
        'description',
        'insp_req_count',
        'scheduled_date',
        'scheduled_time',
    ];

    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function inspectionRequests(): HasMany
    {
        return $this->hasMany(InspectionRequest::class);
    }

    public function defectThresholdMappings(): HasMany
    {
        return $this->hasMany(DefectThresholdMapping::class);
    }
}
