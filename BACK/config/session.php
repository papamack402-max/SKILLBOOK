<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    protected $table = 'course_sessions';

    protected $fillable = [
        'cours_id',
        'date_debut',
        'date_fin',
    ];

    public function cours()
    {
        return $this->belongsTo(Cours::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
