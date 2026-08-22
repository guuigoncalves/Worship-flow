import React from 'react';
import { Tom } from '../../types';
import { COR_TOM } from '../../data/cores-tom';

interface CapaMusicaProps {
    tom?: Tom | string;
    titulo?: string;
    tamanho?: 'sm' | 'md' | 'lg';
    className?: string;
    capaUrl?: string;
}

export const CapaMusica: React.FC<CapaMusicaProps> = ({
    tom,
    titulo = '',
    tamanho = 'md',
    className = '',
    capaUrl,
}) => {
    const tamanhos = {
        sm: 'w-9 h-9 text-xs rounded-lg',
        md: 'w-12 h-12 text-sm rounded-xl',
        lg: 'w-16 h-16 text-base rounded-2xl',
    };

    const corHex = tom && COR_TOM[tom as Tom] ? COR_TOM[tom as Tom] : '#8B5CF6';
    const inicial = titulo ? titulo.charAt(0).toUpperCase() : (tom || '♪');

    if (capaUrl) {
        return (
            <img
                src={capaUrl}
                alt={titulo || tom || ''}
                className={`${tamanhos[tamanho]} object-cover rounded-xl border border-white/10 shadow-md shrink-0 ${className}`}
            />
        );
    }

    return (
        <div
        className={`${tamanhos[tamanho]} flex items-center justify-center font-bold text-white shadow-md border border-white/10 shrink-0 ${className}`}
        style={{
            background: `linear-gradient(135deg, ${corHex}DD, ${corHex}44)`,
        }}
        >
        {tom ? tom : inicial}
        </div>
    );
};
