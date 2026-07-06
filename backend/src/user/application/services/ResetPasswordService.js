const bcrypt = require("bcrypt");

class ResetPasswordService {
  constructor(userRepository, otpService) {
    this.userRepository = userRepository;
    this.otpService     = otpService;
  }

  async execute(email, otp, newPassword) {
    if (!newPassword || newPassword.trim().length < 6)
      throw new Error("La contraseña debe tener al menos 6 caracteres");

    const valid = this.otpService.verify(email, otp);
    if (!valid) throw new Error("El código es incorrecto o ya expiró");

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePasswordByEmail(email, hashed);

    this.otpService.consume(email);
    return true;
  }
}

module.exports = { ResetPasswordService };
