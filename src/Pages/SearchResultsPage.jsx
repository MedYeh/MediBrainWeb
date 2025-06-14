// src/pages/SearchResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom'; // <-- Import useNavigate
import apiClient from '../Utils/apiClient';
import { Edit, Trash2, Loader2, Search, Eye } from 'lucide-react'; // <-- Import Eye icon

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const navigate = useNavigate(); // <-- Initialize useNavigate

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query) {
            setResults([]);
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient(`/api/pages/search?term=${query}`);
                setResults(response);
            } catch (err) {
                setError('Failed to fetch search results.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    const handleDelete = async (pageId, e) => {
        e.stopPropagation(); // <-- Prevent row click from firing
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette page ? Cette action est irréversible.')) {
            try {
                await apiClient(`/api/pages/${pageId}`, { method: 'DELETE' });
                setResults(results.filter(page => page._id !== pageId));
                alert('Page supprimée avec succès.');
            } catch (err) {
                alert('Échec de la suppression de la page.');
                console.error(err);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6 border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-800">Résultats de la recherche</h1>
                <p className="text-gray-600 mt-1">Pour: <span className="font-semibold">"{query}"</span></p>
            </div>

            {loading && <div className="text-center p-8"><Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500" /></div>}
            {error && <div className="text-center p-8 text-red-500">{error}</div>}
            
            {!loading && !error && (
                results.length > 0 ? (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {results.map((page) => (
                                    <tr 
                                        key={page._id} 
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/pages/${page._id}`)} // <-- Make row clickable
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{page.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{page.category}</span>
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-12 bg-white rounded-lg shadow-md">
                        <Search className="w-16 h-16 mx-auto text-gray-300" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun résultat trouvé</h3>
                        <p className="mt-1 text-sm text-gray-500">Essayez une recherche différente.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default SearchResultsPage;