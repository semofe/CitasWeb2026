const { EntitySchema } = require("typeorm");
const { UserSchema } = require("../../domain/entities/User");

const UserModel = new EntitySchema({
  name: "UserModel",
tableName: "users",
  columns: {
    dni: {
      primary: true,
      type: "varchar",
      length: 20,
      nullable: false,
    },
    names: {
      name: "user_names",
      type: "varchar",
      length: 100,
      nullable: false,
    },
    last_names: {
      name: "user_lastns",
      type: "varchar",
      length: 100,
      nullable: false,
    },
    email: {
      name: "user_email",
      type: "varchar",
      length: 150,
      unique: true,
      nullable: false,
    },
    password: {
      name: "user_password",
      type: "varchar",
      nullable: false,
    },
    phone: {
      name: "user_phone",
      type: "varchar",
      length: 20,
      nullable: true,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      name: "updated_at",
      type: "timestamp",
      updateDate: true,
    },
  },
});

module.exports = { UserModel };
module.exports = { UserModel: UserSchema };