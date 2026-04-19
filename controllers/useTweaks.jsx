// controllers/useTweaks.jsx — Theme/accent/density tweaks panel + host postMessage protocol.
(function () {
  const { useState, useEffect } = React;

  function useTweaks(defaults) {
    const [tweaks, setTweaks] = useState(defaults);
    const [tweaksOpen, setTweaksOpen] = useState(false);

    // Host (editor harness) postMessage protocol.
    useEffect(() => {
      const handler = (e) => {
        if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
        if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
      };
      window.addEventListener('message', handler);
      window.parent.postMessage({ type: '__edit_mode_available' }, '*');
      return () => window.removeEventListener('message', handler);
    }, []);

    // Paint theme/accent/density onto <body> so CSS can react.
    useEffect(() => {
      document.body.dataset.theme = tweaks.theme;
      document.body.dataset.accent = tweaks.accent;
      document.body.dataset.density = tweaks.density;
    }, [tweaks]);

    const updateTweak = (k, v) => {
      setTweaks(t => {
        const next = { ...t, [k]: v };
        window.parent.postMessage(
          { type: '__edit_mode_set_keys', edits: { [k]: v } },
          '*'
        );
        return next;
      });
    };

    return { tweaks, tweaksOpen, setTweaksOpen, updateTweak };
  }

  HB.Controllers.useTweaks = useTweaks;
})();
