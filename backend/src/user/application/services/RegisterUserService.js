// src/backend/user/application/services/RegisterUserService.js

const { UserBuilder }   = require("../../domain/builders/UserBuilder");
const { CreateUserDto } = require("../dtos/CreateUserDto");

class RegisterUserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ dni, names, last_names, email, password, phone, sexo }) {

    // DTO valida formato
    const dto = new CreateUserDto({ dni, names, last_names, email, password, phone, sexo });
    dto.validate();

    const existingDni = await this.userRepository.findByDni(dni);
    if (existingDni) throw new Error("El DNI ya está registrado");

    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) throw new Error("El email ya está registrado");

    // Builder construye la entidad
    const user = new UserBuilder()
      .setDni(dni)
      .setNames(names)
      .setLastNames(last_names)
      .setEmail(email)
      .setPassword(password)
      .setPhone(phone)
      .setSexo(sexo || null)
      .setRole("usuario")
      .build();

    await user.hashPassword();
    return await this.userRepository.save(user);
  }
}

module.exports = { RegisterUserService };