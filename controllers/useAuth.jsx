// controllers/useAuth.jsx — Owns current auth principal (user OR admin) plus
// login / register / logout actions. Subscribes to pb.authStore so auth state
// updates from anywhere (token refresh, other tabs) propagate to the UI.
(function () {
  const { useState, useEffect, useCallback } = React;
  const A = HB.Models.Auth;

  function useAuth() {
    const [user, setUser] = useState(() => A.currentUser());
    const [role, setRole] = useState(() => A.currentRole());
    const [authReady, setAuthReady] = useState(true);

    useEffect(() => {
      const unsub = A.onAuthChange((nextUser, nextRole) => {
        setUser(nextUser);
        setRole(nextRole);
      });
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

    const loginAdmin = useCallback(async (email, password) => {
      setAuthReady(false);
      try { return await A.loginAdmin(email, password); }
      finally { setAuthReady(true); }
    }, []);

    const logout = useCallback(() => { A.logout(); }, []);

    return { user, role, isAdmin: role === 'admin', authReady, login, register, loginAdmin, logout };
  }

  HB.Controllers.useAuth = useAuth;
})();
