// src/backend/user/presentation/controllers/AuthController.js
const { LoginDto } = require("../../application/dtos/LoginDto");
const { UserMapper } = require("../../infrastructure/mappings/UserMapper");
const jwt = require("jsonwebtoken");

class AuthController {

  constructor(registerService, loginService, registerMedicoService, forgotPasswordService, resetPasswordService) {
    this.registerService       = registerService;
    this.loginService          = loginService;
    this.registerMedicoService = registerMedicoService;
    this.forgotPasswordService = forgotPasswordService;
    this.resetPasswordService  = resetPasswordService;
  }

  async register(req, res) {
    try {
      const user = await this.registerService.execute(req.body);
      return res.status(201).json({
        ok: true,
        message: "User registered successfully",
        data: UserMapper.toResponse(user),
      });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async registerMedico(req, res) {
    try {
      const user = await this.registerMedicoService.execute(req.body);
      return res.status(201).json({
        ok: true,
        message: "Medico registered successfully",
        data: UserMapper.toResponse(user),
      });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const dto = new LoginDto({ email, password });
      dto.validate();
      const user = await this.loginService.execute(dto);
      const token = jwt.sign(
        { dni: user.dni, email: user.email, role: user.role, medicoId: user.medicoId || null },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
      );
      return res.status(200).json({
        ok: true,
        message: "Login successful",
        data: { token, user: UserMapper.toResponse(user) },
      });
    } catch (error) {
      console.log("Login error:", error);
      return res.status(401).json({ ok: false, message: error.message });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ ok: false, message: "El correo es requerido" });
      await this.forgotPasswordService.execute(email);
      return res.status(200).json({ ok: true, message: "Código enviado al correo electrónico" });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword)
        return res.status(400).json({ ok: false, message: "Todos los campos son requeridos" });
      await this.resetPasswordService.execute(email, otp, newPassword);
      return res.status(200).json({ ok: true, message: "Contraseña actualizada correctamente" });
    } catch (error) {
      return res.status(400).json({ ok: false, message: error.message });
    }
  }
}

module.exports = { AuthController };