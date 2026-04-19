// views/screens/AuthScreen.jsx — Unauthenticated shell: brand + login or
// register form, toggled by internal `mode`. Calls props.login / props.register
// which come from the useAuth controller.
(function () {
  const { useState } = React;
  const { Icon } = HB.Views;
  const A = HB.Models.Auth;

  function Field({ label, type, value, onChange, autoComplete, required, placeholder }) {
    return (
      <label className="auth-field">
        <span className="auth-label">{label}</span>
        <input
          className="auth-input"
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
        />
      </label>
    );
  }

  function LoginForm({ onSubmit, onSwitch, busy, error }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    return (
      <form
        className="auth-form"
        onSubmit={e => { e.preventDefault(); onSubmit({ email, password }); }}
      >
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to manage your HallBook reservations.</p>
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required placeholder="you@example.com"/>
        <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" required placeholder="••••••••"/>
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
    const mismatch = password && passwordConfirm && password !== passwordConfirm;
    return (
      <form
        className="auth-form"
        onSubmit={e => {
          e.preventDefault();
          if (mismatch) return;
          onSubmit({ name, email, password, passwordConfirm });
        }}
      >
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Book venues, save favourites, track every event.</p>
        <Field label="Name" type="text" value={name} onChange={setName} autoComplete="name" placeholder="Your name"/>
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required placeholder="you@example.com"/>
        <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" required placeholder="At least 8 characters"/>
        <Field label="Confirm password" type="password" value={passwordConfirm} onChange={setPasswordConfirm} autoComplete="new-password" required placeholder="Repeat password"/>
        {mismatch && <div className="auth-error" role="alert">Passwords do not match.</div>}
        {error && !mismatch && <div className="auth-error" role="alert">{error}</div>}
        <button className="btn primary auth-submit" type="submit" disabled={busy || mismatch}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
        <div className="auth-switch">
          Already registered?{' '}
          <button type="button" className="auth-link" onClick={onSwitch}>Sign in instead</button>
        </div>
      </form>
    );
  }

  function AuthScreen({ login, register, busy, onClose }) {
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
          <button
            className="auth-back"
            onClick={onClose}
            type="button"
            aria-label="Back to home"
          >
            <Icon name="arrow-left" size={14}/> Back to home
          </button>
        )}
        <aside className="auth-aside">
          <div className="auth-brand">
            <div className="brand-mark">H</div>
            <div className="brand-name">Hall<em>book</em></div>
          </div>
          <div className="auth-pitch">
            <h2>Self-service venue booking, open 24/7.</h2>
            <p>Find a room, hold a date, check in with a PIN — no phone calls, no forms, no drama.</p>
          </div>
          <div className="auth-features">
            <div className="auth-feature"><Icon name="clock" size={14}/> Instant confirmations</div>
            <div className="auth-feature"><Icon name="qr" size={14}/> QR & PIN self check-in</div>
            <div className="auth-feature"><Icon name="ticket" size={14}/> One place for every booking</div>
          </div>
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
