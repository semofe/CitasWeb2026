// src/backend/user/application/services/RegisterMedicoService.js

const { UserBuilder } = require("../../domain/builders/UserBuilder");
const { CreateUserDto } = require("../dtos/CreateUserDto");
const { MedicoBuilder } = require("../../../medico/domain/builders/MedicoBuilder");
const { CreateMedicoDto } = require("../../../medico/application/dtos/CreateMedicoDto");

class RegisterMedicoService {
  constructor(userRepository, medicoRepository, sedeRepository, especialidadRepository) {
    this.userRepository = userRepository;
    this.medicoRepository = medicoRepository;
    this.sedeRepository = sedeRepository;
    this.especialidadRepository = especialidadRepository;
  }

  async execute({ dni, names, last_names, email, password, phone, sexo, nombres, apellidos, telefono, sedeId, especialidadId, turno, diasAtencion }) {
    // Validate user data
    const userDto = new CreateUserDto({ dni, names, last_names, email, password, phone });
    userDto.validate();

    // Check if user already exists
    const existingDni = await this.userRepository.findByDni(dni);
    if (existingDni) throw new Error("El DNI ya está registrado");

    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) throw new Error("El email ya está registrado");

    // Validate medico data
    const medicoDto = new CreateMedicoDto({ nombres, apellidos, email, telefono, sedeId, especialidadId, turno, diasAtencion });
    medicoDto.validate();

    // Verify sede and especialidad exist
    const sede = await this.sedeRepository.findById(sedeId);
    if (!sede) throw new Error("Sede no encontrada");

    const especialidad = await this.especialidadRepository.findById(especialidadId);
    if (!especialidad) throw new Error("Especialidad no encontrada");

    // Check if medico email already exists
    const existingMedico = await this.medicoRepository.findByEmail(email);
    if (existingMedico) throw new Error("El email ya está registrado como médico");

    // Create Medico record first so user can reference medicoId
    const medico = new MedicoBuilder()
      .setNombres(nombres)
      .setApellidos(apellidos)
      .setEmail(email)
      .setTelefono(telefono)
      .setSede(sedeId)
      .setEspecialidad(especialidadId)
      .setTurno(turno)
      .setDiasAtencion(diasAtencion)
      .build();

    const savedMedico = await this.medicoRepository.save(medico);

    // Create User with medico role linked to medicoId
    const user = new UserBuilder()
      .setDni(dni)
      .setNames(names)
      .setLastNames(last_names)
      .setEmail(email)
      .setPassword(password)
      .setPhone(phone)
      .setSexo(sexo || null)
      .setRole("medico")
      .setMedicoId(savedMedico.id)
      .build();

    await user.hashPassword();

    let savedUser;
    try {
      savedUser = await this.userRepository.save(user);
    } catch (userError) {
      // Rollback: eliminar el médico huérfano para mantener consistencia
      await this.medicoRepository.delete(savedMedico.id);
      throw userError;
    }

    return savedUser;
  }
}

module.exports = { RegisterMedicoService };
