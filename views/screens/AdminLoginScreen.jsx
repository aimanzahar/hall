// views/screens/AdminLoginScreen.jsx — Dedicated sign-in for admins. Uses the
// separate `admins` PocketBase collection so operators can never be mistaken
// for regular users.
(function () {
  const { useState } = React;
  const { Icon } = HB.Views;
  const A = HB.Models.Auth;

  function AdminLoginScreen({ loginAdmin, busy, onBack }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [touched, setTouched] = useState({ email: false, password: false });

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passOk = password.length >= 5;
    const canSubmit = emailOk && passOk && !busy;

    const submit = async (e) => {
      e.preventDefault();
      setTouched({ email: true, password: true });
      if (!canSubmit) return;
      setError(null);
      try { await loginAdmin(email.trim(), password); }
      catch (err) { setError(A.errorMessage(err)); }
    };

    return (
      <div className="auth-root admin-auth-root">
        {onBack && (
          <button className="auth-back" onClick={onBack} type="button" aria-label="Back to home">
            <Icon name="arrow-left" size={14}/> Back to site
          </button>
        )}
        <aside className="auth-aside admin-aside">
          <div className="auth-brand">
            <div className="brand-mark admin-mark">A</div>
            <div className="brand-name">Hall<em>book</em> <span className="admin-chip">ADMIN</span></div>
          </div>
          <div className="auth-pitch">
            <h2>Operations control panel.</h2>
            <p>Review incoming bookings, approve or reject requests, and keep every Malaysian venue on HallBook running smoothly.</p>
          </div>
          <div className="auth-features">
            <div className="auth-feature"><Icon name="ticket" size={14}/> Every request in one queue</div>
            <div className="auth-feature"><Icon name="check" size={14}/> One-tap approve / reject</div>
            <div className="auth-feature"><Icon name="pin" size={14}/> Malaysia-wide coverage</div>
          </div>
        </aside>

        <section className="auth-panel">
          <form className="auth-card" onSubmit={submit} noValidate>
            <h1 className="auth-title">Admin sign-in</h1>
            <p className="auth-sub">Restricted to authorised HallBook operators.</p>

            <label className="auth-field">
              <span className="auth-label">Email</span>
              <input className="auth-input" type="email" value={email} autoComplete="email"
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                placeholder="admin@hallbook.my" required/>
              {touched.email && !emailOk && <span className="auth-field-error">Enter a valid email address.</span>}
            </label>
            <label className="auth-field">
              <span className="auth-label">Password</span>
              <input className="auth-input" type="password" value={password} autoComplete="current-password"
                onChange={e => setPassword(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, password: true }))}
                placeholder="••••••••" required/>
              {touched.password && !passOk && <span className="auth-field-error">Password must be at least 5 characters.</span>}
            </label>

            {error && <div className="auth-error" role="alert">{error}</div>}
            <button className="btn primary auth-submit" type="submit" disabled={!canSubmit}>
              {busy ? 'Signing in…' : 'Sign in as admin'}
            </button>
            <div className="auth-switch" style={{ textAlign: 'center' }}>
              Not an operator?{' '}
              <button type="button" className="auth-link" onClick={onBack}>Return to the customer site</button>
            </div>
          </form>
          <div className="auth-footer">
            Connected to <code>{A.PB_URL.replace('https://', '')}</code> · collection <code>admins</code>
          </div>
        </section>
      </div>
    );
  }

  HB.Views.AdminLoginScreen = AdminLoginScreen;
})();
