import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMedleys } from '../hooks/useMedleys';
import { ArrowLeft, Save, Plus, Trash2, Layers } from 'lucide-react';
import { SectionHeader } from '../components/aurora';

export const EditorMedley: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { obterMedley, salvarMedley } = useMedleys();

    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [blocos, setBlocos] = useState<any[]>([]);

    useEffect(() => {
        if (id && id !== 'novo') {
            const medley = obterMedley(id);
            if (medley) {
                setTitulo(medley.titulo || (medley as any).nome || '');
                setDescricao((medley as any).descricao || '');
                setBlocos(medley.blocos || []);
            }
        }
    }, [id, obterMedley]);

    const handleAdicionarBloco = () => {
        const novo = {
            id: String(Date.now()),
            tipo: 'musica',
            titulo: 'Novo Bloco',
            tom: 'C',
        };
        setBlocos([...blocos, novo]);
    };

    const handleRemoverBloco = (blocoId: string) => {
        setBlocos(blocos.filter((b) => b.id !== blocoId));
    };

    const handleSalvar = async () => {
        if (!titulo.trim()) return;
        await salvarMedley({
            id: id === 'novo' ? String(Date.now()) : id,
                           titulo,
                           blocos,
        } as any);
        navigate('/medleys');
    };

    return (
        <div className="app-page space-y-6 pb-24 fade-in max-w-2xl mx-auto">
        <button
        onClick={() => navigate('/medleys')}
        className="btn-ghost text-xs flex items-center gap-2"
        >
        <ArrowLeft size={16} />
        <span>Voltar para Medleys</span>
        </button>

        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gradient">
        {id === 'novo' ? 'Novo Medley' : 'Editar Medley'}
        </h1>
        <button
        onClick={handleSalvar}
        className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
        >
        <Save size={16} />
        <span>Salvar</span>
        </button>
        </div>

        <div className="card p-4 space-y-3 bg-white/5 border border-white/10">
        <div>
        <label className="block text-xs font-medium text-white/70 mb-1">
        Título do Medley *
        </label>
        <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Ex: Medley de Celebração"
        className="input text-xs w-full"
        />
        </div>

        <div>
        <label className="block text-xs font-medium text-white/70 mb-1">
        Descrição
        </label>
        <input
        type="text"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Observações do arranjo..."
        className="input text-xs w-full"
        />
        </div>
        </div>

        <div>
        <div className="flex items-center justify-between mb-3">
        <SectionHeader icone={<Layers size={16} />} titulo="Blocos do Medley" />
        <button
        onClick={handleAdicionarBloco}
        className="btn-ghost text-xs py-1 px-2.5 border border-white/10 flex items-center gap-1"
        >
        <Plus size={14} />
        <span>Adicionar Bloco</span>
        </button>
        </div>

        {blocos.length === 0 ? (
            <div className="card p-6 text-center text-xs text-white/50 border border-white/10">
            Nenhum bloco adicionado. Clique acima para adicionar.
            </div>
        ) : (
            <div className="space-y-2">
            {blocos.map((bloco, idx) => (
                <div
                key={bloco.id}
                className="card p-3 flex items-center justify-between gap-3 bg-white/5 border border-white/10"
                >
                <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-bold text-purple-400 w-5">
                {idx + 1}.
                </span>
                <input
                type="text"
                value={bloco.titulo}
                onChange={(e) => {
                    const copia = [...blocos];
                    copia[idx].titulo = e.target.value;
                    setBlocos(copia);
                }}
                className="input text-xs flex-1 py-1"
                />
                </div>
                <button
                onClick={() => handleRemoverBloco(bloco.id)}
                className="p-1.5 text-red-400 hover:text-red-300"
                >
                <Trash2 size={16} />
                </button>
                </div>
            ))}
            </div>
        )}
        </div>
        </div>
    );
};

export default EditorMedley;
