import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import api from '../../api/axios';

export default function FormateurDashboard() {
    const [cours, setCours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        titre: '', description: '', prix: '', duree: '', nb_places: ''
    });
    const [message, setMessage] = useState('');
    const { user, logout } = useAuth();

    useEffect(() => {
        fetchCours();
    }, [fetchCours]);

    const fetchCours = useCallback ( async () => {
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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
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

    const handleDelete = async (id) => {
        if (!confirm('Supprimer ce cours ?')) return;
        try {
            await api.delete(`/formateur/cours/${id}`);
            fetchCours();
        } catch {
            setMessage('❌ Erreur lors de la suppression');
        }
    };

    return (
        <div style={styles.container}>
            {/* Navbar */}
            <nav style={styles.nav}>
                <h1 style={styles.logo}>🎓 Dashboard Formateur</h1>
                <div style={styles.navLinks}>
                    <span style={styles.welcome}>Bonjour, {user.nom}</span>
                    <Link to="/" style={styles.navBtn}>Voir les cours</Link>
                    <button onClick={logout} style={styles.logoutBtn}>Déconnexion</button>
                </div>
            </nav>

            <main style={styles.main}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}>Mes cours</h2>
                    <button
                        style={styles.addBtn}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? '✕ Annuler' : '+ Nouveau cours'}
                    </button>
                </div>

                {message && <p style={styles.message}>{message}</p>}

                {/* Formulaire création */}
                {showForm && (
                    <div style={styles.formCard}>
                        <h3 style={styles.formTitle}>Créer un nouveau cours</h3>
                        <form onSubmit={handleSubmit}>
                            <input
                                style={styles.input}
                                name="titre"
                                placeholder="Titre du cours"
                                value={form.titre}
                                onChange={handleChange}
                                required
                            />
                            <textarea
                                style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                                name="description"
                                placeholder="Description"
                                value={form.description}
                                onChange={handleChange}
                                required
                            />
                            <div style={styles.row}>
                                <input
                                    style={{ ...styles.input, flex: 1 }}
                                    name="prix"
                                    type="number"
                                    placeholder="Prix (FCFA)"
                                    value={form.prix}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    style={{ ...styles.input, flex: 1 }}
                                    name="duree"
                                    type="number"
                                    placeholder="Durée (minutes)"
                                    value={form.duree}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    style={{ ...styles.input, flex: 1 }}
                                    name="nb_places"
                                    type="number"
                                    placeholder="Nb places"
                                    value={form.nb_places}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button style={styles.submitBtn} type="submit">
                                Créer le cours
                            </button>
                        </form>
                    </div>
                )}

                {/* Liste des cours */}
                {loading && <p>Chargement...</p>}

                {!loading && cours.length === 0 && (
                    <p style={styles.empty}>Vous n'avez pas encore créé de cours.</p>
                )}

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
                            <span style={{
                                ...styles.badge,
                                background: c.status === 'publié' ? '#10b981' : '#f59e0b'
                            }}>
                                {c.status}
                            </span>
                            <div style={styles.actions}>
                                <button
                                    style={styles.deleteBtn}
                                    onClick={() => handleDelete(c.id)}
                                >
                                    Supprimer
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
    nav: { background:'#4f46e5', padding:'1rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center' },};