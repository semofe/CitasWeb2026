const { LessThan } = require("typeorm");
const { IPaymentRepository } = require("../../domain/repository/IPaymentRepository");
const { Payment } = require("../../domain/entities/Payment");
const { database } = require("../../../database/connection");

class PaymentRepository extends IPaymentRepository {
  constructor() {
    super();
    this.repository = database.getDataSource().getRepository("Payment");
  }

  async save(payment) {
    const saved = await this.repository.save(payment);
    return new Payment(saved);
  }

  async findById(id) {
    const payment = await this.repository.findOne({ where: { id } });
    return payment ? new Payment(payment) : null;
  }

  async findPendingByCitaId(citaId) {
    const payment = await this.repository.findOne({
      where: { citaId, status: "pendiente" },
      order: { createdAt: "DESC" },
    });
    return payment ? new Payment(payment) : null;
  }

  async findPendingCreatedBefore(date) {
    const payments = await this.repository.find({
      where: { status: "pendiente", createdAt: LessThan(date) },
    });
    return payments.map((payment) => new Payment(payment));
  }

  async markExpired(id) {
    return this.updateStatus(id, "expirado");
  }

  async updateStatus(id, status) {
    await this.repository.update(id, { status });
    return this.findById(id);
  }
}

module.exports = { PaymentRepository };
