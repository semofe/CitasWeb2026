import test from "node:test";
import assert from "node:assert/strict";
import { getPaymentCountdown, formatPaymentCountdown } from "./paymentCountdown.js";

test("muestra el tiempo restante de una reserva de pago de cinco minutos", () => {
  const createdAt = new Date("2026-11-08T10:00:00.000Z");
  const now = new Date("2026-11-08T10:02:00.000Z");

  const countdown = getPaymentCountdown(createdAt, now);

  assert.equal(countdown.expired, false);
  assert.equal(countdown.remainingSeconds, 180);
  assert.equal(formatPaymentCountdown(countdown.remainingSeconds), "03:00");
});
