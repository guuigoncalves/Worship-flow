import { ExibicaoCifra } from '../apresentacao/ExibicaoCifra';

export function PreviewCifra({ letra, possuiCifra, formato = 'acima' }: { letra: string; possuiCifra?: boolean; formato?: 'acima' | 'inline' }) {
  return (
    <div className="card overflow-auto p-4 max-h-[560px]">
      <ExibicaoCifra letra={letra} acordesProibidos={[]} modo="ambos" tamanho="pequeno" possuiCifra={possuiCifra} formato={formato} />
    </div>
  );
}
