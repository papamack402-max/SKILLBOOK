import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';

// Dashboard du formateur pour gérer ses cours et sessions
export default function FormateurDashboard() {
    const [activeTab, setActiveTab] = useState('mesCours');
    const [cours, setCours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showSessionForm, setShowSessionForm] = useState(null);
    const [sessions, setSessions] = useState({});
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [recherche, setRecherche] = useState('');
    const [form, setForm] = useState({
        titre: '', description: '', prix: '', duree: '', nb_places: ''
    });
    const [sessionForm, setSessionForm] = useState({
        date_debut: '', date_fin: ''
    });
    // Permet d'afficher un message temporaire
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [editForm, setEditForm] = useState(null);
    const { user, logout } = useAuth();
// Permet de charger les cours du formateur
    const fetchCours = useCallback(async () => {
        try {
            const res = await api.get('/formateur/mes-cours');
            setCours(res.data);
        } catch {
            console.error('Erreur chargement cours');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCours(); }, [fetchCours]);
// Permet d'afficher un message temporaire
    const showMessage = (msg, type = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 4000);
    };
// Permet de charger les sessions d'un cours
    const fetchSessions = async (coursId) => {
        try {
            const res = await api.get(`/formateur/cours/${coursId}/sessions`);
            setSessions(prev => ({ ...prev, [coursId]: res.data }));
        } catch {
            console.error('Erreur chargement sessions');
        }
    };
// Permet de gérer les changements dans les formulaires
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSessionChange = (e) => setSessionForm({ ...sessionForm, [e.target.name]: e.target.value });
    // Permet de créer un cours
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/formateur/cours', form);
            showMessage('✅ Cours créé avec succès !');
            setForm({ titre: '', description: '', prix: '', duree: '', nb_places: '' });
            setShowForm(false);
            fetchCours();
        } catch {
            showMessage('❌ Erreur lors de la création', 'error');
        }
    };
    // Permet de créer une session pour un cours
    const handleSessionSubmit = async (e, coursId) => {
        e.preventDefault();
        try {
            await api.post('/formateur/sessions', {
                cours_id: coursId,
                date_debut: sessionForm.date_debut,
                date_fin: sessionForm.date_fin,
            });
            showMessage('✅ Session créée !');
            setSessionForm({ date_debut: '', date_fin: '' });
            setShowSessionForm(null);
            fetchSessions(coursId);
        } catch {
            showMessage('❌ Erreur lors de la création de session', 'error');
        }
    };
    // Permet de supprimer un cours
    const handleDelete = async (id) => {
        if (!confirm('Supprimer ce cours ?')) return;
        try {
            await api.delete(`/formateur/cours/${id}`);
            showMessage('✅ Cours supprimé');
            fetchCours();
        } catch {
            showMessage('❌ Erreur lors de la suppression', 'error');
        }
    };

    // Permet de modifier un cours en brouillon
    const handleUpdate = async (e, id) => {
        e.preventDefault();
        try {
            await api.put(`/formateur/cours/${id}`, editForm);
            showMessage('✅ Cours modifié avec succès !');
            setEditForm(null);
            fetchCours();
        } catch {
            showMessage('❌ Erreur lors de la modification', 'error');
        }
    };

    // Permet de supprimer une session
    const handleDeleteSession = async (sessionId, coursId) => {
        if (!confirm('Supprimer cette session ?')) return;
        try {
            await api.delete(`/formateur/sessions/${sessionId}`);
            fetchSessions(coursId);
        } catch {
            showMessage('❌ Erreur suppression session', 'error');
        }
    };

    const coursPublies = cours.filter(c => c.status === 'publie' || c.status === 'publié');
    const coursEnAttente = cours.filter(c => c.status === 'brouillon');
    const coursRejetes = cours.filter(c => c.status === 'rejete' || c.status === 'rejeté');
    const totalInscrits = cours.reduce((acc, c) => acc + (c.nb_inscrits || 0), 0);

    const menuItems = [
        { id: 'mesCours', label: 'Mes cours', icon: '📚', count: cours.length },
        { id: 'publies', label: 'Cours publiés', icon: '✅', count: coursPublies.length },
        { id: 'attente', label: 'En attente', icon: '⏳', count: coursEnAttente.length },
        { id: 'rejetes', label: 'Rejetés', icon: '❌', count: coursRejetes.length },
        { id: 'inscrits', label: 'Mes apprenants', icon: '👨‍🎓', count: totalInscrits },
    ];

        // Filtres de recherche
    const coursPubliesFiltres = coursPublies.filter(c =>
        c.titre.toLowerCase().includes(recherche.toLowerCase()) ||
        c.description?.toLowerCase().includes(recherche.toLowerCase())
    );

    const mesCoursFiltre = cours.filter(c =>
        c.titre.toLowerCase().includes(recherche.toLowerCase()) ||
        c.description?.toLowerCase().includes(recherche.toLowerCase())
    );



        // Composant barre de recherche
        const BarreRecherche = () => (
            <div className="relative mb-5">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                    type="text"
                    placeholder="Rechercher un cours..."
                    value={recherche}
                    onChange={e => setRecherche(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
                {recherche && (
                    <button
                        onClick={() => setRecherche('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>
        );


    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 h-screen sticky top-0 transition-all duration-300 flex flex-col flex-shrink-0`}>
                <div className="p-4 flex items-center gap-3 border-b border-indigo-800">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🎓</span>
                    </div>
                    {sidebarOpen && (
                        <div>
                            <p className="text-white font-bold text-sm">EduPlateforme</p>
                            <p className="text-indigo-300 text-xs">Formateur</p>
                        </div>
                    )}
                </div>

                {sidebarOpen && (
                    <div className="p-4 border-b border-indigo-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{user.nom.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">{user.nom}</p>
                                <p className="text-indigo-300 text-xs">Formateur</p>
                            </div>
                        </div>
                    </div>
                )}

                {sidebarOpen && (
                    <div className="p-4 border-b border-indigo-800">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-indigo-800 rounded-xl p-2 text-center">
                                <p className="text-white font-bold text-lg">{cours.length}</p>
                                <p className="text-indigo-300 text-xs">Cours</p>
                            </div>
                            <div className="bg-indigo-800 rounded-xl p-2 text-center">
                                <p className="text-yellow-400 font-bold text-lg">{totalInscrits}</p>
                                <p className="text-indigo-300 text-xs">Inscrits</p>
                            </div>
                        </div>
                    </div>
                )}

                <nav className="flex-1 p-3 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition text-left ${
                                activeTab === item.id
                                    ? 'bg-white/20 text-white'
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

                <div className="p-3 border-t border-indigo-800 space-y-1">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-indigo-300 hover:bg-red-600 hover:text-white transition">
                        <span className="text-xl">🚪</span>
                        {sidebarOpen && <span className="text-sm">Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700 transition text-xl">☰</button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">{menuItems.find(m => m.id === activeTab)?.label}</h1>
                            <p className="text-gray-400 text-xs">Dashboard Formateur</p>
                        </div>
                    </div>
                    {activeTab === 'mesCours' && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                        >
                            {showForm ? '✕ Annuler' : '+ Nouveau cours'}
                        </button>
                    )}
                </header>

                <main className="flex-1 p-6 overflow-auto">

                    {message && (
                        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
                            messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                        }`}>{message}</div>
                    )}

                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <div className="text-5xl mb-3">⏳</div>
                                <p className="text-gray-400">Chargement...</p>
                            </div>
                        </div>
                    )}

                    {/* Formulaire création */}
                    {showForm && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                            <h3 className="font-bold text-gray-900 mb-4">Créer un nouveau cours</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" name="titre" placeholder="Titre du cours" value={form.titre} onChange={handleChange} required />
                                <textarea className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none" name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
                                <div className="grid grid-cols-3 gap-4">
                                    <input className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" name="prix" type="number" placeholder="Prix (FCFA)" value={form.prix} onChange={handleChange} required />
                                    <input className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" name="duree" type="number" placeholder="Durée (min)" value={form.duree} onChange={handleChange} required />
                                    <input className="px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" name="nb_places" type="number" placeholder="Nb places" value={form.nb_places} onChange={handleChange} required />
                                </div>
                                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition text-sm">Créer le cours →</button>
                            </form>
                        </div>
                    )}

                    {/* MES COURS */}
                    {activeTab === 'mesCours' && !loading && (
                        <div>
                            <BarreRecherche />  
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"></div>
                            {cours.length === 0 ? (
                                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">📚</div>
                                    <h3 className="text-gray-700 font-semibold mb-2">Aucun cours créé</h3>
                                </div>
                            ) : mesCoursFiltre.map(c => (
                                        <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                            <div className={`h-1.5 ${c.status === 'publie' || c.status === 'publié' ? 'bg-green-400' : c.status === 'rejete' || c.status === 'rejeté' ? 'bg-red-400' : 'bg-yellow-400'}`} />
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-bold text-gray-900 text-sm flex-1 pr-2">{c.titre}</h3>
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${c.status === 'publie' || c.status === 'publié' ? 'bg-green-100 text-green-700' : c.status === 'rejete' || c.status === 'rejeté' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {c.status === 'publie' || c.status === 'publié' ? '✅ Publié' : c.status === 'rejete' || c.status === 'rejeté' ? '❌ Rejeté' : '⏳ En attente'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{c.description}</p>
                                                <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
                                                    <p className="text-xs text-gray-600">💰 <strong>{Number(c.prix).toLocaleString()} FCFA</strong></p>
                                                    <p className="text-xs text-gray-600">⏱ {c.duree} min · 👥 {c.nb_places} places restantes</p>
                                                    <p className="text-xs text-indigo-600 font-semibold">🎓 {c.nb_inscrits || 0} inscrit(s)</p>
                                                </div>
                                                <div className="border-t border-gray-100 pt-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-semibold text-gray-600">Sessions</span>
                                                        <button onClick={() => { setShowSessionForm(showSessionForm === c.id ? null : c.id); fetchSessions(c.id); }} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded-lg transition">
                                                            {showSessionForm === c.id ? '✕' : '+ Session'}
                                                        </button>
                                                    </div>
                                                    {showSessionForm === c.id && (
                                                        <form onSubmit={(e) => handleSessionSubmit(e, c.id)} className="bg-gray-50 rounded-xl p-3 mb-2 space-y-2">
                                                            <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" name="date_debut" type="datetime-local" value={sessionForm.date_debut} onChange={handleSessionChange} required />
                                                            <input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" name="date_fin" type="datetime-local" value={sessionForm.date_fin} onChange={handleSessionChange} required />
                                                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 rounded-lg transition">Créer la session</button>
                                                        </form>
                                                    )}
                                                    {sessions[c.id] && sessions[c.id].length === 0 && <p className="text-xs text-gray-400 text-center py-2">Aucune session</p>}
                                                    {sessions[c.id] && sessions[c.id].map(s => (
                                                        <div key={s.id} className="flex justify-between items-center py-1.5 px-2 bg-gray-50 rounded-lg mb-1">
                                                            <span className="text-xs text-gray-600">📅 {new Date(s.date_debut).toLocaleDateString('fr-FR')}</span>
                                                            <button onClick={() => handleDeleteSession(s.id, c.id)} className="w-5 h-5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full text-xs flex items-center justify-center transition">✕</button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button onClick={() => handleDelete(c.id)} className="w-full mt-3 text-red-400 hover:text-red-600 text-xs py-2 rounded-xl hover:bg-red-50 transition">🗑 Supprimer le cours</button>
                                            </div>
                                        </div>
                                    ))}
                        </div>
                    )}

                    {/* COURS PUBLIES */}
                    {activeTab === 'publies' && !loading && (
                        <div>
                                <BarreRecherche />
                            {coursPublies.length === 0 ? (
                                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">⏳</div>
                                    <h3 className="text-gray-700 font-semibold">Aucun cours publié</h3>
                                    <p className="text-gray-400 text-sm mt-1">Vos cours doivent être validés par l'admin</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {coursPubliesFiltres.map(c => (
                                        <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                            <div className="h-1.5 bg-green-400" />
                                            <div className="p-5">
                                                <h3 className="font-bold text-gray-900 text-sm mb-3">{c.titre}</h3>
                                                <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-1">
                                                    <p className="text-xs text-gray-600">💰 <strong>{Number(c.prix).toLocaleString()} FCFA</strong></p>
                                                    <p className="text-xs text-gray-600">👥 {c.nb_places} places restantes</p>
                                                    <p className="text-xs text-indigo-600 font-semibold">🎓 {c.nb_inscrits || 0} inscrit(s)</p>
                                                </div>
                                                {c.apprenants && c.apprenants.length > 0 && (
                                                    <div className="border-t border-gray-100 pt-3">
                                                        <p className="text-xs font-semibold text-gray-600 mb-2">👨‍🎓 Apprenants :</p>
                                                        <div className="space-y-1 max-h-28 overflow-y-auto">
                                                            {c.apprenants.map((a, i) => (
                                                                <div key={i} className="flex justify-between bg-gray-50 rounded-lg px-2 py-1.5">
                                                                    <span className="text-xs text-gray-700">👤 {a.nom}</span>
                                                                    <span className="text-xs text-gray-400">{a.email}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* EN ATTENTE */}
                    {activeTab === 'attente' && !loading && (
                        <div>
                            {coursEnAttente.length === 0 ? (
                                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h3 className="text-gray-700 font-semibold">Aucun cours en attente</h3>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {coursEnAttente.map(c => (
                                        <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="h-1.5 bg-yellow-400" />
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-bold text-gray-900 text-sm">{c.titre}</h3>
                                                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">⏳ En attente</span>
                                                </div>
                                                <p className="text-gray-500 text-xs mb-3">{c.description}</p>
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700 mb-3">
                                                    ⚠️ En attente de validation par l'administrateur
                                                </div>
                                                {editForm?.id === c.id ? (
                                                    <form onSubmit={(e) => handleUpdate(e, c.id)} className="space-y-3">
                                                        <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" value={editForm.titre} onChange={e => setEditForm({...editForm, titre: e.target.value})} placeholder="Titre" required />
                                                        <textarea className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="Description" required />
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <input className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" type="number" value={editForm.prix} onChange={e => setEditForm({...editForm, prix: e.target.value})} placeholder="Prix" />
                                                            <input className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" type="number" value={editForm.duree} onChange={e => setEditForm({...editForm, duree: e.target.value})} placeholder="Durée" />
                                                            <input className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" type="number" value={editForm.nb_places} onChange={e => setEditForm({...editForm, nb_places: e.target.value})} placeholder="Places" />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-xl transition">💾 Sauvegarder</button>
                                                            <button type="button" onClick={() => setEditForm(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-xl transition">Annuler</button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <button onClick={() => setEditForm({ id: c.id, titre: c.titre, description: c.description, prix: c.prix, duree: c.duree, nb_places: c.nb_places })} className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold py-2 rounded-xl transition">
                                                        ✏️ Modifier ce cours
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* REJETES */}
                    {activeTab === 'rejetes' && !loading && (
                        <div>
                            {coursRejetes.length === 0 ? (
                                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">👍</div>
                                    <h3 className="text-gray-700 font-semibold">Aucun cours rejeté</h3>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {coursRejetes.map(c => (
                                        <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-75">
                                            <div className="h-1.5 bg-red-400" />
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-bold text-gray-900 text-sm">{c.titre}</h3>
                                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">❌ Rejeté</span>
                                                </div>
                                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                                                    ⚠️ Ce cours a été rejeté. Modifiez-le et soumettez-le à nouveau.
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* MES APPRENANTS */}
                    {activeTab === 'inscrits' && !loading && (
                        <div>
                            {totalInscrits === 0 ? (
                                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">👨‍🎓</div>
                                    <h3 className="text-gray-700 font-semibold">Aucun apprenant inscrit</h3>
                                    <p className="text-gray-400 text-sm mt-1">Les apprenants apparaîtront ici après leurs réservations</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                        <h2 className="font-bold text-gray-900">Tous mes apprenants</h2>
                                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{totalInscrits} inscrit(s)</span>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {cours.filter(c => c.apprenants && c.apprenants.length > 0).map(c => (
                                            <div key={c.id} className="p-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className={`w-2 h-2 rounded-full ${c.status === 'publie' || c.status === 'publié' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                                                    <h3 className="font-semibold text-gray-900 text-sm">{c.titre}</h3>
                                                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{c.nb_inscrits} inscrit(s)</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {c.apprenants.map((a, i) => (
                                                        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                                                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <span className="text-indigo-600 text-xs font-bold">{a.nom.charAt(0)}</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-800">{a.nom}</p>
                                                                <p className="text-xs text-gray-400">{a.email}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}
