import { Link } from 'react-router-dom';
import { Copy, Plus } from 'lucide-react';

const espacos = [{ id: 'ministerio-local', nome: 'Ministério Local', tipo: 'ministerio', papel: 'Dono', membros: 6, musicas: 24, codigo: 'WF2026' }];

export default function Espacos() {
  return <main className="app-page"><div className="flex items-center justify-between gap-3"><h1 className="font-display text-3xl font-bold">Meus Espaços</h1><button className="btn-primary"><Plus className="h-4 w-4" />Criar</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{espacos.map((espaco) => <Link key={espaco.id} className="card p-5" to={`/espaco/${espaco.id}`}><div className="text-3xl">🎵</div><h2 className="mt-3 font-display text-xl font-bold">{espaco.nome}</h2><p className="text-sm text-textoSecundario">{espaco.membros} membros · {espaco.musicas} músicas</p><div className="mt-3 flex items-center justify-between"><span className="chip chip-active">{espaco.papel}</span><button className="btn-text" type="button" onClick={(e) => { e.preventDefault(); void navigator.clipboard?.writeText(espaco.codigo); }}><Copy className="h-4 w-4" />{espaco.codigo}</button></div></Link>)}</div></main>;
}
