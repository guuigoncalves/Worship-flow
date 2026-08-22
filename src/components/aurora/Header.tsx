import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from './Avatar';
import logo from '../../assets/logo-worshipflow.png';

interface HeaderProps {
  subtitulo?: string;
  titulo?: string;
  voltar?: boolean;
}

export function Header({ subtitulo, titulo, voltar }: HeaderProps) {
  const { user, perfilUsuario } = useAuth();
  const navigate = useNavigate();
  const primeiroNome = perfilUsuario?.nome?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Músico';
  const fotoUsuario = perfilUsuario?.foto || user?.photoURL || undefined;

  return (
    <header className="flex items-center justify-between pt-1 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {voltar && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity min-w-0">
          <img src={logo} alt="WorshipFlow" style={{ height: '44px', width: 'auto', display: 'block' }} />
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent leading-none truncate">
              {titulo || 'WorshipFlow'}
            </span>
            {subtitulo && <p className="text-[10px] text-white/40 mt-0.5 truncate">{subtitulo}</p>}
          </div>
        </Link>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!titulo && (
          <div className="text-right">
            <p className="text-xs font-medium text-white/80">
              Olá, {primeiroNome} <span className="inline-block animate-bounce">🎵</span>
            </p>
            <p className="text-[10px] text-white/40">Vamos fazer música hoje?</p>
          </div>
        )}
        <Link to="/perfil" aria-label="Perfil">
          <Avatar nome={primeiroNome} fotoUrl={fotoUsuario} tamanho="md" />
        </Link>
      </div>
    </header>
  );
}

