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
        $request->validate([
            'session_id' => 'required|exists:course_sessions,id',
        ]);

        $dejaReserve = Reservation::where('user_id', $request->user()->id)
            ->where('session_id', $request->session_id)
            ->where('status', '!=', 'annulée')
            ->exists();

        if ($dejaReserve) {
            return response()->json([
                'message' => 'Vous avez déjà réservé cette session.'
            ], 422);
        }

        $reservation = Reservation::create([
            'user_id'          => $request->user()->id,
            'session_id'       => $request->session_id,
            'date_reservation' => now(),
            'nb_places_reservees'  => 1,
            'status'           => 'en_attente',
        ]);

        return response()->json($reservation, 201);
    }

    public function confirmer($id)
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->update(['statut' => 'confirmée']);
        return response()->json(['message' => 'Réservation confirmée']);
    }

    public function annuler($id)
    {
        $reservation = Reservation::findOrFail($id);
        $reservation->update(['status' => 'annulée']);
        return response()->json(['message' => 'Réservation annulée']);
    }
}
