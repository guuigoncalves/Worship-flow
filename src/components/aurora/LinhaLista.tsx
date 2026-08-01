import React from 'react';

interface LinhaListaProps {
    prefixo?: React.ReactNode;
    titulo: string;
    subtitulo?: string;
    sufixo?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export const LinhaLista: React.FC<LinhaListaProps> = ({
    prefixo,
    titulo,
    subtitulo,
    sufixo,
    onClick,
    className = '',
}) => {
    return (
        <div
        onClick={onClick}
        className={`group flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 hover:bg-white/5 active:scale-[0.99] cursor-pointer border border-transparent hover:border-white/10 ${className}`}
        >
        <div className="flex items-center gap-3 min-w-0 pr-2">
        {prefixo && <div className="shrink-0">{prefixo}</div>}
        <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white/90 truncate group-hover:text-white">
        {titulo}
        </p>
        {subtitulo && (
            <p className="text-xs text-white/50 truncate group-hover:text-white/70">
            {subtitulo}
            </p>
        )}
        </div>
        </div>
        {sufixo && <div className="shrink-0 text-xs text-white/40">{sufixo}</div>}
        </div>
    );
};
