import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Register() {
    const [form, setForm] = useState({
        nom: '', email: '', password: '', role: 'apprenant'
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await register(form.nom, form.email, form.password, form.role);
            if (user.role === 'formateur') navigate('/formateur');
            else if (user.role === 'apprenant') navigate('/apprenant');
            else navigate('/');
        } catch {
            setError('Erreur lors de l\'inscription');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Inscription</h2>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input}
                        type="text"
                        name="nom"
                        placeholder="Nom complet"
                        value={form.nom}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={styles.input}
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={styles.input}
                        type="password"
                        name="password"
                        placeholder="Mot de passe"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <select
                        style={styles.input}
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                    >
                        <option value="apprenant">Apprenant</option>
                        <option value="formateur">Formateur</option>
                    </select>
                    <button style={styles.button} type="submit">
                        S'inscrire
                    </button>
                </form>
                <p style={styles.link}>
                    Déjà un compte ? <Link to="/login">Se connecter</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#f5f5f5' },
    card: { background:'white', padding:'2rem', borderRadius:'8px', width:'100%', maxWidth:'400px', boxShadow:'0 2px 10px rgba(0,0,0,0.1)' },
    title: { textAlign:'center', marginBottom:'1.5rem', color:'#333' },
    input: { width:'100%', padding:'0.75rem', marginBottom:'1rem', border:'1px solid #ddd', borderRadius:'4px', fontSize:'1rem', boxSizing:'border-box' },
    button: { width:'100%', padding:'0.75rem', background:'#4f46e5', color:'white', border:'none', borderRadius:'4px', fontSize:'1rem', cursor:'pointer' },
    error: { color:'red', marginBottom:'1rem', textAlign:'center' },
    link: { textAlign:'center', marginTop:'1rem' }
};