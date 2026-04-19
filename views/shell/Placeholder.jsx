// views/shell/Placeholder.jsx — Labeled gradient block standing in for imagery.
(function () {
  function Placeholder({ w, h, label, hero = 'warm' }) {
    return (
      <div className={`ph ${hero}`} style={{ width: w, height: h }}>
        <div className="ph-label">{label}</div>
      </div>
    );
  }

  HB.Views.Placeholder = Placeholder;
})();
