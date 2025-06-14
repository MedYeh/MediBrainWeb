// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Book, FilePlus, LayoutDashboard, Settings, BrainCircuit } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Tableau de bord', href: '/dashboard' },
        { icon: FilePlus, label: 'Nouveau Contenu', href: '/create-page' },
        { icon: Book, label: 'Bibliothèque', href: '/pages' },
        { icon: Settings, label: 'Paramètres', href: '/settings' },
    ];

    return (
        <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
            <div className="h-16 flex items-center justify-center px-4 border-b border-gray-700">
                <BrainCircuit className="w-8 h-8 text-blue-400" />
                <h1 className="text-xl font-bold ml-2">MediBrain</h1>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
                <ul>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <li key={item.label}>
                                <Link
                                    to={item.href}
                                    className={`flex items-center p-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors ${isActive ? 'bg-gray-900' : ''}`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="p-4 border-t border-gray-700">
                <p className="text-xs text-gray-400">© 2024 MediBrain. Tous droits réservés.</p>
            </div>
        </aside>
    );
};

export default Sidebar;