import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function AndroidBottomSheet({ isOpen, onClose, title, subtitle, children, footer }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="android-sheet-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="android-sheet" role="dialog" aria-modal="true">
        {/* Grab Handle */}
        <div className="android-sheet-handle-wrap" onClick={onClose}>
          <div className="android-sheet-handle" />
        </div>

        {/* Sheet Header */}
        <div className="android-sheet-header">
          <div>
            <div className="android-sheet-title">{title}</div>
            {subtitle && <div className="android-sheet-subtitle">{subtitle}</div>}
          </div>
          <button className="android-sheet-close" onClick={onClose} aria-label="Close sheet">
            ✕
          </button>
        </div>

        {/* Sheet Body */}
        <div className="android-sheet-body">
          {children}
        </div>

        {/* Sheet Footer */}
        {footer && (
          <div className="android-sheet-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
