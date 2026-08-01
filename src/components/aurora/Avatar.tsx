import React from 'react';

interface AvatarProps {
    nome?: string;
    fotoUrl?: string;
    tamanho?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
    nome = 'Usuário',
    fotoUrl,
    tamanho = 'md',
    className = '',
}) => {
    const tamanhos = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
    };

    const inicial = nome.charAt(0).toUpperCase();

    if (fotoUrl) {
        return (
            <img
            src={fotoUrl}
            alt={nome}
            className={`${tamanhos[tamanho]} rounded-full object-cover border border-white/20 shadow-sm ${className}`}
            />
        );
    }

    return (
        <div
        className={`${tamanhos[tamanho]} rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-semibold flex items-center justify-center border border-white/20 shadow-sm ${className}`}
        >
        {inicial}
        </div>
    );
};
