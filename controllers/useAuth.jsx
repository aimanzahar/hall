// controllers/useAuth.jsx — Owns the current PocketBase user + auth actions.
// Subscribes to pb.authStore so login/logout from anywhere updates the UI.
(function () {
  const { useState, useEffect, useCallback } = React;
  const A = HB.Models.Auth;

  function useAuth() {
    const [user, setUser] = useState(() => A.currentUser());
    const [authReady, setAuthReady] = useState(true);

    useEffect(() => {
      const unsub = A.onAuthChange(next => setUser(next));
      return () => { if (typeof unsub === 'function') unsub(); };
    }, []);

    const login = useCallback(async (email, password) => {
      setAuthReady(false);
      try { return await A.login(email, password); }
      finally { setAuthReady(true); }
    }, []);

    const register = useCallback(async (payload) => {
      setAuthReady(false);
      try { return await A.register(payload); }
      finally { setAuthReady(true); }
    }, []);

    const logout = useCallback(() => { A.logout(); }, []);

    return { user, authReady, login, register, logout };
  }

  HB.Controllers.useAuth = useAuth;
})();
