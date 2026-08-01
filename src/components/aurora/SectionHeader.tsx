import React from 'react';

interface SectionHeaderProps {
    icone?: React.ReactNode;
    titulo: string;
    acaoTexto?: string;
    onAcao?: () => void;
    className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    icone,
    titulo,
    acaoTexto,
    onAcao,
    className = '',
}) => {
    return (
        <div className={`flex items-center justify-between mb-3 px-1 ${className}`}>
        <div className="flex items-center gap-2">
        {icone && <span className="text-purple-400 text-lg">{icone}</span>}
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/70">
        {titulo}
        </h2>
        </div>
        {acaoTexto && onAcao && (
            <button
            onClick={onAcao}
            className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
            >
            {acaoTexto} &rsaquo;
            </button>
        )}
        </div>
    );
};
