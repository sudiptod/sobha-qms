<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubDivision extends Model
{
    use HasFactory;

    protected $fillable = [
        'division_id',
        'name',
    ];

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }
}
