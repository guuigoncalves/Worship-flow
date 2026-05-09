import { useParams, Link } from 'react-router-dom';

export default function EntrarEspaco() {
  const { codigo } = useParams();
  return <main className="app-page grid place-items-center"><section className="card max-w-md p-6 text-center"><h1 className="font-display text-3xl font-bold">Entrar no espaço</h1><p className="mt-2 text-textoSecundario">Código de acesso: <span className="font-mono text-primaria">{codigo}</span></p><Link className="btn-primary mt-5" to="/espacos">Confirmar entrada</Link></section></main>;
}
