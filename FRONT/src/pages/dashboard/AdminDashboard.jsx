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
            const coursRes = await api.get('/cours');
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

    const coursBrouillon = cours.filter(c => c.status === 'brouillon');
    const coursPublies = cours.filter(c => c.status === 'publié');

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
                        <p style={styles.statLabel}>En attente validation</p>
                    </div>
                    <div style={styles.statCard}>
                        <h3 style={{ ...styles.statNumber, color:'#10b981' }}>{coursPublies.length}</h3>
                        <p style={styles.statLabel}>Cours publiés</p>
                    </div>
                </div>

                {/* Cours à valider */}
                <section style={styles.section}>
                    <h2 style={styles.title}>⏳ Cours en attente de validation</h2>
                    {coursBrouillon.length === 0 ? (
                        <p style={styles.empty}>Aucun cours en attente.</p>
                    ) : (
                        <div style={styles.grid}>
                            {coursBrouillon.map(c => (
                                <div key={c.id} style={styles.card}>
                                    <h3 style={styles.cardTitle}>{c.titre}</h3>
                                    <p style={styles.cardDesc}>{c.description}</p>
                                    <div style={styles.cardFooter}>
                                        <span style={styles.prix}>{c.prix} FCFA</span>
                                        <span style={styles.info}>⏱ {c.duree} min</span>
                                        <span style={styles.info}>👥 {c.nb_places} places</span>
                                    </div>
                                    <span style={styles.badgeBrouillon}>brouillon</span>
                                    <button
                                        style={styles.validerBtn}
                                        onClick={() => handleValider(c.id)}
                                    >
                                        ✅ Valider et publier
                                    </button>
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
                                    <div style={styles.cardFooter}>
                                        <span style={styles.prix}>{c.prix} FCFA</span>
                                        <span style={styles.info}>⏱ {c.duree} min</span>
                                    </div>
                                    <span style={styles.badgePublie}>publié</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
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
    statsGrid: { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1rem', marginBottom:'2rem' },
    statCard: { background:'white', padding:'1.5rem', borderRadius:'8px', textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' },
    statNumber: { fontSize:'2rem', fontWeight:'bold', color:'#4f46e5', margin:'0 0 0.5rem' },
    statLabel: { color:'#6b7280', margin:0, fontSize:'0.9rem' },
    section: { marginBottom:'3rem' },
    title: { marginBottom:'1.5rem', color:'#333' },
    message: { padding:'0.75rem', background:'#f0fdf4', borderRadius:'4px', marginBottom:'1rem' },
    empty: { textAlign:'center', color:'#666' },
    grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.5rem' },
    card: { background:'white', borderRadius:'8px', padding:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' },
    cardTitle: { margin:'0 0 0.5rem', color:'#1f2937' },
    cardDesc: { color:'#6b7280', fontSize:'0.9rem', marginBottom:'1rem' },
    cardFooter: { display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'0.5rem' },
    prix: { color:'#4f46e5', fontWeight:'bold' },
    info: { color:'#6b7280', fontSize:'0.85rem' },
    badgeBrouillon: { display:'inline-block', background:'#f59e0b', color:'white', padding:'0.2rem 0.6rem', borderRadius:'12px', fontSize:'0.75rem', marginBottom:'0.5rem' },
    badgePublie: { display:'inline-block', background:'#10b981', color:'white', padding:'0.2rem 0.6rem', borderRadius:'12px', fontSize:'0.75rem' },
    validerBtn: { display:'block', width:'100%', marginTop:'1rem', background:'#10b981', color:'white', border:'none', padding:'0.75rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem' },
};