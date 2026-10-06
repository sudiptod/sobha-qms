<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Foreman extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'employee_code',
        'role',
        'trade',
        'phone',
        'project_name',
        'active_inspections',
    ];

    public function inspectionRequests(): HasMany
    {
        return $this->hasMany(InspectionRequest::class);
    }
}
