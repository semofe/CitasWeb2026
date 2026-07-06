const { RegisterUserService }    = require("../../user/application/services/RegisterUserService");
const { RegisterMedicoService }  = require("../../user/application/services/RegisterMedicoService");
const { LoginUserService }       = require("../../user/application/services/LoginUserService");
const { UserService }            = require("../../user/application/services/UserService");
const { ForgotPasswordService }  = require("../../user/application/services/ForgotPasswordService");
const { ResetPasswordService }   = require("../../user/application/services/ResetPasswordService");

class UserServiceFactory {
  static createRegisterService(userRepository) {
    return new RegisterUserService(userRepository);
  }

  static createRegisterMedicoService(userRepository, medicoRepository, sedeRepository, especialidadRepository) {
    return new RegisterMedicoService(userRepository, medicoRepository, sedeRepository, especialidadRepository);
  }

  static createLoginService(userRepository) {
    return new LoginUserService(userRepository);
  }

  static createUserService(userRepository) {
    return new UserService(userRepository);
  }

  static createForgotPasswordService(userRepository, otpService, emailService) {
    return new ForgotPasswordService(userRepository, otpService, emailService);
  }

  static createResetPasswordService(userRepository, otpService) {
    return new ResetPasswordService(userRepository, otpService);
  }
}

module.exports = { UserServiceFactory };