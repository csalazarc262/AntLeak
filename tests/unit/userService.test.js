jest.mock("../../src/config/supabase");
jest.mock("bcryptjs");

const supabase = require("../../src/config/supabase");
const bcrypt = require("bcryptjs");
const userService = require("../../src/services/userService");

const mockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  role: "user",
  active: true,
  created_at: "2024-01-01T00:00:00Z",
};

describe("UserService - Pruebas Unitarias", () => {
  // ── getAllUsers ─────────────────────────────────────────────────────────────
  describe("getAllUsers()", () => {
    test("debe retornar lista de usuarios", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [mockUser], error: null }),
        }),
      });

      const result = await userService.getAllUsers();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("username", "testuser");
    });

    test("debe lanzar error si Supabase falla", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
        }),
      });

      await expect(userService.getAllUsers()).rejects.toThrow("DB error");
    });
  });

  // ── getUserById ─────────────────────────────────────────────────────────────
  describe("getUserById()", () => {
    test("debe retornar un usuario por ID", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await userService.getUserById(1);
      expect(result).toMatchObject({ id: 1, username: "testuser" });
    });

    test("debe lanzar error si el usuario no existe", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
          }),
        }),
      });

      await expect(userService.getUserById(999)).rejects.toThrow("Not found");
    });
  });

  // ── createUser ──────────────────────────────────────────────────────────────
  describe("createUser()", () => {
    test("debe crear un usuario válido", async () => {
      bcrypt.hash.mockResolvedValue("$2a$10$hash");
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const result = await userService.createUser({
        username: "testuser",
        email: "test@example.com",
        password: "pass123",
      });

      expect(result).toMatchObject({ username: "testuser" });
    });

    test("debe lanzar error si faltan campos", async () => {
      await expect(userService.createUser({ username: "u" })).rejects.toThrow(
        "Todos los campos son requeridos"
      );
    });

    test("debe lanzar error con rol inválido", async () => {
      await expect(
        userService.createUser({ username: "u", email: "e@e.com", password: "p", role: "superadmin" })
      ).rejects.toThrow("Rol inválido");
    });
  });

  // ── updateUser ──────────────────────────────────────────────────────────────
  describe("updateUser()", () => {
    test("debe actualizar el email correctamente", async () => {
      const updated = { ...mockUser, email: "nuevo@example.com" };
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: updated, error: null }),
            }),
          }),
        }),
      });

      const result = await userService.updateUser(1, { email: "nuevo@example.com" });
      expect(result.email).toBe("nuevo@example.com");
    });

    test("debe lanzar error con rol inválido en actualización", async () => {
      await expect(userService.updateUser(1, { role: "dios" })).rejects.toThrow("Rol inválido");
    });
  });

  // ── softDeleteUser ──────────────────────────────────────────────────────────
  describe("softDeleteUser()", () => {
    test("debe marcar usuario como inactivo", async () => {
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await userService.softDeleteUser(1);
      expect(result).toHaveProperty("message", "Usuario eliminado correctamente");
    });

    test("debe lanzar error si Supabase falla", async () => {
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: { message: "DB error" } }),
        }),
      });

      await expect(userService.softDeleteUser(1)).rejects.toThrow("DB error");
    });
  });

  // ── getStats ────────────────────────────────────────────────────────────────
  describe("getStats()", () => {
    test("debe retornar conteo correcto de usuarios", async () => {
      const mockData = [
        { active: true, deleted_at: null },
        { active: true, deleted_at: null },
        { active: false, deleted_at: "2024-01-15T00:00:00Z" },
      ];
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const result = await userService.getStats();
      expect(result).toEqual({ total: 3, active: 2, deleted: 1 });
    });

    test("debe retornar ceros si no hay usuarios", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await userService.getStats();
      expect(result).toEqual({ total: 0, active: 0, deleted: 0 });
    });
  });
});
