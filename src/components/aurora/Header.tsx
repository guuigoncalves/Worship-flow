import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from './Avatar';
import logo from '../../assets/logo-worshipflow.png';

interface HeaderProps {
  subtitulo?: string;
}

export function Header({ subtitulo }: HeaderProps) {
  const { user, perfilUsuario } = useAuth();
  const primeiroNome = perfilUsuario?.nome?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Músico';
  const fotoUsuario = perfilUsuario?.foto || user?.photoURL || undefined;

  return (
    <header className="flex items-center justify-between pt-1">
      <div className="flex items-center gap-2.5">
        <img src={logo} alt="WorshipFlow" style={{ height: '44px', width: 'auto', display: 'block' }} />
        <div className="flex flex-col justify-center">
          <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent leading-none">
            WorshipFlow
          </span>
          {subtitulo && <p className="text-[10px] text-white/40 mt-0.5">{subtitulo}</p>}
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
