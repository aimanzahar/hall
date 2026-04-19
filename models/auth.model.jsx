// models/auth.model.jsx — PocketBase client + pure auth operations. No React.
// Exposes HB.Models.Auth with a shared `pb` instance and thin wrappers around
// the PocketBase JS SDK so the controller stays small.
(function () {
  const PB_URL = 'https://pocketbase.zahar.my';
  const pb = new window.PocketBase(PB_URL);

  // The SDK persists the auth token in localStorage by default, so reloads
  // restore the session automatically via pb.authStore.
  function currentUser() {
    return pb.authStore.isValid ? pb.authStore.record : null;
  }

  function onAuthChange(cb) {
    return pb.authStore.onChange(() => cb(currentUser()), false);
  }

  async function login(email, password) {
    const res = await pb.collection('users').authWithPassword(email, password);
    return res.record;
  }

  async function register({ email, password, passwordConfirm, name }) {
    const payload = { email, password, passwordConfirm };
    if (name) payload.name = name;
    await pb.collection('users').create(payload);
    return login(email, password);
  }

  function logout() {
    pb.authStore.clear();
  }

  // Pull a human-readable error out of a PocketBase ClientResponseError.
  function errorMessage(err) {
    if (!err) return 'Unknown error';
    const data = err.response || err.data || {};
    if (data.data && typeof data.data === 'object') {
      const firstKey = Object.keys(data.data)[0];
      if (firstKey) {
        const field = data.data[firstKey];
        const msg = field && (field.message || field.code);
        if (msg) return `${firstKey}: ${msg}`;
      }
    }
    return data.message || err.message || 'Request failed';
  }

  HB.Models.Auth = {
    pb, PB_URL,
    currentUser, onAuthChange,
    login, register, logout,
    errorMessage,
  };
})();
