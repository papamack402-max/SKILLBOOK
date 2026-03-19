import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';

export default function Cours() {
    const [cours, setCours] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/cours')
            .then(res => setCours(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            {/* Navbar */}
            <nav style={styles.nav}>
                <h1 style={styles.logo}>🎓 Plateforme Cours</h1>
                <div style={styles.navLinks}>
                    {user ? (
                        <>
                            <span style={styles.welcome}>Bonjour, {user.nom}</span>
                            {user.role === 'formateur' && (
                                <Link to="/formateur" style={styles.navBtn}>Dashboard</Link>
                            )}
                            {user.role === 'apprenant' && (
                                <Link to="/apprenant" style={styles.navBtn}>Mes réservations</Link>
                            )}
                            <button onClick={handleLogout} style={styles.logoutBtn}>
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={styles.navBtn}>Connexion</Link>
                            <Link to="/register" style={styles.navBtn}>Inscription</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Contenu */}
            <main style={styles.main}>
                <h2 style={styles.title}>Tous les cours disponibles</h2>

                {loading && <p style={styles.loading}>Chargement...</p>}

                {!loading && cours.length === 0 && (
                    <p style={styles.empty}>Aucun cours disponible pour le moment.</p>
                )}

                <div style={styles.grid}>
                    {cours.map(c => (
                        <div key={c.id} style={styles.card}>
                            <h3 style={styles.cardTitle}>{c.titre}</h3>
                            <p style={styles.cardDesc}>{c.description}</p>
                             <p style={styles.formateur}>
                        👨‍🏫 {c.formateur?.nom ?? 'Formateur inconnu'}
                             </p>
                            <div style={styles.cardFooter}>
                                <span style={styles.prix}>{c.prix} FCFA</span>
                                <span style={styles.duree}>⏱ {c.duree} min</span>
                                <span style={styles.places}>👥 {c.nb_places} places</span>
                            </div>
                            <span style={{
                                ...styles.badge,
                                background: c.status === 'publié' ? '#10b981' : '#f59e0b'
                            }}>
                                {c.status}
                            </span>
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
    title: { marginBottom:'2rem', color:'#333' },
    loading: { textAlign:'center', color:'#666' },
    empty: { textAlign:'center', color:'#666', fontSize:'1.1rem' },
    grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.5rem' },
    card: { background:'white', borderRadius:'8px', padding:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', position:'relative' },
    cardTitle: { margin:'0 0 0.5rem', color:'#1f2937', fontSize:'1.1rem' },
    cardDesc: { color:'#6b7280', fontSize:'0.9rem', marginBottom:'1rem', lineHeight:'1.5' },
    cardFooter: { display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom:'0.5rem' },
    prix: { color:'#4f46e5', fontWeight:'bold' },
    duree: { color:'#6b7280', fontSize:'0.85rem' },
    places: { color:'#6b7280', fontSize:'0.85rem' },
    badge: { display:'inline-block', color:'white', padding:'0.2rem 0.6rem', borderRadius:'12px', fontSize:'0.75rem' },
};