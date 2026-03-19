import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';

export default function AdminDashboard() {
    const [cours, setCours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const { user, logout } = useAuth();

    const fetchData = useCallback(async () => {
        try {
            const coursRes = await api.get('/admin/cours');
            setCours(coursRes.data);
        } catch {
            console.error('Erreur chargement');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleValider = async (id) => {
        try {
            await api.post(`/admin/cours/${id}/valider`);
            setMessage('✅ Cours validé et publié !');
            fetchData();
        } catch {
            setMessage('❌ Erreur lors de la validation');
        }
    };

    const handleRejeter = async (id) => {
        if (!confirm('Rejeter ce cours ?')) return;
        try {
            await api.post(`/admin/cours/${id}/rejeter`);
            setMessage('⛔ Cours rejeté.');
            fetchData();
        } catch {
            setMessage('❌ Erreur lors du rejet');
        }
    };

const coursBrouillon = cours.filter(c => c.status === 'brouillon');
const coursPublies = cours.filter(c => c.status === 'publié' || c.status === 'publie');
const coursRejetes = cours.filter(c => c.status === 'rejeté' || c.status === 'rejete');

    return (
        <div style={styles.container}>
            <nav style={styles.nav}>
                <h1 style={styles.logo}>🛡️ Dashboard Admin</h1>
                <div style={styles.navLinks}>
                    <span style={styles.welcome}>Bonjour, {user.nom}</span>
                    <Link to="/" style={styles.navBtn}>Voir le site</Link>
                    <button onClick={logout} style={styles.logoutBtn}>Déconnexion</button>
                </div>
            </nav>

            <main style={styles.main}>
                {message && <p style={styles.message}>{message}</p>}
                {loading && <p>Chargement...</p>}

                {/* Stats */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <h3 style={styles.statNumber}>{cours.length}</h3>
                        <p style={styles.statLabel}>Total cours</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3 style={{ ...styles.statNumber, color:'#f59e0b' }}>{coursBrouillon.length}</h3>
                        <p style={styles.statLabel}>En attente</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3 style={{ ...styles.statNumber, color:'#10b981' }}>{coursPublies.length}</h3>
                        <p style={styles.statLabel}>Publiés</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3 style={{ ...styles.statNumber, color:'#ef4444' }}>{coursRejetes.length}</h3>
                        <p style={styles.statLabel}>Rejetés</p>
                    </div>
                </div>

                {/* Cours en attente */}
                <section style={styles.section}>
                    <h2 style={styles.title}>⏳ En attente de validation</h2>
                    {coursBrouillon.length === 0 ? (
                        <p style={styles.empty}>Aucun cours en attente.</p>
                    ) : (
                        <div style={styles.grid}>
                            {coursBrouillon.map(c => (
                                <div key={c.id} style={styles.card}>
                                    <h3 style={styles.cardTitle}>{c.titre}</h3>
                                    <p style={styles.cardDesc}>{c.description}</p>
                                    <div style={styles.cardInfo}>
                                        <span>👨‍🏫 Formateur : <strong>{c.formateur_nom}</strong></span>
                                        <span>💰 {c.prix} FCFA</span>
                                        <span>⏱ {c.duree} min</span>
                                        <span>👥 {c.nb_places} places</span>
                                    </div>
                                    <div style={styles.actions}>
                                        <button style={styles.validerBtn} onClick={() => handleValider(c.id)}>
                                            ✅ Valider
                                        </button>
                                        <button style={styles.rejeterBtn} onClick={() => handleRejeter(c.id)}>
                                            ❌ Rejeter
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Cours publiés */}
                <section style={styles.section}>
                    <h2 style={styles.title}>✅ Cours publiés</h2>
                    {coursPublies.length === 0 ? (
                        <p style={styles.empty}>Aucun cours publié.</p>
                    ) : (
                        <div style={styles.grid}>
                            {coursPublies.map(c => (
                                <div key={c.id} style={styles.card}>
                                    <h3 style={styles.cardTitle}>{c.titre}</h3>
                                    <p style={styles.cardDesc}>{c.description}</p>
                                    <div style={styles.cardInfo}>
                                        <span>👨‍🏫 Formateur : <strong>{c.formateur_nom}</strong></span>
                                        <span>💰 {c.prix} FCFA</span>
                                        <span>👥 {c.nb_places} places restantes</span>
                                        <span style={styles.inscrits}>🎓 {c.nb_inscrits} inscrits</span>
                                    </div>
                                    <span style={styles.badgePublie}>publié</span>

                                    {c.apprenants && c.apprenants.length > 0 && (
                                        <div style={styles.apprenantsBox}>
                                            <p style={styles.apprenantsTitle}>👨‍🎓 Apprenants inscrits :</p>
                                            {c.apprenants.map((a, i) => (
                                                <div key={i} style={styles.apprenantItem}>
                                                    <span>👤 {a.nom}</span>
                                                    <span style={styles.apprenantEmail}>{a.email}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Cours rejetés */}
                {coursRejetes.length > 0 && (
                    <section style={styles.section}>
                        <h2 style={styles.title}>❌ Cours rejetés</h2>
                        <div style={styles.grid}>
                            {coursRejetes.map(c => (
                                <div key={c.id} style={{ ...styles.card, opacity:0.7 }}>
                                    <h3 style={styles.cardTitle}>{c.titre}</h3>
                                    <div style={styles.cardInfo}>
                                        <span>👨‍🏫 {c.formateur_nom}</span>
                                    </div>
                                    <span style={styles.badgeRejete}>rejeté</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

const styles = {
    container: { minHeight:'100vh', background:'#f5f5f5' },
    nav: { background:'#1e1b4b', padding:'1rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center' },
    logo: { color:'white', margin:0, fontSize:'1.25rem' },
    navLinks: { display:'flex', alignItems:'center', gap:'1rem' },
    welcome: { color:'white', fontSize:'0.9rem' },
    navBtn: { color:'white', textDecoration:'none', padding:'0.5rem 1rem', border:'1px solid white', borderRadius:'4px', fontSize:'0.9rem' },
    logoutBtn: { color:'white', background:'transparent', border:'1px solid white', padding:'0.5rem 1rem', borderRadius:'4px', cursor:'pointer', fontSize:'0.9rem' },
    main: { maxWidth:'1200px', margin:'0 auto', padding:'2rem' },
    statsGrid: { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1rem', marginBottom:'2rem' },
    statCard: { background:'white', padding:'1.5rem', borderRadius:'8px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' },
    statNumber: { fontSize:'2rem', fontWeight:'bold', color:'#4f46e5', margin:'0 0 0.5rem' },
    statLabel: { color:'#6b7280', margin:0, fontSize:'0.9rem' },
    section: { marginBottom:'3rem' },
    title: { marginBottom:'1.5rem', color:'#333' },
    message: { padding:'0.75rem', background:'#f0fdf4', borderRadius:'4px', marginBottom:'1rem' },
    empty: { textAlign:'center', color:'#666' },
    grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.5rem' },
    card: { background:'white', borderRadius:'8px', padding:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' },
    cardTitle: { margin:'0 0 0.5rem', color:'#1f2937', fontSize:'1.1rem' },
    cardDesc: { color:'#6b7280', fontSize:'0.9rem', marginBottom:'1rem' },
    cardInfo: { display:'flex', flexDirection:'column', gap:'0.3rem', marginBottom:'1rem', fontSize:'0.85rem', color:'#4b5563' },
    inscrits: { color:'#4f46e5', fontWeight:'500' },
    actions: { display:'flex', gap:'0.5rem', marginTop:'1rem' },
    validerBtn: { flex:1, background:'#10b981', color:'white', border:'none', padding:'0.75rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem' },
    rejeterBtn: { flex:1, background:'#ef4444', color:'white', border:'none', padding:'0.75rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem' },
    badgePublie: { display:'inline-block', background:'#10b981', color:'white', padding:'0.2rem 0.6rem', borderRadius:'12px', fontSize:'0.75rem' },
    badgeRejete: { display:'inline-block', background:'#ef4444', color:'white', padding:'0.2rem 0.6rem', borderRadius:'12px', fontSize:'0.75rem' },
    apprenantsBox: { marginTop:'1rem', borderTop:'1px solid #f3f4f6', paddingTop:'0.75rem' },
    apprenantsTitle: { fontSize:'0.85rem', fontWeight:'500', color:'#374151', marginBottom:'0.5rem' },
    apprenantItem: { display:'flex', justifyContent:'space-between', padding:'0.3rem 0', fontSize:'0.8rem', color:'#4b5563', borderBottom:'1px solid #f9fafb' },
    apprenantEmail: { color:'#9ca3af' },
};