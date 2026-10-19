export default function FloatingActionButton({ icon = '➕', label = '', onClick, title = 'New' }) {
  return (
    <button
      className={`android-fab ${label ? 'android-fab-extended' : ''}`}
      onClick={onClick}
      title={title}
      type="button"
      aria-label={label || title}
    >
      <span className="android-fab-icon">{icon}</span>
      {label && <span className="android-fab-label">{label}</span>}
    </button>
  );
}
