<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Reservation::with('session.cours', 'paiement')
                ->where('user_id', $request->user()->id)

                ->get()
        );
    }

    public function store(Request $request)
    {
        // 👇 Validation de base
        $request->validate([
            'session_id' => 'required|exists:course_sessions,id',
        ]);
        // 👇 Vérifie que l'apprenant n'a pas déjà réservé cette session
        $dejaReserve = Reservation::where('user_id', $request->user()->id)
            ->where('session_id', $request->session_id)
            ->where('status', '!=', 'annulée')
            ->exists();

        if ($dejaReserve) {
            return response()->json([
                'message' => 'Vous avez déjà réservé cette session.'
            ], 422);
        }
        // 👇 Récupère le cours et vérifie les places
        $session = \App\Models\Session::with('cours')->findOrFail($request->session_id);

        if ($session->cours->nb_places <= 0) {
            return response()->json([
                'message' => 'Plus de places disponibles pour ce cours.'
            ], 422);
        }

        // 👇 Diminue le nombre de places
        $session->cours->decrement('nb_places');
        // 👇 Crée la réservation
        $reservation = Reservation::create([
            'user_id'          => $request->user()->id,
            'session_id'       => $request->session_id,
            'date_reservation' => now(),
            'nb_places_reservees'  => 1,
            'status'           => 'en_attente',
        ]);

        return response()->json($reservation, 201);
    }
    // 👇 Confirme une réservation (admin)
    public function confirmer($id)
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->update(['statut' => 'confirmée']);
        return response()->json(['message' => 'Réservation confirmée']);
    }
    // 👇 Annule une réservation (apprenant)
    public function annuler($id)
    {
        $reservation = Reservation::findOrFail($id);
        if ($reservation->status !== 'annulée') {
            $reservation->session->cours->increment('nb_places');
        }

        $reservation->update(['status' => 'annulée']);
        return response()->json(['message' => 'Réservation annulée']);
    }
}
