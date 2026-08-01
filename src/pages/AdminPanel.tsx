import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Check, LogOut, Shield, Trash2, Users } from 'lucide-react';
import { SectionHeader, CapaMusica } from '../components/aurora';
import { EstadoVazio } from '../components/compartilhado/EstadoVazio';
import { useAuth } from '../hooks/useAuth';
import { useComunidade } from '../hooks/useComunidade';

const adminTabs = ['pendentes', 'comunidade'] as const;

export default function AdminPanel() {
  const { user } = useAuth();
  const { pendentes, aprovarMusica, rejeitarMusica } = useComunidade();
  const isAdmin = Boolean(user?.uid && import.meta.env.VITE_ADM_UID && user.uid === import.meta.env.VITE_ADM_UID);
  const [tab, setTab] = useState<(typeof adminTabs)[number]>('pendentes');

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <main className="app-page fade-in">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primaria" aria-hidden="true" />
        <h1 className="font-display text-3xl font-bold text-gradient">Administração</h1>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-1.5 rounded-xl bg-elevada p-1.5 text-sm font-medium">
        <button
          type="button"
          className={`rounded-lg px-2 py-1.5 transition-all ${tab === 'pendentes' ? 'bg-primaria text-fundo' : 'text-textoSecundario hover:text-texto'}`}
          onClick={() => setTab('pendentes')}
        >
          Pendentes ({pendentes.length})
        </button>
        <button
          type="button"
          className={`rounded-lg px-2 py-1.5 transition-all ${tab === 'comunidade' ? 'bg-primaria text-fundo' : 'text-textoSecundario hover:text-texto'}`}
          onClick={() => setTab('comunidade')}
        >
          Comunidade
        </button>
      </div>

      {tab === 'pendentes' ? (
        <section className="mt-6">
          <SectionHeader icone={<Users size={16} />} titulo="Músicas pendentes de aprovação" />
          {pendentes.length === 0 ? (
            <EstadoVazio titulo="Nenhuma música pendente" texto="Quando usuários enviarem cifras para a comunidade, elas aparecerão aqui para aprovação." />
          ) : (
            <div className="card divide-y divide-borda">
              {pendentes.map((musica) => (
                <div key={musica.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <CapaMusica tom={musica.tom} titulo={musica.titulo} tamanho="sm" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold">{musica.titulo}</h2>
                      <p className="truncate text-sm text-textoSecundario">{musica.artista} · {musica.tom}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-ghost h-9 w-9 p-0 text-sucesso"
                      onClick={() => void aprovarMusica(musica.id)}
                      aria-label="Aprovar"
                      title="Aprovar"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="btn-ghost h-9 w-9 p-0 text-perigo"
                      onClick={() => void rejeitarMusica(musica.id)}
                      aria-label="Rejeitar"
                      title="Rejeitar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="mt-6">
          <SectionHeader icone={<Shield size={16} />} titulo="Moderação de comunidade" />
          <div className="mt-4 rounded-xl bg-elevada p-4 text-sm text-textoSecundario">
            <p className="font-semibold text-texto">Funcionalidade completa</p>
            <p className="mt-1">
              A coleção <code className="font-mono text-primaria">comunidade/{'{id}'}</code> está configurada com envio, aprovação e rejeição de músicas.
              Use a aba "Pendentes" acima para moderar submissões da comunidade.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
