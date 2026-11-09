const { EntitySchema } = require("typeorm");

class Payment {
  constructor({
    id,
    citaId,
    amount,
    currency,
    status,
    provider,
    internalReference,
    providerReference,
    checkoutUrl,
    createdAt,
    updatedAt,
  } = {}) {
    this.id = id;
    this.citaId = citaId;
    this.amount = amount;
    this.currency = currency;
    this.status = status || "pendiente";
    this.provider = provider;
    this.internalReference = internalReference;
    this.providerReference = providerReference;
    this.checkoutUrl = checkoutUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

const PaymentSchema = new EntitySchema({
  name: "Payment",
  target: Payment,
  tableName: "payments",
  columns: {
    id: { primary: true, type: "uuid", generated: "uuid" },
    citaId: { name: "cita_id", type: "uuid", nullable: false },
    amount: { type: "integer", nullable: false },
    currency: { type: "varchar", length: 3, nullable: false, default: "PEN" },
    status: { type: "varchar", length: 20, nullable: false, default: "pendiente" },
    provider: { type: "varchar", length: 30, nullable: false },
    internalReference: { name: "internal_reference", type: "varchar", length: 100, unique: true },
    providerReference: { name: "provider_reference", type: "varchar", length: 150, nullable: true, unique: true },
    checkoutUrl: { name: "checkout_url", type: "varchar", length: 500, nullable: true },
    createdAt: { name: "created_at", type: "timestamp", createDate: true },
    updatedAt: { name: "updated_at", type: "timestamp", updateDate: true },
  },
  relations: {
    cita: {
      type: "many-to-one",
      target: "Cita",
      joinColumn: { name: "cita_id" },
      createForeignKeyConstraints: false,
    },
  },
});

module.exports = { Payment, PaymentSchema };
