import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Login() {
    const [showForm, setShowForm] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'formateur') navigate('/formateur');
            else navigate('/apprenant');
        } catch {
            setError('Email ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    // 👇 Page d'accueil
    if (!showForm) {
        return (
            <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80')`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-blue-900/80" />

                <div className="relative z-10 text-center text-white px-6 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-sm mb-8">
                        <span>🎓</span>
                        <span>Plateforme de formation en ligne</span>
                    </div>

                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Apprenez, Progressez,
                        <span className="block text-yellow-400 mt-1">Excellez</span>
                    </h1>

                    <p className="text-xl text-white/80 mb-12 max-w-xl mx-auto leading-relaxed">
                        Accédez à des centaines de cours de qualité dispensés par des formateurs expérimentés.
                    </p>

                    <div className="flex justify-center gap-12 mb-12">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-400">500+</div>
                            <div className="text-white/70 text-sm mt-1">Cours disponibles</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-400">10k+</div>
                            <div className="text-white/70 text-sm mt-1">Apprenants</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-400">200+</div>
                            <div className="text-white/70 text-sm mt-1">Formateurs</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-10 py-4 rounded-xl text-lg transition duration-200 shadow-lg"
                        >
                            Se connecter
                        </button>
                        <Link
                            to="/register"
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white font-semibold px-10 py-4 rounded-xl text-lg transition duration-200"
                        >
                            Créer un compte
                        </Link>
                    </div>

                    <Link
                        to="/"
                        className="inline-block mt-6 text-white/60 hover:text-white text-sm underline underline-offset-4 transition"
                    >
                        Parcourir les cours sans compte →
                    </Link>
                </div>
            </div>
        );
    }

    // 👇 Formulaire de connexion avec image de fond
    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden">

            {/* Image de fond */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1920&q=80')`,
                }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-blue-900/70 to-purple-900/80" />

            {/* Contenu */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-12">

                {/* Côté gauche */}
                <div className="text-white flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-sm mb-6">
                        <span>👋</span>
                        <span>Bon retour parmi nous !</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 leading-tight">
                        Reprenez là
                        <span className="block text-yellow-400">où vous en étiez</span>
                    </h1>
                    <p className="text-white/70 text-lg mb-8 leading-relaxed">
                        Connectez-vous pour accéder à vos cours, réservations et bien plus encore.
                    </p>
                    <div className="space-y-3">
                        {[
                            '📚 Accédez à vos cours en cours',
                            '📅 Consultez vos réservations',
                            '💳 Gérez vos paiements',
                            '🎓 Suivez votre progression',
                        ].map((item, i) => (
                            <div key={i} className="text-white/80 text-sm">{item}</div>
                        ))}
                    </div>
                    <button
                        onClick={() => setShowForm(false)}
                        className="mt-8 text-white/60 hover:text-white text-sm underline underline-offset-4 transition"
                    >
                        ← Retour à l'accueil
                    </button>
                </div>

                {/* Côté droit — formulaire */}
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-3">
                            <span className="text-2xl">🎓</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Connexion</h2>
                        <p className="text-gray-500 text-sm mt-1">Entrez vos identifiants</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="vous@exemple.com"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-50"
                        >
                            {loading ? '⏳ Connexion...' : 'Se connecter →'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Pas de compte ?{' '}
                        <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                            S'inscrire gratuitement
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}