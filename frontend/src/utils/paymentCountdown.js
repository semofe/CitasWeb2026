const PAYMENT_RESERVATION_SECONDS = 5 * 60;

export function getPaymentCountdown(createdAt, now = new Date()) {
  const createdAtMs = new Date(createdAt).getTime();
  const elapsedSeconds = Math.floor((new Date(now).getTime() - createdAtMs) / 1000);
  const remainingSeconds = Math.max(0, PAYMENT_RESERVATION_SECONDS - elapsedSeconds);

  return {
    remainingSeconds,
    expired: remainingSeconds === 0,
  };
}

export function formatPaymentCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
