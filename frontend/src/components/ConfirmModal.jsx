import React, { useEffect, useRef } from "react";

function ConfirmModal({
  show,
  title,
  message,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}) {
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (!show) return undefined;

    cancelButtonRef.current?.focus();
    const handleEscape = (event) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [show, onCancel]);

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1060 }}
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "22px" }}>
          <div className="modal-header border-0 pb-0 p-4">
            <h5 id="confirm-modal-title" className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close" aria-label="Cerrar ventana de confirmación" onClick={onCancel}></button>
          </div>
          <div className="modal-body px-4 pb-2">
            <p id="confirm-modal-message" className="mb-0 text-muted">{message}</p>
          </div>
          <div className="modal-footer border-0 p-4 pt-3">
            <button ref={cancelButtonRef} type="button" className="btn btn-outline-secondary" onClick={onCancel}>
              {cancelText}
            </button>
            <button type="button" className="btn btn-danger fw-bold" onClick={onConfirm}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
