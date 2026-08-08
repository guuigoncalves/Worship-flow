import { BookOpen, Globe, Home, ListMusic, Lock, LogOut, Menu, Music2, Settings, ShieldCheck, User, Users } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PainelDeslizante } from './PainelDeslizante';

// IA por domínio: Início é o resumo/atalho, Música e Cifra são os dois
// pilares do produto (player/áudio vs. cifra/letra), e "Mais" guarda
// conta, ajustes e áreas menos usadas no dia a dia.
const principais = [
  { to: '/', label: 'Início', Icon: Home },
  { to: '/musica', label: 'Música', Icon: Music2 },
  { to: '/cifra', label: 'Cifra', Icon: BookOpen }
];

const extras = [
  { to: '/espacos', label: 'Espaços', Icon: Users },
  { to: '/comunidade', label: 'Comunidade', Icon: Globe },
  { to: '/playlists', label: 'Playlists', Icon: ListMusic },
  { to: '/configuracoes', label: 'Configurações', Icon: Settings },
  { to: '/perfil', label: 'Perfil', Icon: User }
];

export function NavegacaoInferior() {
  const [maisAberto, setMaisAberto] = useState(false);
  const [expandida, setExpandida] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isAdmin = Boolean(user?.uid && import.meta.env.VITE_ADM_UID && user.uid === import.meta.env.VITE_ADM_UID);
  const isPrivado = Boolean(user?.uid && !user.isAnonymous && (import.meta.env.VITE_PRIVADO_ALLOWLIST || '').split(',').map((s: string) => s.trim()).filter(Boolean).includes(user.uid));
  const itensPrivados = [{ to: '/privado', label: 'Privado', Icon: Lock }];
  const itensExtras = isAdmin ? [...extras, ...itensPrivados, { to: '/adm', label: 'Administração', Icon: ShieldCheck }] : [...extras, ...itensPrivados];

  const navItem = ({ to, label, Icon }: { to: string; label: string; Icon: typeof Home }) => (
    <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-rail-item flex min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive ? '' : 'text-textoSecundario hover:bg-elevada hover:text-texto'}`}>
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className={`${expandida ? 'md:inline' : 'md:hidden'} lg:inline truncate`}>{label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Dock flutuante — mobile */}
      <nav className="fixed inset-x-3 bottom-3 z-40 md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 p-1.5 rounded-3xl bg-[#141522]/90 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-purple-950/40">
          {principais.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className="flex min-w-0 flex-col items-center">
              {({ isActive }) => (
                <span
                  className={`flex w-full flex-col items-center gap-1 rounded-2xl py-2 px-1 text-[11px] font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                      : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="w-full truncate text-center">{label}</span>
                </span>
              )}
            </NavLink>
          ))}
          <button
            type="button"
            className="flex min-w-0 flex-col items-center gap-1 rounded-2xl py-2 px-1 text-[11px] font-semibold text-white/50 hover:text-white hover:bg-white/5 border border-transparent transition-all"
            onClick={() => setMaisAberto(true)}
          >
            <Menu className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>Mais</span>
          </button>
        </div>
      </nav>

      {/* Trilho lateral — desktop */}
      <aside className={`fixed bottom-4 left-4 top-4 z-30 hidden rounded-3xl border border-borda bg-superficie/80 p-3 backdrop-blur-xl md:flex md:flex-col ${expandida ? 'w-56' : 'w-20'} lg:w-60`}>
        <button className="mb-5 flex items-center gap-3 rounded-xl p-2 text-left" type="button" onClick={() => setExpandida((valor) => !valor)}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--primaria)] to-[var(--acento)] font-display font-bold text-fundo">WF</span>
          <span className={`${expandida ? 'md:block' : 'md:hidden'} font-display text-lg font-bold lg:block`}>WorshipFlow</span>
        </button>
        <div className="grid gap-2">{[...principais, ...itensExtras].map(navItem)}</div>
        <button className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-perigo" type="button" onClick={() => void logout().then(() => navigate('/login'))}>
          <LogOut className="h-5 w-5" /><span className={`${expandida ? 'md:inline' : 'md:hidden'} lg:inline`}>Sair</span>
        </button>
      </aside>

      <PainelDeslizante aberto={maisAberto} titulo="Mais" onClose={() => setMaisAberto(false)}>
        <div className="grid gap-2">
          {itensExtras.map(({ to, label, Icon }) => (
            <button key={to} className="btn-ghost justify-start" type="button" onClick={() => { setMaisAberto(false); navigate(to); }}><Icon className="h-5 w-5" />{label}</button>
          ))}
          <button className="btn-ghost justify-start text-perigo" type="button" onClick={() => void logout().then(() => navigate('/login'))}><LogOut className="h-5 w-5" />Sair</button>
        </div>
      </PainelDeslizante>
    </>
  );
}
