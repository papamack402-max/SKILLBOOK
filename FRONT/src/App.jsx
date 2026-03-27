import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/login';
import Register from './pages/Register';
import Cours from './pages/Cours';
import FormateurDashboard from './pages/dashboard/FormateurDashboard';
import ApprenantDashboard from './pages/dashboard/ApprenantDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/formateur" element={
                        <ProtectedRoute role="formateur">
                            <FormateurDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/apprenant" element={
                        <ProtectedRoute role="apprenant">
                            <ApprenantDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                            <ProtectedRoute role="admin">
                                <AdminDashboard />
                            </ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}