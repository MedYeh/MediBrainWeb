// src/pages/PageList.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../Utils/apiClient';
import { Plus, Edit, Trash2, Eye } from 'lucide-react'; // <-- Import Eye icon

const PageList = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPages = async () => {
            try {
                setLoading(true);
                const response = await apiClient('/api/pages');
                setPages(response); 
                setError(null);
            } catch (err) {
                setError('Failed to fetch pages.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPages();
    }, []);

    const handleDelete = async (pageId, e) => {
        e.stopPropagation(); // <-- Prevent row click from firing
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette page ? Cette action est irréversible.')) {
            try {
                await apiClient(`/api/pages/${pageId}`, { method: 'DELETE' });
                setPages(pages.filter(page => page._id !== pageId));
                alert('Page supprimée avec succès.');
            } catch (err) {
                alert('Échec de la suppression de la page.');
                console.error(err);
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">Bibliothèque de Contenu</h1>
                <Link to="/create-page" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
                    <Plus className="w-5 h-5" /> Créer une page
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de création</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pages.length > 0 ? pages.map((page) => (
                            <tr 
                                key={page._id} 
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => navigate(`/pages/${page._id}`)} // <-- Make row clickable
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{page.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {page.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(page.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {/* --- UPDATED ACTIONS --- */}
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link to={`/pages/${page._id}`} onClick={(e) => e.stopPropagation()} className="p-2 rounded-full text-gray-400 hover:bg-blue-100 hover:text-blue-600" title="Voir">
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                        <Link to={`/edit-page/${page._id}`} onClick={(e) => e.stopPropagation()} className="p-2 rounded-full text-gray-400 hover:bg-yellow-100 hover:text-yellow-600" title="Modifier">
                                            <Edit className="w-5 h-5" />
                                        </Link>
                                        <button onClick={(e) => handleDelete(page._id, e)} className="p-2 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600" title="Supprimer">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="text-center py-10 text-gray-500">
                                    Aucune page trouvée. <Link to="/create-page" className="text-blue-600 hover:underline">Commencez par en créer une !</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PageList;