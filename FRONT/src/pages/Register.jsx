import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Register() {
    const [form, setForm] = useState({
        nom: '', email: '', password: '', role: 'apprenant'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await register(form.nom, form.email, form.password, form.role);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'formateur') navigate('/formateur');
            else navigate('/apprenant');
        } catch {
            setError('Erreur lors de l\'inscription. Email peut-être déjà utilisé.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden">

            {/* Image de fond */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80')`,
                }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-indigo-900/70 to-blue-900/80" />

            {/* Contenu */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col lg:flex-row items-center gap-12">

                {/* Côté gauche — texte */}
                <div className="text-white flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 text-sm mb-6">
                        <span>🚀</span>
                        <span>Rejoignez notre communauté</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 leading-tight">
                        Commencez votre
                        <span className="block text-yellow-400">aventure aujourd'hui</span>
                    </h1>
                    <p className="text-white/70 text-lg mb-8 leading-relaxed">
                        Créez votre compte gratuitement et accédez à des centaines de cours de qualité.
                    </p>

                    {/* Avantages */}
                    <div className="space-y-3">
                        {[
                            '✅ Accès à tous les cours publiés',
                            '✅ Réservez vos sessions facilement',
                            '✅ Suivez votre progression',
                            '✅ Devenez formateur et partagez vos connaissances',
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-white/80 text-sm">
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    <p className="mt-8 text-white/60 text-sm">
                        Déjà un compte ?{' '}
                        <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium underline underline-offset-4">
                            Se connecter
                        </Link>
                    </p>
                </div>

                {/* Côté droit — formulaire */}
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-3">
                            <span className="text-2xl">🎓</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Créer un compte</h2>
                        <p className="text-gray-500 text-sm mt-1">C'est gratuit et rapide !</p>
                    </div>

                    {/* Erreur */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom complet
                            </label>
                            <input
                                type="text"
                                name="nom"
                                value={form.nom}
                                onChange={handleChange}
                                placeholder="Jean Dupont"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="vous@exemple.com"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Je suis un...
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, role: 'apprenant' })}
                                    className={`py-3 rounded-xl border-2 text-sm font-medium transition ${
                                        form.role === 'apprenant'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    👨‍🎓 Apprenant
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, role: 'formateur' })}
                                    className={`py-3 rounded-xl border-2 text-sm font-medium transition ${
                                        form.role === 'formateur'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    👨‍🏫 Formateur
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-50 mt-2"
                        >
                            {loading ? '⏳ Création...' : 'Créer mon compte →'}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-4">
                        En créant un compte, vous acceptez nos conditions d'utilisation
                    </p>
                </div>
            </div>
        </div>
    );
}