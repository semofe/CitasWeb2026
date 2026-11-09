// src/backend/user/presentation/controllers/UserController.js

const { UserMapper } = require("../../infrastructure/mappings/UserMapper");

class UserController {

  constructor(userService) {
    this.userService = userService;
  }

  async getAll(req, res) {
    try {
      const users = await this.userService.getAll();
      return res.status(200).json({
        ok:   true,
        data: users.map((u) => UserMapper.toResponse(u)),
      });
    } catch (error) {
      return res.status(500).json({ ok: false, message: error.message });
    }
  }

  async getByDni(req, res) {
    try {
      const user = await this.userService.getByDni(req.params.dni);
      return res.status(200).json({
        ok:   true,
        data: UserMapper.toResponse(user),
      });
    } catch (error) {
      return res.status(404).json({ ok: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const user = await this.userService.update(req.params.dni, req.body);
      return res.status(200).json({
        ok:      true,
        message: "User updated successfully",
        data:    UserMapper.toResponse(user),
      });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await this.userService.delete(req.params.dni);
      return res.status(200).json({
        ok:      true,
        message: "User deleted successfully",
      });
    } catch (error) {
      return res.status(404).json({ ok: false, message: error.message });
    }
  }
}

module.exports = { UserController };