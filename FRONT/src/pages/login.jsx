import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await login(email, password);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'formateur') navigate('/formateur');
            else if (user.role === 'apprenant') navigate('/apprenant');
        } catch  {
            setError('Email ou mot de passe incorrect');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Connexion</h2>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input}
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button style={styles.button} type="submit">
                        Se connecter
                    </button>
                </form>
                <p style={styles.link}>
                    Pas de compte ? <Link to="/register">S'inscrire</Link>
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