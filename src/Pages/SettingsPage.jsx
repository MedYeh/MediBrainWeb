// src/pages/SettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { User, Lock, Save, Trash2, Loader2, AlertCircle } from 'lucide-react';

// Reusable component for each settings section
const SettingsCard = ({ title, children }) => (
    <div className="bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">{title}</h2>
        {children}
    </div>
);

// Reusable input component
const InputField = ({ id, label, type, value, onChange, icon: Icon, disabled = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <Icon className="w-5 h-5 text-gray-400" />
            </span>
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100"
            />
        </div>
    </div>
);

const SettingsPage = () => {
    const { user, logout } = useAuth();
    
    // --- STATE MANAGEMENT ---
    const [profileData, setProfileData] = useState({ prenom: '', nom: '', email: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [loading, setLoading] = useState({ profile: false, password: false });
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    // Populate profile data from auth context on load
    useEffect(() => {
        if (user) {
            setProfileData({
                prenom: user.prenom,
                nom: user.nom,
                email: user.email,
            });
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading({ ...loading, profile: true });
        setFeedback({ type: '', message: '' });

        // --- TODO: API CALL TO UPDATE PROFILE ---
        // Example: await apiClient.put('/api/users/me', profileData);
        setTimeout(() => { // Simulating API call
            console.log("Saving profile data:", profileData);
            setFeedback({ type: 'success', message: 'Profil mis à jour avec succès !' });
            setLoading({ ...loading, profile: false });
            setIsEditingProfile(false);
        }, 1500);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setFeedback({ type: 'error', message: 'Les nouveaux mots de passe ne correspondent pas.' });
            return;
        }
        setLoading({ ...loading, password: true });
        setFeedback({ type: '', message: '' });

        // --- TODO: API CALL TO UPDATE PASSWORD ---
        // Example: await apiClient.put('/api/users/change-password', passwordData);
        setTimeout(() => { // Simulating API call
            console.log("Updating password...");
            setFeedback({ type: 'success', message: 'Mot de passe changé avec succès !' });
            setLoading({ ...loading, password: false });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }, 1500);
    };
    
    const handleDeleteAccount = () => {
        if (window.confirm("Êtes-vous absolument sûr ? Cette action est irréversible et supprimera votre compte administrateur.")) {
            // --- TODO: API CALL TO DELETE ACCOUNT ---
            // Example: await apiClient.delete('/api/users/me');
            console.log("Deleting account...");
            logout(); // Log out after deletion
        }
    };


    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Paramètres du Compte</h1>

            {feedback.message && (
                <div className={`p-4 mb-6 rounded-lg text-center ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {feedback.message}
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Information Card */}
                <SettingsCard title="Informations du Profil">
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField id="prenom" label="Prénom" type="text" value={profileData.prenom} onChange={handleProfileChange} icon={User} disabled={!isEditingProfile} />
                            <InputField id="nom" label="Nom" type="text" value={profileData.nom} onChange={handleProfileChange} icon={User} disabled={!isEditingProfile} />
                        </div>
                        <InputField id="email" label="Adresse Email" type="email" value={profileData.email} onChange={handleProfileChange} icon={User} disabled />
                        
                        <div className="flex justify-end pt-4">
                            {isEditingProfile ? (
                                <button type="submit" disabled={loading.profile} className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 flex items-center">
                                    {loading.profile ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                    Enregistrer
                                </button>
                            ) : (
                                <button type="button" onClick={() => setIsEditingProfile(true)} className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300">
                                    Modifier le Profil
                                </button>
                            )}
                        </div>
                    </form>
                </SettingsCard>

                {/* Change Password Card */}
                <SettingsCard title="Changer le Mot de Passe">
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <InputField id="currentPassword" label="Mot de Passe Actuel" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} icon={Lock} />
                        <InputField id="newPassword" label="Nouveau Mot de Passe" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} icon={Lock} />
                        <InputField id="confirmPassword" label="Confirmer le Nouveau Mot de Passe" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} icon={Lock} />
                        
                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={loading.password} className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 flex items-center">
                                {loading.password ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                Mettre à Jour le Mot de Passe
                            </button>
                        </div>
                    </form>
                </SettingsCard>
                
                {/* Danger Zone */}
                <div className="bg-white p-8 rounded-xl shadow-md border-2 border-red-500">
                    <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center">
                        <AlertCircle className="w-6 h-6 mr-2" />
                        Zone de Danger
                    </h2>
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600">Supprimer définitivement votre compte administrateur.</p>
                        <button onClick={handleDeleteAccount} className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 flex items-center">
                            <Trash2 className="w-5 h-5 mr-2" />
                            Supprimer le Compte
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;