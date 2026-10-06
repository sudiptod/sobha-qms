<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'sub_division_id',
        'name',
        'description',
        'total_sub_activities_override',
        'scheduled_date',
        'scheduled_time',
    ];

    public function subDivision(): BelongsTo
    {
        return $this->belongsTo(SubDivision::class);
    }

    public function subActivities(): HasMany
    {
        return $this->hasMany(SubActivity::class);
    }
}
