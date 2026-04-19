// views/shell/TweaksPanel.jsx — Dev-mode panel for theme/accent/density toggles.
(function () {
  const ACCENTS = [
    { k: 'indigo',  hex: '#2b3bff', label: 'Indigo' },
    { k: 'emerald', hex: '#0e7a4a', label: 'Emerald' },
    { k: 'amber',   hex: '#b5691e', label: 'Amber' },
    { k: 'rose',    hex: '#c2185b', label: 'Rose' },
    { k: 'ink',     hex: '#111113', label: 'Ink' },
  ];

  function TweaksPanel({ tweaks, updateTweak, close }) {
    return (
      <div className="tweaks">
        <div className="tweaks-head">
          <span>Tweaks</span>
          <button className="btn ghost" style={{ padding: '2px 6px', fontSize: 18, lineHeight: 1 }} onClick={close}>×</button>
        </div>
        <div className="tweaks-body">
          <div className="tweak-row">
            <label>Accent</label>
            <div className="swatches">
              {ACCENTS.map(a => (
                <button key={a.k} className={`swatch ${tweaks.accent === a.k ? 'selected' : ''}`}
                  style={{ background: a.hex }}
                  title={a.label}
                  onClick={() => updateTweak('accent', a.k)}/>
              ))}
            </div>
          </div>
          <div className="tweak-row">
            <label>Theme</label>
            <div className="segmented">
              <button className={tweaks.theme === 'light' ? 'active' : ''} onClick={() => updateTweak('theme', 'light')}>Light</button>
              <button className={tweaks.theme === 'dark' ? 'active' : ''} onClick={() => updateTweak('theme', 'dark')}>Dark</button>
            </div>
          </div>
          <div className="tweak-row">
            <label>Hero layout</label>
            <div className="segmented">
              <button className={tweaks.heroLayout === 'editorial' ? 'active' : ''} onClick={() => updateTweak('heroLayout', 'editorial')}>Editorial</button>
              <button className={tweaks.heroLayout === 'compact' ? 'active' : ''} onClick={() => updateTweak('heroLayout', 'compact')}>Compact</button>
            </div>
          </div>
          <div className="tweak-row">
            <label>Density</label>
            <div className="segmented">
              <button className={tweaks.density === 'comfortable' ? 'active' : ''} onClick={() => updateTweak('density', 'comfortable')}>Comfortable</button>
              <button className={tweaks.density === 'compact' ? 'active' : ''} onClick={() => updateTweak('density', 'compact')}>Compact</button>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
            Toggle accent, dark mode, and layout variants. Tweaks persist across reload.
          </div>
        </div>
      </div>
    );
  }

  HB.Views.TweaksPanel = TweaksPanel;
})();
