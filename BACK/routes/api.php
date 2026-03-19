<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CoursController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\SessionController;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/cours',     [CoursController::class, 'index']);
Route::get('/cours/{id}', [CoursController::class, 'show']);
Route::get('/cours/{id}/sessions', [SessionController::class, 'index']);
Route::get('/mes-cours', [CoursController::class, 'mesCours']);


// Routes protégées
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Admin Pour la validation des cours Les cours en attente de validation et la gestion des utilisateurs
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::post('/cours/{id}/valider', [CoursController::class, 'valider']);
        Route::get('/cours', [CoursController::class, 'indexAdmin']);
        Route::post('/cours/{id}/rejeter', [CoursController::class, 'rejeter']);
    });

    // Formateur Pour la gestion de ses cours et sessions
    Route::middleware('role:formateur')->prefix('formateur')->group(function () {
        Route::post('/cours',        [CoursController::class, 'store']);
        Route::put('/cours/{id}',    [CoursController::class, 'update']);
        Route::delete('/cours/{id}', [CoursController::class, 'destroy']);
        Route::get('/cours/{id}/sessions', [SessionController::class, 'index']);
        Route::post('/sessions', [SessionController::class, 'store']);
        Route::delete('/sessions/{id}', [SessionController::class, 'destroy']);
        Route::get('/mes-cours', [CoursController::class, 'mesCours']);
    });

    // Apprenant Pour les réservations et paiements
    Route::middleware('role:apprenant')->prefix('apprenant')->group(function () {
        Route::get('/reservations',              [ReservationController::class, 'index']);
        Route::post('/reservations',             [ReservationController::class, 'store']);
        Route::put('/reservations/{id}/annuler', [ReservationController::class, 'annuler']);
        Route::post('/paiements',                [PaiementController::class, 'effectuer']);
        Route::get('/paiements', [PaiementController::class, 'mesPaiements']);
    });
});
