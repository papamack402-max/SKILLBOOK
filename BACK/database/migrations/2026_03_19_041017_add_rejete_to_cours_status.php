<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE cours MODIFY status ENUM('brouillon', 'publié', 'archivé', 'rejeté') DEFAULT 'brouillon'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE cours MODIFY status ENUM('brouillon', 'publié', 'archivé') DEFAULT 'brouillon'");
    }
};
