import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from './Avatar';

interface HeaderProps {
  subtitulo?: string;
}

export function Header({ subtitulo }: HeaderProps) {
  const { user, perfilUsuario } = useAuth();
  const primeiroNome = perfilUsuario?.nome?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Músico';
  const fotoUsuario = perfilUsuario?.foto || user?.photoURL || undefined;

  return (
    <header className="flex items-center justify-between pt-1">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-2xl bg-gradient-to-br from-[var(--primaria)] to-[var(--acento)] text-fundo">
          <Activity size={24} className="animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient tracking-tight">WorshipFlow</h1>
          {subtitulo && <p className="text-[10px] text-white/40">{subtitulo}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-xs font-medium text-white/80">
            Olá, {primeiroNome} <span className="inline-block animate-bounce">🎵</span>
          </p>
          <p className="text-[10px] text-white/40">Vamos fazer música hoje?</p>
        </div>
        <Link to="/perfil" aria-label="Perfil">
          <Avatar nome={primeiroNome} fotoUrl={fotoUsuario} tamanho="md" />
        </Link>
      </div>
    </header>
  );
}
