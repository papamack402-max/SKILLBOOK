<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use App\Models\Reservation;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    public function effectuer(Request $request)
    {
        $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'methode'        => 'required|in:carte,mobile_money,virement',
        ]);

        // Vérifie que la réservation appartient bien à cet apprenant
        $reservation = Reservation::where('id', $request->reservation_id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        // Vérifie qu'il n'y a pas déjà un paiement
        $dejaPaye = Paiement::where('reservation_id', $request->reservation_id)
            ->where('status', 'confirme')
            ->exists();

        if ($dejaPaye) {
            return response()->json([
                'message' => 'Cette réservation est déjà payée.'
            ], 422);
        }

        // Récupère le montant depuis le cours
        $montant = $reservation->session->cours->prix;

        $paiement = Paiement::create([
            'reservation_id' => $request->reservation_id,
            'montant'        => $montant,
            'date_paiement'  => now(),
            'methode'        => $request->methode,
            'status'         => 'confirme',
        ]);

        // Confirme automatiquement la réservation
        $reservation->update(['status' => 'confirmée']);

        return response()->json($paiement, 201);
    }

    public function rembourser($id)
    {
        $paiement = Paiement::findOrFail($id);
        $paiement->update(['status' => 'remboursé']);
        return response()->json(['message' => 'Paiement remboursé']);
    }

    public function mesPaiements(Request $request)
    {
        $paiements = Paiement::whereHas('reservation', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->with('reservation.session.cours')->get();

        return response()->json($paiements);
    }
}
