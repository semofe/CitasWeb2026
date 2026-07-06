import React from "react";

function NotificationModal({ show, type = "error", title, message, onClose, confirmText = "Aceptar" }) {
  if (!show) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#d1e7dd";
      case "error":
        return "#fee";
      case "warning":
        return "#fffbea";
      case "info":
        return "#e7f3ff";
      default:
        return "#f8f9fa";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "#0f5132";
      case "error":
        return "#721c24";
      case "warning":
        return "#856404";
      case "info":
        return "#004085";
      default:
        return "#333";
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "#badbcc";
      case "error":
        return "#fcc";
      case "warning":
        return "#ffeeba";
      case "info":
        return "#b8daff";
      default:
        return "#ddd";
    }
  };

  const getIconClass = () => {
    switch (type) {
      case "success":
        return "bi-check-circle-fill text-success";
      case "error":
        return "bi-exclamation-circle-fill text-danger";
      case "warning":
        return "bi-exclamation-triangle-fill text-warning";
      case "info":
        return "bi-info-circle-fill text-info";
      default:
        return "bi-bell-fill";
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: show ? "block" : "none",
      }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg">
          <div
            className="modal-header"
            style={{
              backgroundColor: getBackgroundColor(),
              borderBottom: `2px solid ${getBorderColor()}`,
            }}
          >
            <div className="d-flex align-items-center w-100">
              <i
                className={`bi ${getIconClass()} me-3`}
                style={{ fontSize: "1.5rem" }}
              ></i>
              <h5 className="modal-title fw-bold" style={{ color: getTextColor() }}>
                {title}
              </h5>
            </div>
          </div>
          <div className="modal-body p-4">
            <p style={{ color: getTextColor(), marginBottom: 0 }}>
              {message}
            </p>
          </div>
          <div className="modal-footer border-top">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
              style={{
                backgroundColor:
                  type === "success"
                    ? "#198754"
                    : type === "error"
                    ? "#dc3545"
                    : type === "warning"
                    ? "#ffc107"
                    : "#0d6efd",
                border: "none",
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationModal;
