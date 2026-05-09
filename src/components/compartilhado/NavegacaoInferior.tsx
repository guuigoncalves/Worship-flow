import { BookOpen, Boxes, Disc3, Home, Library, LogOut, Menu, Music4, PenLine, Search, Settings, User, Users } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PainelDeslizante } from './PainelDeslizante';

const principais = [
  { to: '/', label: 'Início', Icon: Home },
  { to: '/busca-rapida', label: 'Busca', Icon: Search },
  { to: '/player', label: 'Player', Icon: Disc3 },
  { to: '/medleys', label: 'Medleys', Icon: Music4 }
];

const extras = [
  { to: '/biblioteca', label: 'Biblioteca', Icon: BookOpen },
  { to: '/editor', label: 'Editor', Icon: PenLine },
  { to: '/espacos', label: 'Espaços', Icon: Boxes },
  { to: '/importar', label: 'Importar', Icon: Library },
  { to: '/artistas', label: 'Artistas', Icon: Users },
  { to: '/configuracoes', label: 'Configurações', Icon: Settings },
  { to: '/perfil', label: 'Perfil', Icon: User }
];

export function NavegacaoInferior() {
  const [maisAberto, setMaisAberto] = useState(false);
  const [expandida, setExpandida] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItem = ({ to, label, Icon }: { to: string; label: string; Icon: typeof Home }) => (
    <NavLink key={to} to={to} className={({ isActive }) => `flex min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-primaria text-fundo' : 'text-textoSecundario hover:bg-elevada hover:text-texto'}`}>
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className={`${expandida ? 'md:inline' : 'md:hidden'} lg:inline truncate`}>{label}</span>
    </NavLink>
  );

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-borda bg-superficie/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          {principais.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] transition ${isActive ? 'bg-elevada text-primaria' : 'text-textoSecundario'}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="w-full truncate text-center">{label}</span>
            </NavLink>
          ))}
          <button type="button" className="flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] text-textoSecundario" onClick={() => setMaisAberto(true)}>
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span>Mais</span>
          </button>
        </div>
      </nav>

      <aside className={`fixed bottom-0 left-0 top-0 z-30 hidden border-r border-borda bg-superficie/95 p-3 backdrop-blur md:flex md:flex-col ${expandida ? 'w-56' : 'w-20'} lg:w-60`}>
        <button className="mb-5 flex items-center gap-3 rounded-xl p-2 text-left" type="button" onClick={() => setExpandida((valor) => !valor)}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primaria font-display font-bold text-fundo">WF</span>
          <span className={`${expandida ? 'md:block' : 'md:hidden'} font-display text-lg font-bold lg:block`}>WorshipFlow</span>
        </button>
        <div className="grid gap-2">{[...principais, ...extras].map(navItem)}</div>
        <button className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-perigo" type="button" onClick={() => void logout().then(() => navigate('/login'))}>
          <LogOut className="h-5 w-5" /><span className={`${expandida ? 'md:inline' : 'md:hidden'} lg:inline`}>Sair</span>
        </button>
      </aside>

      <PainelDeslizante aberto={maisAberto} titulo="Mais" onClose={() => setMaisAberto(false)}>
        <div className="grid gap-2">
          {extras.map(({ to, label, Icon }) => (
            <button key={to} className="btn-ghost justify-start" type="button" onClick={() => { setMaisAberto(false); navigate(to); }}><Icon className="h-5 w-5" />{label}</button>
          ))}
          <button className="btn-ghost justify-start text-perigo" type="button" onClick={() => void logout().then(() => navigate('/login'))}><LogOut className="h-5 w-5" />Sair</button>
        </div>
      </PainelDeslizante>
    </>
  );
}
