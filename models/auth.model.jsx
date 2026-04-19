// models/auth.model.jsx — PocketBase client + auth ops for BOTH users and admins.
// `users` and `admins` are separate auth collections; they share pb.authStore,
// so you can only be signed in as one role at a time. `isAdmin()` inspects the
// current record's collectionName to tell them apart.
(function () {
  const PB_URL = 'https://pocketbase.zahar.my';
  const pb = new window.PocketBase(PB_URL);

  function currentUser() {
    return pb.authStore.isValid ? pb.authStore.record : null;
  }

  function currentRole() {
    const rec = currentUser();
    if (!rec) return null;
    return rec.collectionName === 'admins' ? 'admin' : 'user';
  }

  function isAdmin() { return currentRole() === 'admin'; }

  function onAuthChange(cb) {
    return pb.authStore.onChange(() => cb(currentUser(), currentRole()), false);
  }

  async function login(email, password) {
    const res = await pb.collection('users').authWithPassword(email, password);
    return res.record;
  }

  async function register({ email, password, passwordConfirm, name, phone }) {
    const payload = { email, password, passwordConfirm, emailVisibility: true };
    if (name) payload.name = name;
    if (phone) payload.phone = phone;
    await pb.collection('users').create(payload);
    return login(email, password);
  }

  async function loginAdmin(email, password) {
    const res = await pb.collection('admins').authWithPassword(email, password);
    return res.record;
  }

  function logout() {
    pb.authStore.clear();
  }

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
    currentUser, currentRole, isAdmin, onAuthChange,
    login, register, loginAdmin, logout,
    errorMessage,
  };
})();
