import { ExibicaoCifra } from '../apresentacao/ExibicaoCifra';

export function PreviewCifra({ letra }: { letra: string }) {
  return (
    <div className="card max-h-[560px] overflow-auto p-4">
      <ExibicaoCifra letra={letra} acordesProibidos={[]} modo="ambos" tamanho="pequeno" />
    </div>
  );
}
