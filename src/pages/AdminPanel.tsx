import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMusicas } from '../hooks/useMusicas';

const tabs = ['Pendentes', 'Aprovadas', 'Denunciadas', 'Removidas', 'Tudo'] as const;

export default function AdminPanel() {
  const { user } = useAuth();
  const { musicas } = useMusicas();
  const [tab, setTab] = useState<typeof tabs[number]>('Pendentes');
  const isAdmin = user?.uid && import.meta.env.VITE_ADM_UID && user.uid === import.meta.env.VITE_ADM_UID;
  const itens = useMemo(() => musicas.map((musica, index) => ({ ...musica, status: index % 4 === 0 ? 'pendente' : index % 5 === 0 ? 'removida' : 'aprovada', denuncias: index % 3 })), [musicas]);
  if (!isAdmin) return <Navigate to="/" replace />;
  return <main className="app-page"><h1 className="font-display text-3xl font-bold">Administração</h1><div className="mt-5 flex gap-2 overflow-auto">{tabs.map((item) => <button key={item} className={`chip ${tab === item ? 'chip-active' : ''}`} onClick={() => setTab(item)}>{item}</button>)}</div><div className="mt-6 grid gap-3">{itens.map((musica) => <article className="card p-4" key={musica.id}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-display text-xl font-bold">{musica.titulo}</h2><p className="text-sm text-textoSecundario">{musica.artista} · Autor: {user?.email ?? user?.uid} · {new Date(musica.criadaEm).toLocaleDateString('pt-BR')}</p></div><span className="chip chip-active">{musica.status}</span></div><p className="mt-3 text-sm text-textoSecundario">Histórico de denúncias: {musica.denuncias}</p><div className="mt-4 flex gap-2"><button className="btn-primary">Aprovar</button><button className="btn-ghost text-perigo">Remover</button><button className="btn-ghost">Ver completo</button></div></article>)}</div></main>;
}
