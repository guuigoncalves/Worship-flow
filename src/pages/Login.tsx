import { Guitar, Mail, Phone, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PainelDeslizante } from '../components/compartilhado/PainelDeslizante';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, error, signInGoogle, signInEmail, signUpEmail, signInAnon, startPhoneSignIn, confirmPhoneCode } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [instrumento, setInstrumento] = useState('violao');
  const [telefone, setTelefone] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cadastro, setCadastro] = useState(false);
  const [emailAberto, setEmailAberto] = useState(false);
  const [outrasAberto, setOutrasAberto] = useState(false);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  if (user) return <Navigate to={from} replace />;

  function submit(event: FormEvent) {
    event.preventDefault();
    void (cadastro ? signUpEmail(nome, email, senha, instrumento) : signInEmail(email, senha));
  }

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(232,184,48,0.18),transparent_38%),linear-gradient(180deg,#11111d_0%,#080810_64%)] p-5">
      <section className="fade-in flex w-full max-w-sm flex-col items-center text-center">
        <div className="mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-primaria text-fundo shadow-[0_18px_50px_rgba(232,184,48,0.22)]">
          <Guitar className="h-10 w-10" aria-hidden="true" />
        </div>
        <h1 className="m-0 text-4xl font-extrabold tracking-normal">{t('app.name')}</h1>
        <p className="mb-10 mt-2 text-base text-textoSecundario">Seu assistente de louvor ao vivo</p>
        <div className="grid w-full gap-3">
          <button className="btn-primary w-full" type="button" onClick={() => void signInGoogle()}>
            <UserRound className="h-5 w-5" aria-hidden="true" />
            {t('login.google')}
          </button>
          <button className="btn-ghost w-full" type="button" onClick={() => setEmailAberto(true)}>
            <Mail className="h-5 w-5" aria-hidden="true" />
            {t('login.enter')}
          </button>
          <button className="btn-text w-full" type="button" onClick={() => void signInAnon()}>
            {t('login.anonymous')}
          </button>
        </div>
        <button className="btn-text mt-8 text-sm text-textoSecundario" type="button" onClick={() => setOutrasAberto(true)}>
          Outras opções
        </button>
        {error ? <p className="mt-4 rounded bg-perigo/10 p-3 text-sm text-perigo">{error}</p> : null}
      </section>

      <PainelDeslizante aberto={emailAberto} titulo={cadastro ? t('login.create') : t('login.enter')} onClose={() => setEmailAberto(false)}>
        <form className="space-y-3" onSubmit={submit}>
          {cadastro ? (
            <>
              <input className="input" value={nome} onChange={(event) => setNome(event.target.value)} placeholder={t('login.name')} required />
              <input className="input" value={instrumento} onChange={(event) => setInstrumento(event.target.value)} placeholder={t('login.instrument')} required />
            </>
          ) : null}
          <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t('login.email')} required />
          <input className="input" type="password" value={senha} onChange={(event) => setSenha(event.target.value)} placeholder={t('login.password')} required />
          <button className="btn-primary w-full" type="submit">{cadastro ? t('login.create') : t('login.enter')}</button>
          <button className="btn-text w-full" type="button" onClick={() => setCadastro((valor) => !valor)}>{cadastro ? t('login.enter') : t('login.create')}</button>
          <button className="btn-text w-full text-sm text-textoSecundario" type="button">Esqueci minha senha</button>
        </form>
      </PainelDeslizante>

      <PainelDeslizante aberto={outrasAberto} titulo="Outras opções" onClose={() => setOutrasAberto(false)}>
        <div className="grid gap-2">
          <input className="input" value={telefone} onChange={(event) => setTelefone(event.target.value)} placeholder={t('login.phone')} />
          <button className="btn-ghost w-full" type="button" onClick={() => void startPhoneSignIn(telefone)}><Phone className="h-4 w-4" />{t('login.sendCode')}</button>
          <input className="input" value={codigo} onChange={(event) => setCodigo(event.target.value)} placeholder={t('login.phoneCode')} />
          <button className="btn-primary w-full" type="button" onClick={() => void confirmPhoneCode(codigo)}>{t('login.confirmCode')}</button>
          <div id="recaptcha-container" />
        </div>
      </PainelDeslizante>
    </main>
  );
}
