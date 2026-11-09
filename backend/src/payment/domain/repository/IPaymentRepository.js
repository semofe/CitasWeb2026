class IPaymentRepository {
  async save(payment) { throw new Error("Method 'save' must be implemented"); }
  async findById(id) { throw new Error("Method 'findById' must be implemented"); }
  async findPendingByCitaId(citaId) { throw new Error("Method 'findPendingByCitaId' must be implemented"); }
  async findPendingCreatedBefore(date) { throw new Error("Method 'findPendingCreatedBefore' must be implemented"); }
  async markExpired(id) { throw new Error("Method 'markExpired' must be implemented"); }
  async updateStatus(id, status) { throw new Error("Method 'updateStatus' must be implemented"); }
}

module.exports = { IPaymentRepository };
