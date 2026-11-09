const { LoginDto } = require("../dtos/LoginDto");

class LoginUserService {

  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(dto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new Error("Email inválido");

    const isValid = await user.comparePassword(dto.password);
    if (!isValid) throw new Error("Contraseña incorrecta");

    return user;
  }
}

module.exports = { LoginUserService };