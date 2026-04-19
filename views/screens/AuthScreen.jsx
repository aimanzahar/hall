// views/screens/AuthScreen.jsx — Public sign-in / sign-up for customers.
(function () {
  const { useState } = React;
  const { Icon } = HB.Views;
  const A = HB.Models.Auth;

  function Field({ label, type, value, onChange, autoComplete, required, placeholder, error, onBlur }) {
    return (
      <label className="auth-field">
        <span className="auth-label">{label}</span>
        <input
          className={`auth-input ${error ? 'has-error' : ''}`}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
        />
        {error && <span className="auth-field-error">{error}</span>}
      </label>
    );
  }

  function LoginForm({ onSubmit, onSwitch, busy, error }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [touched, setTouched] = useState({});
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passOk = password.length >= 5;

    return (
      <form className="auth-form" onSubmit={e => {
        e.preventDefault();
        setTouched({ email:true, password:true });
        if (!emailOk || !passOk) return;
        onSubmit({ email, password });
      }} noValidate>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to manage your HallBook requests.</p>
        <Field label="Email" type="email" value={email} onChange={setEmail}
          onBlur={() => setTouched(t => ({ ...t, email:true }))}
          autoComplete="email" required placeholder="you@example.com"
          error={touched.email && !emailOk ? 'Enter a valid email address.' : ''}/>
        <Field label="Password" type="password" value={password} onChange={setPassword}
          onBlur={() => setTouched(t => ({ ...t, password:true }))}
          autoComplete="current-password" required placeholder="••••••••"
          error={touched.password && !passOk ? 'Password must be at least 5 characters.' : ''}/>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="btn primary auth-submit" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <div className="auth-switch">
          New here?{' '}
          <button type="button" className="auth-link" onClick={onSwitch}>Create an account</button>
        </div>
      </form>
    );
  }

  function RegisterForm({ onSubmit, onSwitch, busy, error }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [touched, setTouched] = useState({});

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passOk = password.length >= 8;
    const nameOk = name.trim().length >= 2;
    const match = password && passwordConfirm && password === passwordConfirm;

    return (
      <form className="auth-form" onSubmit={e => {
        e.preventDefault();
        setTouched({ name:true, email:true, password:true, passwordConfirm:true });
        if (!(emailOk && passOk && nameOk && match)) return;
        onSubmit({ name: name.trim(), email, password, passwordConfirm });
      }} noValidate>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Book halls across Malaysia, save favourites, track every request.</p>
        <Field label="Full name" type="text" value={name} onChange={setName}
          onBlur={() => setTouched(t => ({ ...t, name:true }))}
          autoComplete="name" placeholder="e.g. Aiman bin Zahar"
          error={touched.name && !nameOk ? 'Enter your full name (min 2 characters).' : ''}/>
        <Field label="Email" type="email" value={email} onChange={setEmail}
          onBlur={() => setTouched(t => ({ ...t, email:true }))}
          autoComplete="email" required placeholder="you@example.com"
          error={touched.email && !emailOk ? 'Enter a valid email address.' : ''}/>
        <Field label="Password" type="password" value={password} onChange={setPassword}
          onBlur={() => setTouched(t => ({ ...t, password:true }))}
          autoComplete="new-password" required placeholder="At least 8 characters"
          error={touched.password && !passOk ? 'Password must be at least 8 characters.' : ''}/>
        <Field label="Confirm password" type="password" value={passwordConfirm} onChange={setPasswordConfirm}
          onBlur={() => setTouched(t => ({ ...t, passwordConfirm:true }))}
          autoComplete="new-password" required placeholder="Repeat password"
          error={touched.passwordConfirm && password !== passwordConfirm ? 'Passwords do not match.' : ''}/>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="btn primary auth-submit" type="submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
        <div className="auth-switch">
          Already registered?{' '}
          <button type="button" className="auth-link" onClick={onSwitch}>Sign in instead</button>
        </div>
      </form>
    );
  }

  function AuthScreen({ login, register, busy, onClose, onAdminSignIn }) {
    const [mode, setMode] = useState('login');
    const [error, setError] = useState(null);

    const submitLogin = async ({ email, password }) => {
      setError(null);
      try { await login(email, password); }
      catch (err) { setError(A.errorMessage(err)); }
    };
    const submitRegister = async (payload) => {
      setError(null);
      try { await register(payload); }
      catch (err) { setError(A.errorMessage(err)); }
    };
    const switchTo = (next) => { setError(null); setMode(next); };

    return (
      <div className="auth-root">
        {onClose && (
          <button className="auth-back" onClick={onClose} type="button" aria-label="Back to home">
            <Icon name="arrow-left" size={14}/> Back to site
          </button>
        )}
        <aside className="auth-aside">
          <div className="auth-brand">
            <div className="brand-mark">H</div>
            <div className="brand-name">Hall<em>book</em></div>
          </div>
          <div className="auth-pitch">
            <h2>Malaysia's venue booking platform.</h2>
            <p>Request a hall anywhere — from KL to Kuching — and let the venue team confirm within 24 hours.</p>
          </div>
          <div className="auth-features">
            <div className="auth-feature"><Icon name="pin" size={14}/> 6 states, growing</div>
            <div className="auth-feature"><Icon name="clock" size={14}/> 24-hour admin review</div>
            <div className="auth-feature"><Icon name="ticket" size={14}/> One place for every request</div>
          </div>
          {onAdminSignIn && (
            <button className="auth-admin-link" type="button" onClick={onAdminSignIn}>
              Venue operator? <span>Sign in as admin</span>
            </button>
          )}
        </aside>

        <section className="auth-panel">
          <div className="auth-card">
            {mode === 'login'
              ? <LoginForm onSubmit={submitLogin} onSwitch={() => switchTo('register')} busy={busy} error={error}/>
              : <RegisterForm onSubmit={submitRegister} onSwitch={() => switchTo('login')} busy={busy} error={error}/>}
          </div>
          <div className="auth-footer">
            Connected to <code>{A.PB_URL.replace('https://', '')}</code>
          </div>
        </section>
      </div>
    );
  }

  HB.Views.AuthScreen = AuthScreen;
})();
