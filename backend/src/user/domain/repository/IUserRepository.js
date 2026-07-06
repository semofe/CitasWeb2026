class IUserRepository {

  async save(user) {
    throw new Error("El método 'save' debe estar implementado");
  }

  async findByDni(dni) {
    throw new Error("El método 'findByDni' debe estar implementado");
  }

  async findByEmail(email) {
    throw new Error("El método 'findByEmail' debe estar implementado");
  }

  async findAll() {
    throw new Error("El método 'findAll' debe estar implementado");
  }

  async update(dni, data) {
    throw new Error("El método 'update' debe estar implementado");
  }

  async delete(dni) {
    throw new Error("El método 'delete' debe estar implementado");
  }
}

module.exports = { IUserRepository };