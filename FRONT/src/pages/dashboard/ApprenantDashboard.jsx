import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';


//useState pour gérer les données et l'état de l'interface,
// // useEffect pour charger les données au montage du composant,
//  useCallback pour mémoriser la fonction de chargement des données et éviter les rechargements inutiles.
//  Le composant affiche une sidebar avec des liens vers les différentes sections (cours, réservations, paiements) et un contenu principal qui change en fonction de l'onglet actif.
//  Les utilisateurs peuvent réserver des sessions de cours, effectuer des paiements et annuler des réservations directement depuis le dashboard.
export default function ApprenantDashboard() {
    const [activeTab, setActiveTab] = useState('cours');
    const [cours, setCours] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [sessions, setSessions] = useState({});
    const [paiements, setPaiements] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();

// La fonction fetchData utilise useCallback pour éviter de se recréer à chaque rendu,
//  ce qui pourrait entraîner des boucles infinies dans useEffect. Elle charge les cours, les réservations et les paiements en parallèle grâce à Promise.all.
    const fetchData = useCallback(async () => {
        try {
            const [coursRes, resaRes, paiementsRes] = await Promise.all([
                api.get('/cours'),
                api.get('/apprenant/reservations'),
                api.get('/apprenant/paiements'),
            ]);
            setCours(coursRes.data);
            setReservations(resaRes.data);
            setPaiements(paiementsRes.data);
        } catch {
            console.error('Erreur chargement');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 4000);
    };
//
    const fetchSessions = async (coursId) => {
        if (sessions[coursId]) return;
        try {
            const res = await api.get(`/cours/${coursId}/sessions`);
            setSessions(prev => ({ ...prev, [coursId]: res.data }));
        } catch { console.error('Erreur sessions'); }
    };
// La fonction handleReserver gère la réservation d'une session. Elle envoie une requête POST à l'API et met à jour les réservations en cas de succès. En cas d'erreur, elle affiche un message approprié.
    const handleReserver = async (sessionId) => {
        try {
            const res = await api.post('/apprenant/reservations', { session_id: sessionId });
            showMessage('✅ Réservation effectuée !');
            setReservations(prev => [...prev, res.data]);
        } catch (err) {
            if (err.response?.status === 422) {
                showMessage('⚠️ Déjà réservé !', 'warning');
            } else {
                showMessage('❌ Erreur réservation', 'error');
            }
        }
    };

    const handlePayer = async (reservationId, methode) => {
        try {
            await api.post('/apprenant/paiements', { reservation_id: reservationId, methode });
            showMessage('✅ Paiement effectué !');
            fetchData();
        } catch (err) {
            if (err.response?.status === 422) {
                showMessage('⚠️ ' + err.response.data.message, 'warning');
            } else {
                showMessage('❌ Erreur paiement', 'error');
            }
        }
    };

    const handleAnnuler = async (id) => {
        if (!confirm('Annuler cette réservation ?')) return;
        try {
            await api.put(`/apprenant/reservations/${id}/annuler`);
            showMessage('✅ Réservation annulée');
            setReservations(prev => prev.filter(r => r.id !== id));
        } catch {
            showMessage('❌ Erreur annulation', 'error');
        }
    };

    const reservationsActives = reservations.filter(r => r.status !== 'annulée');

    const menuItems = [
        { id: 'cours', label: 'Tous les cours', icon: '📚', count: cours.length },
        { id: 'reservations', label: 'Mes réservations', icon: '📅', count: reservationsActives.length },
        { id: 'paiements', label: 'Mes paiements', icon: '💳', count: paiements.filter(p => p.status === 'confirme').length },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-indigo-900 min-h-screen transition-all duration-300 flex flex-col`}>

                {/* Logo */}
                <div className="p-4 flex items-center gap-3 border-b border-indigo-800">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🎓</span>
                    </div>
                    {sidebarOpen && (
                        <div>
                            <p className="text-white font-bold text-sm">EduPlateforme</p>
                            <p className="text-indigo-300 text-xs">Apprenant</p>
                        </div>
                    )}
                </div>

                {/* Avatar utilisateur */}
                {sidebarOpen && (
                    <div className="p-4 border-b border-indigo-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                    {user.nom.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">{user.nom}</p>
                                <p className="text-indigo-300 text-xs">{user.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Menu */}
                <nav className="flex-1 p-3 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition text-left ${
                                activeTab === item.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-indigo-300 hover:bg-indigo-800 hover:text-white'
                            }`}
                        >
                            <span className="text-xl flex-shrink-0">{item.icon}</span>
                            {sidebarOpen && (
                                <>
                                    <span className="text-sm font-medium flex-1">{item.label}</span>
                                    {item.count > 0 && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            activeTab === item.id ? 'bg-white/20 text-white' : 'bg-indigo-700 text-indigo-200'
                                        }`}>
                                            {item.count}
                                        </span>
                                    )}
                                </>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Bas sidebar */}
                <div className="p-3 border-t border-indigo-800 space-y-1">
                    <Link
                        to="/"
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-indigo-300 hover:bg-indigo-800 hover:text-white transition"
                    >
                        <span className="text-xl">🌐</span>
                        {sidebarOpen && <span className="text-sm">Site public</span>}
                    </Link>
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-indigo-300 hover:bg-red-600 hover:text-white transition"
                    >
                        <span className="text-xl">🚪</span>
                        {sidebarOpen && <span className="text-sm">Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Topbar */}
                <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="text-gray-500 hover:text-gray-700 transition"
                        >
                            ☰
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">
                                {menuItems.find(m => m.id === activeTab)?.label}
                            </h1>
                            <p className="text-gray-400 text-xs">
                                Bonjour {user.nom} 👋
                            </p>
                        </div>
                    </div>

                    {/* Stats rapides topbar */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-lg font-bold text-indigo-600">{reservationsActives.length}</p>
                            <p className="text-xs text-gray-400">Réservations</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-green-600">{paiements.filter(p => p.status === 'confirme').length}</p>
                            <p className="text-xs text-gray-400">Paiements</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-purple-600">{cours.length}</p>
                            <p className="text-xs text-gray-400">Cours dispo</p>
                        </div>
                    </div>
                </header>

                {/* Contenu */}
                <main className="flex-1 p-6 overflow-auto">

                    {/* Message */}
                    {message && (
                        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
                            messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                            messageType === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {message}
                        </div>
                    )}

                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="text-5xl mb-3 animate-bounce">⏳</div>
                                <p className="text-gray-400">Chargement...</p>
                            </div>
                        </div>
                    )}

                    {/* ===== TOUS LES COURS ===== */}
                    {activeTab === 'cours' && !loading && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {cours.map(c => (
                                    <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
                                            <h3 className="font-bold text-white text-sm relative z-10">{c.titre}</h3>
                                            <p className="text-white/70 text-xs mt-1 relative z-10">👨‍🏫 {c.formateur?.nom}</p>
                                        </div>

                                        <div className="p-5">
                                            <p className="text-gray-500 text-xs mb-4 line-clamp-2">{c.description}</p>

                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-lg font-semibold">
                                                    💰 {Number(c.prix).toLocaleString()} FCFA
                                                </span>
                                                <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-lg">
                                                    ⏱ {c.duree} min
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-lg ${
                                                    c.nb_places > 0
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-red-50 text-red-700'
                                                }`}>
                                                    👥 {c.nb_places} places
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => fetchSessions(c.id)}
                                                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium py-2.5 rounded-xl transition mb-3"
                                            >
                                                📅 Voir les sessions disponibles
                                            </button>

                                            {sessions[c.id] && sessions[c.id].length === 0 && (
                                                <p className="text-xs text-gray-400 text-center py-2 bg-gray-50 rounded-lg">
                                                    Aucune session disponible
                                                </p>
                                            )}

                                            {sessions[c.id] && sessions[c.id].map(s => {
                                                const dejaReserve = reservations.some(
                                                    r => r.session_id === s.id && r.status !== 'annulée'
                                                );
                                                return (
                                                    <div key={s.id} className="flex justify-between items-center py-2.5 px-3 bg-gray-50 rounded-xl mb-2">
                                                        <div>
                                                            <p className="text-xs font-medium text-gray-700">
                                                                📅 {new Date(s.date_debut).toLocaleDateString('fr-FR')}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                → {new Date(s.date_fin).toLocaleDateString('fr-FR')}
                                                            </p>
                                                        </div>
                                                        {dejaReserve ? (
                                                            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg">
                                                                ✅ Réservé
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleReserver(s.id)}
                                                                disabled={c.nb_places <= 0}
                                                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition"
                                                            >
                                                                Réserver
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== MES RESERVATIONS ===== */}
                    {activeTab === 'reservations' && !loading && (
                        <div>
                            {reservationsActives.length === 0 ? (
                                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">📭</div>
                                    <h3 className="text-gray-700 font-semibold mb-2">Aucune réservation</h3>
                                    <p className="text-gray-400 text-sm mb-4">Explorez les cours disponibles pour en réserver un</p>
                                    <button
                                        onClick={() => setActiveTab('cours')}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm hover:bg-indigo-700 transition"
                                    >
                                        Voir les cours →
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {reservationsActives.map(r => {
                                        const dejaPaye = paiements.some(p => p.reservation_id === r.id && p.status === 'confirme');
                                        return (
                                            <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                                {/* Bande colorée */}
                                                <div className={`h-1.5 ${r.status === 'confirmée' ? 'bg-green-400' : 'bg-yellow-400'}`} />

                                                <div className="p-5">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h3 className="font-semibold text-gray-900 text-sm flex-1 pr-2">
                                                            {r.session?.cours?.titre || 'Cours'}
                                                        </h3>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                                                            r.status === 'confirmée'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {r.status}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1.5 text-xs text-gray-500 mb-4 bg-gray-50 rounded-xl p-3">
                                                        <p>📅 Réservé le {new Date(r.date_reservation).toLocaleDateString('fr-FR')}</p>
                                                        {r.session && (
                                                            <p>🕐 Du {new Date(r.session.date_debut).toLocaleDateString('fr-FR')} au {new Date(r.session.date_fin).toLocaleDateString('fr-FR')}</p>
                                                        )}
                                                        <p className="font-semibold text-indigo-600 text-sm">
                                                            💰 {Number(r.session?.cours?.prix).toLocaleString()} FCFA
                                                        </p>
                                                    </div>

                                                    {dejaPaye ? (
                                                        <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-4 py-3 rounded-xl text-center">
                                                            ✅ Paiement confirmé
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <p className="text-xs text-gray-500 font-medium">Choisir le mode de paiement :</p>
                                                            <select
                                                                id={`methode-${r.id}`}
                                                                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                                                                defaultValue="mobile_money"
                                                            >
                                                                <option value="mobile_money">📱 Mobile Money</option>
                                                                <option value="wave">🌊 Wave</option>
                                                                <option value="carte">💳 Carte bancaire</option>
                                                                <option value="virement">🏦 Virement</option>
                                                            </select>
                                                            <button
                                                                onClick={() => {
                                                                    const methode = document.getElementById(`methode-${r.id}`).value;
                                                                    handlePayer(r.id, methode);
                                                                }}
                                                                className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2.5 rounded-xl transition"
                                                            >
                                                                💳 Payer maintenant
                                                            </button>
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => handleAnnuler(r.id)}
                                                        className="w-full mt-3 text-red-400 hover:text-red-600 text-xs py-2 rounded-xl hover:bg-red-50 transition"
                                                    >
                                                        🗑 Annuler la réservation
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== MES PAIEMENTS ===== */}
                    {activeTab === 'paiements' && !loading && (
                        <div>
                            {paiements.length === 0 ? (
                                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">💳</div>
                                    <h3 className="text-gray-700 font-semibold mb-2">Aucun paiement</h3>
                                    <p className="text-gray-400 text-sm">Vos paiements apparaîtront ici</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Cours</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Montant</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Méthode</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paiements.map((p, i) => (
                                                <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 transition ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                                                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                                        {p.reservation?.session?.cours?.titre || 'Cours'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                                                        {Number(p.montant).toLocaleString()} FCFA
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                                                        {p.methode?.replace('_', ' ')}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {new Date(p.date_paiement).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                                                            p.status === 'confirme'
                                                                ? 'bg-green-100 text-green-700'
                                                                : p.status === 'remboursé'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {p.status === 'confirme' ? '✅ Confirmé' : p.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}