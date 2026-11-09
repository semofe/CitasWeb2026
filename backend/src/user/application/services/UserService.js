const { UpdateUserDto } = require("../dtos/UpdateUserDto");

class UserService {

  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getAll() {
    return await this.userRepository.findAll();
  }

  async getByDni(dni) {
    const user = await this.userRepository.findByDni(dni);
    if (!user) throw new Error("Usuario no encontrado");
    return user;
  }

  async update(dni, data) {
  const user = await this.userRepository.findByDni(dni);
  if (!user) throw new Error("Usuario no encontrado");

  // Ya no necesitas pasar body, el dto lo detecta internamente
  const dto = new UpdateUserDto(data);
  dto.validate();                        // ← sin parámetros

  if (data.email) {
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail && existingEmail.dni !== dni)
      throw new Error("El email ya está registrado");
  }

  // Evita asignación masiva: solo persiste campos previamente validados.
  const allowedData = {};
  for (const field of ["names", "last_names", "email", "phone", "sexo"]) {
    if (dto[field] !== undefined) allowedData[field] = dto[field];
  }

  return await this.userRepository.update(dni, allowedData);
}

  async delete(dni) {
    const user = await this.userRepository.findByDni(dni);
    if (!user) throw new Error("Usuario no encontrado");
    return await this.userRepository.delete(dni);
  }
}

module.exports = { UserService };
