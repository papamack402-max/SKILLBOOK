import { useState, useEffect , useCallback  } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';

export default function ApprenantDashboard() {
    const [cours, setCours] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const { user, logout } = useAuth();



    const fetchData = useCallback (async () => {
    try {
            const [coursRes, resaRes] = await Promise.all([
                api.get('/cours'),
                api.get('/apprenant/reservations'),
            ]);
            setCours(coursRes.data);
            setReservations(resaRes.data);
        } catch {
            console.error('Erreur chargement');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);



    const handleReserver = async () => {
        try {
            // Pour l'instant on réserve sans session
            // à améliorer quand tu ajoutes les sessions
            setMessage('❌ Ce cours n\'a pas encore de session disponible.');
        } catch {
            setMessage('❌ Erreur lors de la réservation');
        }
    };

    const handleAnnuler = async (id) => {
        if (!confirm('Annuler cette réservation ?')) return;
        try {
            await api.put(`/apprenant/reservations/${id}/annuler`);
            setMessage('✅ Réservation annulée');
            fetchData();
        } catch {
            setMessage('❌ Erreur lors de l\'annulation');
        }
    };

    return (
        <div style={styles.container}>
            {/* Navbar */}
            <nav style={styles.nav}>
                <h1 style={styles.logo}>🎓 Dashboard Apprenant</h1>
                <div style={styles.navLinks}>
                    <span style={styles.welcome}>Bonjour, {user.nom}</span>
                    <Link to="/" style={styles.navBtn}>Tous les cours</Link>
                    <button onClick={logout} style={styles.logoutBtn}>
                        Déconnexion
                    </button>
                </div>
            </nav>

            <main style={styles.main}>
                {message && <p style={styles.message}>{message}</p>}

                {loading && <p>Chargement...</p>}

                {/* Mes réservations */}
                <section style={styles.section}>
                    <h2 style={styles.title}>Mes réservations</h2>
                    {reservations.length === 0 ? (
                        <p style={styles.empty}>Aucune réservation pour le moment.</p>
                    ) : (
                        <div style={styles.grid}>
                            {reservations.map(r => (
                                <div key={r.id} style={styles.card}>
                                    <h3 style={styles.cardTitle}>
                                        {r.session?.cours?.titre || 'Cours'}
                                    </h3>
                                    <p style={styles.cardInfo}>
                                        📅 {new Date(r.date_reservation).toLocaleDateString()}
                                    </p>
                                    <span style={{
                                        ...styles.badge,
                                        background: r.statut === 'confirmée' ? '#10b981'
                                            : r.statut === 'annulée' ? '#ef4444' : '#f59e0b'
                                    }}>
                                        {r.statut}
                                    </span>
                                    {r.statut !== 'annulée' && (
                                        <button
                                            style={styles.annulerBtn}
                                            onClick={() => handleAnnuler(r.id)}
                                        >
                                            Annuler
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Cours disponibles */}
                <section style={styles.section}>
                    <h2 style={styles.title}>Cours disponibles</h2>
                    {cours.length === 0 ? (
                        <p style={styles.empty}>Aucun cours disponible.</p>
                    ) : (
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
                                    <button
                                        style={styles.reserverBtn}
                                        onClick={() => handleReserver(c.id)}
                                    >
                                        Réserver
                                    </button>
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
    nav: { background:'#4f46e5', padding:'1rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center' },
    logo: { color:'white', margin:0, fontSize:'1.25rem' },
    navLinks: { display:'flex', alignItems:'center', gap:'1rem' },
    welcome: { color:'white', fontSize:'0.9rem' },
    navBtn: { color:'white', textDecoration:'none', padding:'0.5rem 1rem', border:'1px solid white', borderRadius:'4px', fontSize:'0.9rem' },
    logoutBtn: { color:'white', background:'transparent', border:'1px solid white', padding:'0.5rem 1rem', borderRadius:'4px', cursor:'pointer', fontSize:'0.9rem' },
    main: { maxWidth:'1200px', margin:'0 auto', padding:'2rem' },
    section: { marginBottom:'3rem' },
    title: { marginBottom:'1.5rem', color:'#333' },
    message: { padding:'0.75rem', background:'#f0fdf4', borderRadius:'4px', marginBottom:'1rem' },
    empty: { textAlign:'center', color:'#666' },
    grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1.5rem' },
    card: { background:'white', borderRadius:'8px', padding:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' },
    cardTitle: { margin:'0 0 0.5rem', color:'#1f2937' },
    cardDesc: { color:'#6b7280', fontSize:'0.9rem', marginBottom:'1rem' },
    cardInfo: { color:'#6b7280', fontSize:'0.9rem', marginBottom:'0.5rem' },
    cardFooter: { display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'1rem' },
    prix: { color:'#4f46e5', fontWeight:'bold' },
    info: { color:'#6b7280', fontSize:'0.85rem' },
    badge: { display:'inline-block', color:'white', padding:'0.2rem 0.6rem', borderRadius:'12px', fontSize:'0.75rem', marginBottom:'0.5rem' },
    reserverBtn: { width:'100%', marginTop:'1rem', background:'#4f46e5', color:'white', border:'none', padding:'0.75rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem' },
    annulerBtn: { display:'block', marginTop:'0.5rem', background:'#ef4444', color:'white', border:'none', padding:'0.5rem 1rem', borderRadius:'4px', cursor:'pointer', fontSize:'0.85rem' },
};