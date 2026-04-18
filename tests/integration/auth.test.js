jest.mock("../../src/config/supabase");
jest.mock("bcryptjs");

const request = require("supertest");
const app = require("../../src/app");
const supabase = require("../../src/config/supabase");
const bcrypt = require("bcryptjs");

const mockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  password_hash: "$2a$10$hashedpassword",
  role: "user",
  active: true,
};

describe("API /api/auth - Pruebas de Integración", () => {
  // ── POST /api/auth/login ────────────────────────────────────────────────────
  describe("POST /api/auth/login", () => {
    test("debe responder con 200 y token con credenciales válidas", async () => {
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

      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "testuser", password: "password123" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("username", "testuser");
      expect(res.body.user).not.toHaveProperty("password_hash");
    });

    test("debe responder con 401 si la contraseña es incorrecta", async () => {
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

      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "testuser", password: "wrongpass" });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    test("debe responder con 401 si el usuario no existe", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
            }),
          }),
        }),
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "noexiste", password: "pass" });

      expect(res.statusCode).toBe(401);
    });

    test("debe responder con 401 si faltan campos", async () => {
      const res = await request(app).post("/api/auth/login").send({});
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ── POST /api/auth/register ─────────────────────────────────────────────────
  describe("POST /api/auth/register", () => {
    test("debe registrar usuario y responder con 201", async () => {
      const created = { id: 2, username: "newuser", email: "new@example.com", role: "user" };
      bcrypt.hash.mockResolvedValue("$2a$10$hash");
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: created, error: null }),
          }),
        }),
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "newuser", email: "new@example.com", password: "pass123" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("username", "newuser");
      expect(res.body).not.toHaveProperty("password_hash");
    });

    test("debe responder con 400 si faltan campos", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "user" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("debe responder con 400 si Supabase rechaza (email duplicado)", async () => {
      bcrypt.hash.mockResolvedValue("$2a$10$hash");
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "duplicate key value" },
            }),
          }),
        }),
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "dup", email: "dup@example.com", password: "pass" });

      expect(res.statusCode).toBe(400);
    });
  });
});
