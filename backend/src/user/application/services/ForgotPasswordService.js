class ForgotPasswordService {
  constructor(userRepository, otpService, emailService) {
    this.userRepository = userRepository;
    this.otpService     = otpService;
    this.emailService   = emailService;
  }

  async execute(email) {
    const user = await this.userRepository.findByEmail(email);
    // Por seguridad, no revelamos si el email existe o no
    if (!user) throw new Error("No existe una cuenta registrada con ese correo");

    const otp = this.otpService.generate(email);
    await this.emailService.enviarOtp(user, otp);
    return true;
  }
}

module.exports = { ForgotPasswordService };
