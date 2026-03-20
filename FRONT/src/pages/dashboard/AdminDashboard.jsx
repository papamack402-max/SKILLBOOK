import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('attente');
    const [cours, setCours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get('/admin/cours');
            setCours(res.data);
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

    const handleValider = async (id) => {
        try {
            await api.post(`/admin/cours/${id}/valider`);
            showMessage('✅ Cours validé et publié !');
            fetchData();
        } catch {
            showMessage('❌ Erreur validation', 'error');
        }
    };

    const handleRejeter = async (id) => {
        if (!confirm('Rejeter ce cours ?')) return;
        try {
            await api.post(`/admin/cours/${id}/rejeter`);
            showMessage('⛔ Cours rejeté', 'warning');
            fetchData();
        } catch {
            showMessage('❌ Erreur rejet', 'error');
        }
    };

    // 👇 Accepte les deux formes avec et sans accent
    const coursBrouillon = cours.filter(c => c.status === 'brouillon');
    const coursPublies = cours.filter(c => c.status === 'publié' || c.status === 'publie');
    const coursRejetes = cours.filter(c => c.status === 'rejeté' || c.status === 'rejete');

    const isPublie = (status) => status === 'publié' || status === 'publie';//

    const menuItems = [
        { id: 'attente', label: 'En attente', icon: '⏳', count: coursBrouillon.length },
        { id: 'publies', label: 'Cours publiés', icon: '✅', count: coursPublies.length },
        { id: 'rejetes', label: 'Cours rejetés', icon: '❌', count: coursRejetes.length },
        { id: 'historique', label: 'Historique', icon: '📋', count: coursPublies.length + coursRejetes.length },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 min-h-screen transition-all duration-300 flex flex-col`}>
                <div className="p-4 flex items-center gap-3 border-b border-slate-800">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🛡️</span>
                    </div>
                    {sidebarOpen && (
                        <div>
                            <p className="text-white font-bold text-sm">EduPlateforme</p>
                            <p className="text-slate-400 text-xs">Administrateur</p>
                        </div>
                    )}
                </div>

                {sidebarOpen && (
                    <div className="p-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{user.nom.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">{user.nom}</p>
                                <p className="text-slate-400 text-xs">Admin</p>
                            </div>
                        </div>
                    </div>
                )}

                {sidebarOpen && (
                    <div className="p-4 border-b border-slate-800">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-slate-800 rounded-xl p-2 text-center">
                                <p className="text-yellow-400 font-bold text-lg">{coursBrouillon.length}</p>
                                <p className="text-slate-400 text-xs">Attente</p>
                            </div>
                            <div className="bg-slate-800 rounded-xl p-2 text-center">
                                <p className="text-green-400 font-bold text-lg">{coursPublies.length}</p>
                                <p className="text-slate-400 text-xs">Publiés</p>
                            </div>
                            <div className="bg-slate-800 rounded-xl p-2 text-center">
                                <p className="text-red-400 font-bold text-lg">{coursRejetes.length}</p>
                                <p className="text-slate-400 text-xs">Rejetés</p>
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
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <span className="text-xl flex-shrink-0">{item.icon}</span>
                            {sidebarOpen && (
                                <>
                                    <span className="text-sm font-medium flex-1">{item.label}</span>
                                    {item.count > 0 && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                            activeTab === item.id ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                                        }`}>
                                            {item.count}
                                        </span>
                                    )}
                                </>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-3 border-t border-slate-800 space-y-1">
                    <Link to="/" className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
                        <span className="text-xl">🌐</span>
                        {sidebarOpen && <span className="text-sm">Site public</span>}
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-red-600 hover:text-white transition">
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
                            <p className="text-gray-400 text-xs">Dashboard Administration</p>
                        </div>
                    </div>
                   <span className="text-sm text-gray-500">Total : <strong>{menuItems.find(m => m.id === activeTab)?.count || 0} cours</strong>
                    </span>
                </header>

                <main className="flex-1 p-6 overflow-auto">

                    {message && (
                        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
                            messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                            messageType === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
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

                    {/* EN ATTENTE */}
                    {activeTab === 'attente' && !loading && (
                        <div>
                            {coursBrouillon.length === 0 ? (
                                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h3 className="text-gray-700 font-semibold mb-2">Aucun cours en attente</h3>
                                    <p className="text-gray-400 text-sm">Tous les cours ont été traités</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {coursBrouillon.map(c => (
                                        <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                            <div className="h-1.5 bg-yellow-400" />
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-bold text-gray-900 text-sm flex-1 pr-2">{c.titre}</h3>
                                                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0">En attente</span>
                                                </div>
                                                <p className="text-gray-500 text-xs mb-4 line-clamp-2">{c.description}</p>
                                                <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
                                                    <p className="text-xs text-gray-600">👨‍🏫 <strong>{c.formateur_nom}</strong></p>
                                                    <p className="text-xs text-gray-600">💰 <strong>{Number(c.prix).toLocaleString()} FCFA</strong></p>
                                                    <p className="text-xs text-gray-600">⏱ {c.duree} min · 👥 {c.nb_places} places</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button onClick={() => handleValider(c.id)} className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2.5 rounded-xl transition">✅ Valider</button>
                                                    <button onClick={() => handleRejeter(c.id)} className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-2.5 rounded-xl transition border border-red-200">❌ Rejeter</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* COURS PUBLIES */}
                    {activeTab === 'publies' && !loading && (
                        <div>
                            {coursPublies.length === 0 ? (
                                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">📚</div>
                                    <h3 className="text-gray-700 font-semibold">Aucun cours publié</h3>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {coursPublies.map(c => (
                                        <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                                            <div className="h-1.5 bg-green-400" />
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-bold text-gray-900 text-sm flex-1 pr-2">{c.titre}</h3>
                                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0">Publié</span>
                                                </div>
                                                <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
                                                    <p className="text-xs text-gray-600">👨‍🏫 <strong>{c.formateur_nom}</strong></p>
                                                    <p className="text-xs text-gray-600">💰 <strong>{Number(c.prix).toLocaleString()} FCFA</strong></p>
                                                    <p className="text-xs text-gray-600">👥 {c.nb_places} places restantes</p>
                                                    <p className="text-xs text-indigo-600 font-semibold">🎓 {c.nb_inscrits} apprenant(s) inscrit(s)</p>
                                                </div>
                                                {c.apprenants && c.apprenants.length > 0 && (
                                                    <div className="border-t border-gray-100 pt-3">
                                                        <p className="text-xs font-semibold text-gray-600 mb-2">👨‍🎓 Apprenants inscrits :</p>
                                                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                            {c.apprenants.map((a, i) => (
                                                                <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg px-2 py-1.5">
                                                                    <span className="text-xs text-gray-700 font-medium">👤 {a.nom}</span>
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

                    {/* COURS REJETES */}
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
                                        <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-75 hover:opacity-100 transition">
                                            <div className="h-1.5 bg-red-400" />
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="font-bold text-gray-900 text-sm flex-1 pr-2">{c.titre}</h3>
                                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0">Rejeté</span>
                                                </div>
                                                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                                                    <p className="text-xs text-gray-600">👨‍🏫 <strong>{c.formateur_nom}</strong></p>
                                                    <p className="text-xs text-gray-600">💰 {Number(c.prix).toLocaleString()} FCFA</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* HISTORIQUE */}
                    {activeTab === 'historique' && !loading && (
                        <div>
                            {coursPublies.length + coursRejetes.length === 0 ? (
                                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">📋</div>
                                    <h3 className="text-gray-700 font-semibold">Aucun historique</h3>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                        <h2 className="font-bold text-gray-900">Historique des validations</h2>
                                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                            {coursPublies.length + coursRejetes.length} cours traités
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cours</th>
                                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Formateur</th>
                                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix</th>
                                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscrits</th>
                                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {[...coursPublies, ...coursRejetes]
                                                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                    .map(c => (
                                                    <tr key={c.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-semibold text-gray-900">{c.titre}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">{c.description?.substring(0, 40)}...</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-indigo-600 text-xs font-bold">{c.formateur_nom?.charAt(0)}</span>
                                                                </div>
                                                                <span className="text-sm text-gray-700">{c.formateur_nom}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-bold text-indigo-600">{Number(c.prix).toLocaleString()} FCFA</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">{c.nb_inscrits}</span>
                                                                <span className="text-xs text-gray-400">apprenant(s)</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                                                                isPublie(c.status)
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-red-100 text-red-700'
                                                            }`}>
                                                                {isPublie(c.status) ? '✅ Validé' : '❌ Rejeté'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-gray-400">
                                                            {new Date(c.created_at).toLocaleDateString('fr-FR')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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