jest.mock("../../src/config/supabase");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const supabase = require("../../src/config/supabase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authService = require("../../src/services/authService");

const mockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  password_hash: "$2a$10$hashedpassword",
  role: "user",
  active: true,
};

describe("AuthService - Pruebas Unitarias", () => {
  // ── login ───────────────────────────────────────────────────────────────────
  describe("login()", () => {
    test("debe retornar token y usuario con credenciales válidas", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
            }),
          }),
        }),
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("fake-jwt-token");

      const result = await authService.login("testuser", "password123");

      expect(result).toHaveProperty("token", "fake-jwt-token");
      expect(result.user).toMatchObject({ username: "testuser", role: "user" });
      expect(result.user).not.toHaveProperty("password_hash");
    });

    test("debe lanzar error si la contraseña es incorrecta", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
            }),
          }),
        }),
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.login("testuser", "wrongpassword")).rejects.toThrow(
        "Credenciales inválidas"
      );
    });

    test("debe lanzar error si el usuario no existe", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
            }),
          }),
        }),
      });

      await expect(authService.login("noexiste", "password")).rejects.toThrow(
        "Credenciales inválidas"
      );
    });

    test("debe lanzar error si faltan campos", async () => {
      await expect(authService.login("", "")).rejects.toThrow(
        "Usuario y contraseña son requeridos"
      );
      await expect(authService.login(null, null)).rejects.toThrow(
        "Usuario y contraseña son requeridos"
      );
    });
  });

  // ── register ────────────────────────────────────────────────────────────────
  describe("register()", () => {
    test("debe registrar un usuario correctamente", async () => {
      const newUser = { id: 2, username: "newuser", email: "new@example.com", role: "user" };
      bcrypt.hash.mockResolvedValue("$2a$10$newhash");

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: newUser, error: null }),
          }),
        }),
      });

      const result = await authService.register({
        username: "newuser",
        email: "new@example.com",
        password: "pass123",
      });

      expect(result).toMatchObject({ username: "newuser", role: "user" });
      expect(result).not.toHaveProperty("password_hash");
    });

    test("debe lanzar error si faltan campos", async () => {
      await expect(authService.register({ username: "user" })).rejects.toThrow(
        "Todos los campos son requeridos"
      );
      await expect(authService.register({})).rejects.toThrow(
        "Todos los campos son requeridos"
      );
    });

    test("debe lanzar error si Supabase falla", async () => {
      bcrypt.hash.mockResolvedValue("$2a$10$hash");
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: "Email duplicado" } }),
          }),
        }),
      });

      await expect(
        authService.register({ username: "u", email: "dup@example.com", password: "p" })
      ).rejects.toThrow("Email duplicado");
    });
  });
});
