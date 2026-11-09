import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useTheme } from "../ThemeContext";
import { formatPaymentCountdown, getPaymentCountdown } from "../utils/paymentCountdown";

function Pago() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    let active = true;
    axiosInstance.get(`/payments/${paymentId}`)
      .then((response) => active && setPayment(response.data.data))
      .catch((error) => active && setMessage(error.response?.data?.message || "No se pudo cargar el pago."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [paymentId]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const amount = useMemo(() => payment ? (payment.amount / 100).toFixed(2) : "55.00", [payment]);
  const countdown = useMemo(
    () => payment?.createdAt ? getPaymentCountdown(payment.createdAt, currentTime) : null,
    [payment, currentTime],
  );
  const reservationExpired = payment?.status === "pendiente" && countdown?.expired;

  const simulate = async (result) => {
    setProcessing(true);
    setMessage("");
    try {
      const response = await axiosInstance.post(`/payments/${paymentId}/simular`, { result });
      setPayment(response.data.data);
      setMessage(result === "aprobado" ? "Pago aprobado. Tu cita fue confirmada." : "Pago rechazado. El horario fue liberado.");
    } catch (error) {
      setMessage(error.response?.data?.message || "No se pudo procesar el resultado del pago.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="container py-5 text-center"><span className="spinner-border"></span></div>;

  return (
    <main className="container py-4 py-md-5" style={{ color: theme.text }}>
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card border-0 shadow-lg overflow-hidden" style={{ backgroundColor: theme.cardBg }}>
            <div className="p-4 text-white" style={{ background: "linear-gradient(135deg, #1a7a3c, #28b565)" }}>
              <span className="small text-uppercase fw-bold" style={{ letterSpacing: ".12em" }}>Pago de reserva</span>
              <h2 className="mt-2 mb-0">Completa tu pago</h2>
            </div>
            <div className="p-4 p-md-5">
              {message && <div className={`alert ${payment?.status === "aprobado" ? "alert-success" : "alert-warning"}`}>{message}</div>}
              {payment ? <>
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                  <div><div className="small text-muted">Monto a pagar</div><strong className="fs-2">S/ {amount}</strong></div>
                  <span className={`badge rounded-pill px-3 py-2 ${payment.status === "aprobado" ? "text-bg-success" : "text-bg-warning"}`}>{payment.status.replace("_", " ")}</span>
                </div>
                <p className={`small ${reservationExpired ? "text-danger fw-semibold" : "opacity-75"}`} aria-live="polite">
                  <i className="bi bi-clock-history me-2"></i>
                  {reservationExpired ? "La reserva venció. El horario será liberado." : `Tiempo restante para pagar: ${formatPaymentCountdown(countdown?.remainingSeconds ?? 0)}`}
                </p>
                {payment.status === "pendiente" ? <div className="border rounded-4 p-4 mt-4" style={{ borderColor: theme.border }}>
                  <div className="d-flex align-items-center gap-2 mb-2"><i className="bi bi-flask text-warning"></i><strong>Checkout de pruebas</strong></div>
                  <p className="small text-muted mb-3">Para la demostración local, simula el resultado del proveedor. Pay-me sandbox reemplazará estos botones.</p>
                  <div className="d-grid gap-2 d-sm-flex">
                    <button className="btn btn-success flex-fill" disabled={processing || reservationExpired} onClick={() => simulate("aprobado")}>{processing ? "Procesando..." : "Simular pago aprobado"}</button>
                    <button className="btn btn-outline-danger flex-fill" disabled={processing || reservationExpired} onClick={() => simulate("rechazado")}>Simular rechazo</button>
                  </div>
                </div> : <button className="btn btn-success w-100 mt-4" onClick={() => navigate("/mis-citas")}>Ver mis citas</button>}
              </> : <div className="alert alert-danger">{message || "Pago no encontrado."}</div>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Pago;
