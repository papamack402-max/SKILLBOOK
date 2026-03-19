import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';

export default function FormateurDashboard() {
    const [cours, setCours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showSessionForm, setShowSessionForm] = useState(null);
    const [sessions, setSessions] = useState({});
    const [form, setForm] = useState({
        titre: '', description: '', prix: '', duree: '', nb_places: ''
    });
    const [sessionForm, setSessionForm] = useState({
        date_debut: '', date_fin: ''
    });
    const [message, setMessage] = useState('');
    const { user, logout } = useAuth();

    const fetchCours = useCallback(async () => {
        try {
            const res = await api.get('/cours');
            const mesCours = res.data.filter(c => c.user_id === user.id);
            setCours(mesCours);
        } catch {
            console.error('Erreur chargement cours');
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchCours();
    }, [fetchCours]);

    const fetchSessions = async (coursId) => {
        try {
            const res = await api.get(`/cours/${coursId}/sessions`);
            setSessions(prev => ({ ...prev, [coursId]: res.data }));
        } catch {
            console.error('Erreur chargement sessions');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSessionChange = (e) => {
        setSessionForm({ ...sessionForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/formateur/cours', form);
            setMessage('✅ Cours créé avec succès !');
            setForm({ titre: '', description: '', prix: '', duree: '', nb_places: '' });
            setShowForm(false);
            fetchCours();
        } catch {
            setMessage('❌ Erreur lors de la création');
        }
    };

    const handleSessionSubmit = async (e, coursId) => {
        e.preventDefault();
        try {
            await api.post('/formateur/sessions', {
                cours_id: coursId,
                date_debut: sessionForm.date_debut,
                date_fin: sessionForm.date_fin,
            });
            setMessage('✅ Session créée !');
            setSessionForm({ date_debut: '', date_fin: '' });
            setShowSessionForm(null);
            fetchSessions(coursId);
        } catch {
            setMessage('❌ Erreur lors de la création de session');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Supprimer ce cours ?')) return;
        try {
            await api.delete(`/formateur/cours/${id}`);
            fetchCours();
        } catch {
            setMessage('❌ Erreur lors de la suppression');
        }
    };

    const handleDeleteSession = async (sessionId, coursId) => {
        if (!confirm('Supprimer cette session ?')) return;
        try {
            await api.delete(`/formateur/sessions/${sessionId}`);
            fetchSessions(coursId);
        } catch {
            setMessage('❌ Erreur suppression session');
        }
    };

    return (
        <div style={styles.container}>
            <nav style={styles.nav}>
                <h1 style={styles.logo}>🎓 Dashboard Formateur</h1>
                <div style={styles.navLinks}>
                    <span style={styles.welcome}>Bonjour, {user.nom}</span>
                    <Link to="/" style={styles.navBtn}>Voir les cours</Link>
                    <button onClick={logout} style={styles.logoutBtn}>Déconnexion</button>
                </div>
            </nav>

            <main style={styles.main}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Mes cours</h2>
                    <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Annuler' : '+ Nouveau cours'}
                    </button>
                </div>

                {message && <p style={styles.message}>{message}</p>}

                {showForm && (
                    <div style={styles.formCard}>
                        <h3 style={styles.formTitle}>Créer un nouveau cours</h3>
                        <form onSubmit={handleSubmit}>
                            <input style={styles.input} name="titre" placeholder="Titre du cours" value={form.titre} onChange={handleChange} required/>
                            <textarea style={{ ...styles.input, height:'100px' }} name="description" placeholder="Description" value={form.description} onChange={handleChange} required/>
                            <div style={styles.row}>
                                <input style={{ ...styles.input, flex:1 }} name="prix" type="number" placeholder="Prix (FCFA)" value={form.prix} onChange={handleChange} required/>
                                <input style={{ ...styles.input, flex:1 }} name="duree" type="number" placeholder="Durée (min)" value={form.duree} onChange={handleChange} required/>
                                <input style={{ ...styles.input, flex:1 }} name="nb_places" type="number" placeholder="Nb places" value={form.nb_places} onChange={handleChange} required/>
                            </div>
                            <button style={styles.submitBtn} type="submit">Créer le cours</button>
                        </form>
                    </div>
                )}

                {loading && <p>Chargement...</p>}

                <div style={styles.grid}>
                    {cours.map(c => (
                        <div key={c.id} style={styles.card}>
                            <h3 style={styles.cardTitle}>{c.titre}</h3>
                            <p style={styles.cardDesc}>{c.description}</p>
                            <div style={styles.cardFooter}>
                                <span style={styles.prix}>{c.prix} FCFA</span>
                                <span style={styles.info}>⏱ {c.duree} min</span>
                                <span style={styles.info}>👥 {c.nb_places} places</span>
                            </div>
                            <span style={{ ...styles.badge, background: c.status === 'publié' ? '#10b981' : '#f59e0b' }}>
                                {c.status}
                            </span>

                            {/* Sessions */}
                            <div style={styles.sessionsSection}>
                                <div style={styles.sessionsHeader}>
                                    <span style={styles.sessionsTitle}>Sessions</span>
                                    <button
                                        style={styles.addSessionBtn}
                                        onClick={() => {
                                            setShowSessionForm(showSessionForm === c.id ? null : c.id);
                                            fetchSessions(c.id);
                                        }}
                                    >
                                        {showSessionForm === c.id ? '✕' : '+ Session'}
                                    </button>
                                </div>

                                {showSessionForm === c.id && (
                                    <form onSubmit={(e) => handleSessionSubmit(e, c.id)} style={styles.sessionForm}>
                                        <input
                                            style={styles.inputSm}
                                            name="date_debut"
                                            type="datetime-local"
                                            value={sessionForm.date_debut}
                                            onChange={handleSessionChange}
                                            required
                                        />
                                        <input
                                            style={styles.inputSm}
                                            name="date_fin"
                                            type="datetime-local"
                                            value={sessionForm.date_fin}
                                            onChange={handleSessionChange}
                                            required
                                        />
                                        <button style={styles.submitSmBtn} type="submit">
                                            Créer session
                                        </button>
                                    </form>
                                )}

                                {sessions[c.id] && sessions[c.id].length === 0 && (
                                    <p style={styles.noSession}>Aucune session</p>
                                )}

                                {sessions[c.id] && sessions[c.id].map(s => (
                                    <div key={s.id} style={styles.sessionItem}>
                                        <span style={styles.sessionDate}>
                                            📅 {new Date(s.date_debut).toLocaleDateString()} — {new Date(s.date_fin).toLocaleDateString()}
                                        </span>
                                        <button
                                            style={styles.deleteSmBtn}
                                            onClick={() => handleDeleteSession(s.id, c.id)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div style={styles.actions}>
                                <button style={styles.deleteBtn} onClick={() => handleDelete(c.id)}>
                                    Supprimer cours
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

const styles = {
    container: { minHeight:'100vh', background:'#f5f5f5' },
    nav: { background:'#4f46e5', padding:'1rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center' },
    logo: { color:'white', margin:0, fontSize:'1.25rem' },
    navLinks: { display:'flex', alignItems:'center', gap:'1rem' },
    welcome: { color:'white', fontSize:'0.9rem' },
    navBtn: { color:'white', textDecoration:'none', padding:'0.5rem 1rem', border:'1px solid white', borderRadius:'4px', fontSize:'0.9rem' },
    logoutBtn: { color:'white', background:'transparent', border:'1px solid white', padding:'0.5rem 1rem', borderRadius:'4px', cursor:'pointer', fontSize:'0.9rem' },
    main: { maxWidth:'1200px', margin:'0 auto', padding:'2rem' },
    header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
    title: { margin:0, color:'#333' },
    addBtn: { background:'#4f46e5', color:'white', border:'none', padding:'0.75rem 1.5rem', borderRadius:'6px', cursor:'pointer' },
    message: { padding:'0.75rem', background:'#f0fdf4', borderRadius:'4px', marginBottom:'1rem' },
    formCard: { background:'white', padding:'1.5rem', borderRadius:'8px', marginBottom:'2rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' },
    formTitle: { margin:'0 0 1rem', color:'#333' },
    input: { width:'100%', padding:'0.75rem', marginBottom:'1rem', border:'1px solid #ddd', borderRadius:'4px', fontSize:'1rem', boxSizing:'border-box' },
    row: { display:'flex', gap:'1rem' },
    submitBtn: { background:'#10b981', color:'white', border:'none', padding:'0.75rem 2rem', borderRadius:'6px', cursor:'pointer', fontSize:'1rem' },
    grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'1.5rem' },
    card: { background:'white', borderRadius:'8px', padding:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' },
    cardTitle: { margin:'0 0 0.5rem', color:'#1f2937' },
    cardDesc: { color:'#6b7280', fontSize:'0.9rem', marginBottom:'1rem' },
    cardFooter: { display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'0.5rem' },
    prix: { color:'#4f46e5', fontWeight:'bold' },
    info: { color:'#6b7280', fontSize:'0.85rem' },
    badge: { display:'inline-block', color:'white', padding:'0.2rem 0.6rem', borderRadius:'12px', fontSize:'0.75rem' },
    sessionsSection: { marginTop:'1rem', borderTop:'1px solid #f3f4f6', paddingTop:'1rem' },
    sessionsHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' },
    sessionsTitle: { fontSize:'0.9rem', fontWeight:'500', color:'#374151' },
    addSessionBtn: { background:'#4f46e5', color:'white', border:'none', padding:'0.3rem 0.8rem', borderRadius:'4px', cursor:'pointer', fontSize:'0.8rem' },
    sessionForm: { background:'#f9fafb', padding:'0.75rem', borderRadius:'6px', marginBottom:'0.5rem' },
    inputSm: { width:'100%', padding:'0.5rem', marginBottom:'0.5rem', border:'1px solid #ddd', borderRadius:'4px', fontSize:'0.85rem', boxSizing:'border-box' },
    submitSmBtn: { background:'#10b981', color:'white', border:'none', padding:'0.5rem 1rem', borderRadius:'4px', cursor:'pointer', fontSize:'0.85rem' },
    noSession: { color:'#9ca3af', fontSize:'0.85rem', textAlign:'center' },
    sessionItem: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.4rem 0', borderBottom:'1px solid #f3f4f6' },
    sessionDate: { fontSize:'0.8rem', color:'#4b5563' },
    deleteSmBtn: { background:'#ef4444', color:'white', border:'none', width:'22px', height:'22px', borderRadius:'50%', cursor:'pointer', fontSize:'0.75rem' },
    actions: { marginTop:'1rem' },
    deleteBtn: { background:'#ef4444', color:'white', border:'none', padding:'0.5rem 1rem', borderRadius:'4px', cursor:'pointer', fontSize:'0.85rem' },
};