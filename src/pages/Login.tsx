import { Guitar, Mail, Phone, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

type LoginTab = 'email' | 'phone' | 'anonymous';

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
  const [tab, setTab] = useState<LoginTab>('email');
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  if (user) return <Navigate to={from} replace />;

  function submit(event: FormEvent) {
    event.preventDefault();
    void (cadastro ? signUpEmail(nome, email, senha, instrumento) : signInEmail(email, senha));
  }

  return (
    <main className="fixed inset-0 overflow-hidden">
      <div className="aurora-bg" aria-hidden="true" />
      <div className="absolute inset-0 bg-fundo/80" aria-hidden="true" />

      <div className="relative z-10 grid min-h-screen place-items-center p-5">
        <section className="fade-in w-full max-w-sm">
          <div className="card mx-auto p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-[var(--primaria)] to-[var(--acento)] text-fundo shadow-[0_18px_50px_var(--primaria-dim)]">
                <Guitar className="h-10 w-10" aria-hidden="true" />
              </div>
              <h1 className="m-0 text-3xl font-extrabold tracking-tight text-gradient">{t('app.name')}</h1>
              <p className="text-center text-sm text-textoSecundario">Seu assistente de louvor ao vivo</p>
            </div>

            <div className="mt-6 space-y-3">
              <button className="btn-primary w-full" type="button" onClick={() => void signInGoogle()}>
                <UserRound className="h-5 w-5" aria-hidden="true" />
                {t('login.google')}
              </button>

              <div className="mt-5 grid grid-cols-3 gap-1.5 rounded-xl bg-elevada p-1.5 text-xs font-medium">
                <button
                  type="button"
                  className={`rounded-lg px-2 py-1.5 transition-all ${tab === 'email' ? 'bg-primaria text-fundo' : 'text-textoSecundario hover:text-texto'}`}
                  onClick={() => setTab('email')}
                >
                  E-mail
                </button>
                <button
                  type="button"
                  className={`rounded-lg px-2 py-1.5 transition-all ${tab === 'phone' ? 'bg-primaria text-fundo' : 'text-textoSecundario hover:text-texto'}`}
                  onClick={() => setTab('phone')}
                >
                  Telefone
                </button>
                <button
                  type="button"
                  className={`rounded-lg px-2 py-1.5 transition-all ${tab === 'anonymous' ? 'bg-primaria text-fundo' : 'text-textoSecundario hover:text-texto'}`}
                  onClick={() => setTab('anonymous')}
                >
                  Anônimo
                </button>
              </div>

              <div className="pt-2">
                {tab === 'email' ? (
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
                  </form>
                ) : null}

                {tab === 'phone' ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textoSecundario" aria-hidden="true" />
                      <input className="input pl-10" value={telefone} onChange={(event) => setTelefone(event.target.value)} placeholder={t('login.phone')} />
                    </div>
                    <button className="btn-ghost w-full" type="button" onClick={() => void startPhoneSignIn(telefone)}>
                      <Mail className="h-4 w-4" />
                      {t('login.sendCode')}
                    </button>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textoSecundario" aria-hidden="true" />
                      <input className="input pl-10" value={codigo} onChange={(event) => setCodigo(event.target.value)} placeholder={t('login.phoneCode')} />
                    </div>
                    <button className="btn-primary w-full" type="button" onClick={() => void confirmPhoneCode(codigo)}>{t('login.confirmCode')}</button>
                    <div id="recaptcha-container" />
                  </div>
                ) : null}

                {tab === 'anonymous' ? (
                  <button className="btn-ghost w-full" type="button" onClick={() => void signInAnon()}>
                    <UserRound className="h-5 w-5" aria-hidden="true" />
                    {t('login.anonymous')}
                  </button>
                ) : null}
              </div>
            </div>

            {error ? <p className="mt-4 rounded-xl bg-perigo/10 p-3 text-sm text-perigo">{error}</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
