import React from 'react';
import { NavLink } from 'react-router-dom';
import { Music, FileText, Layers, Users } from 'lucide-react';

export function Navegacao() {
    const itens = [
        { label: 'Músicas', path: '/musica', icon: Music, cor: 'text-[var(--primaria)] bg-[var(--primaria-dim)]' },
        { label: 'Cifras', path: '/cifra', icon: FileText, cor: 'text-cyan-400 bg-cyan-500/10' },
        { label: 'Espaços', path: '/espacos', icon: Layers, cor: 'text-emerald-400 bg-emerald-500/10' },
        { label: 'Comunidade', path: '/comunidade', icon: Users, cor: 'text-amber-400 bg-amber-500/10' }
    ];

    return (
        <nav className="grid grid-cols-4 gap-2 sm:gap-3 w-full">
        {itens.map((item) => {
            const Icon = item.icon;
            return (
                <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                `flex flex-col items-center gap-1.5 py-2.5 sm:py-3 rounded-2xl border transition-all ${
                    isActive
                    ? 'border-[var(--primaria)]/50 bg-[var(--primaria-dim)]'
                    : 'border-white/10 bg-[#12142B] hover:border-white/20'
                }`
                }
                >
                {({ isActive }) => (
                    <>
                    <div className={`p-2 rounded-xl ${item.cor} ${isActive ? 'scale-110' : ''} transition-transform`}>
                    <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-bold truncate ${isActive ? 'text-white' : 'text-white/50'}`}>
                    {item.label}
                    </span>
                    </>
                )}
                </NavLink>
            );
        })}
        </nav>
    );
}
