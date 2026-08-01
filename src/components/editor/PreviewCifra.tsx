import { ExibicaoCifra } from '../apresentacao/ExibicaoCifra';

export function PreviewCifra({ letra }: { letra: string }) {
  return (
    <div className="card overflow-auto p-4 max-h-[560px]">
      <ExibicaoCifra letra={letra} acordesProibidos={[]} modo="ambos" tamanho="pequeno" />
    </div>
  );
}
