jest.mock("../../src/config/supabase");
jest.mock("bcryptjs");

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../src/app");
const supabase = require("../../src/config/supabase");
const bcrypt = require("bcryptjs");

const userToken = jwt.sign(
  { id: 1, username: "testuser", role: "user" },
  "test-jwt-secret-for-tests"
);
const adminToken = jwt.sign(
  { id: 2, username: "admin", role: "admin" },
  "test-jwt-secret-for-tests"
);

const mockUser = {
  id: 3,
  username: "johndoe",
  email: "john@example.com",
  role: "user",
  active: true,
  created_at: "2024-01-01T00:00:00Z",
};

describe("API /api/users - Pruebas de Integración", () => {
  // ── GET /api/users ──────────────────────────────────────────────────────────
  describe("GET /api/users", () => {
    test("admin puede listar usuarios - responde 200", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [mockUser], error: null }),
        }),
      });

      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("usuario normal no puede listar usuarios - responde 403", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    test("sin token responde 401", async () => {
      const res = await request(app).get("/api/users");
      expect(res.statusCode).toBe(401);
    });
  });

  // ── GET /api/users/stats ────────────────────────────────────────────────────
  describe("GET /api/users/stats", () => {
    test("admin puede ver estadísticas - responde 200", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [
            { active: true, deleted_at: null },
            { active: false, deleted_at: "2024-01-15T00:00:00Z" },
          ],
          error: null,
        }),
      });

      const res = await request(app)
        .get("/api/users/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("total");
      expect(res.body).toHaveProperty("active");
      expect(res.body).toHaveProperty("deleted");
    });

    test("usuario normal no puede ver estadísticas - responde 403", async () => {
      const res = await request(app)
        .get("/api/users/stats")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  // ── POST /api/users ─────────────────────────────────────────────────────────
  describe("POST /api/users", () => {
    test("admin puede crear usuario - responde 201", async () => {
      bcrypt.hash.mockResolvedValue("$2a$10$hash");
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ username: "johndoe", email: "john@example.com", password: "pass123" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("username", "johndoe");
    });

    test("usuario normal no puede crear usuarios - responde 403", async () => {
      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ username: "johndoe", email: "john@example.com", password: "pass123" });

      expect(res.statusCode).toBe(403);
    });

    test("admin con datos inválidos recibe 400", async () => {
      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ username: "nopass" });

      expect(res.statusCode).toBe(400);
    });
  });

  // ── PUT /api/users/:id ──────────────────────────────────────────────────────
  describe("PUT /api/users/:id", () => {
    test("debe actualizar usuario y responder con 200", async () => {
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

      const res = await request(app)
        .put("/api/users/3")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ email: "nuevo@example.com" });

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe("nuevo@example.com");
    });

    test("sin token responde 401", async () => {
      const res = await request(app).put("/api/users/1").send({ email: "x@x.com" });
      expect(res.statusCode).toBe(401);
    });
  });

  // ── DELETE /api/users/:id ───────────────────────────────────────────────────
  describe("DELETE /api/users/:id", () => {
    test("admin puede eliminar usuario - responde 200", async () => {
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const res = await request(app)
        .delete("/api/users/3")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Usuario eliminado correctamente");
    });

    test("usuario normal no puede eliminar - responde 403", async () => {
      const res = await request(app)
        .delete("/api/users/3")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });
});
