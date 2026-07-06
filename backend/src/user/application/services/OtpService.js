// OTP en memoria: email -> { otp, expiresAt }
// Se limpia automáticamente al expirar o al consumirse

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutos

const otpStore = new Map();

class OtpService {
  generate(email) {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + OTP_TTL_MS;

    // Cancelar timer anterior si existe
    const existing = otpStore.get(email);
    if (existing && existing.timer) clearTimeout(existing.timer);

    const timer = setTimeout(() => otpStore.delete(email), OTP_TTL_MS);
    otpStore.set(email, { otp, expiresAt, timer });

    return otp;
  }

  verify(email, otp) {
    const record = otpStore.get(email);
    if (!record) return false;
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return false;
    }
    return record.otp === String(otp);
  }

  consume(email) {
    const record = otpStore.get(email);
    if (record && record.timer) clearTimeout(record.timer);
    otpStore.delete(email);
  }
}

const otpService = new OtpService();
module.exports = { otpService };
