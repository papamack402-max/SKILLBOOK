<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    public function cours(){
       return $this->hasMany(Cours::class); //une catégorie peut avoir plusieurs cours
    }
}
