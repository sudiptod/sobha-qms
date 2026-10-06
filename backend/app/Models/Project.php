<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'location',
        'status',
    ];

    public function divisions(): HasMany
    {
        return $this->hasMany(Division::class);
    }

    public function defectThresholdMappings(): HasMany
    {
        return $this->hasMany(DefectThresholdMapping::class);
    }
}
