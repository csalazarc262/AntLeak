jest.mock("../../src/config/supabase");

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../src/app");
const supabase = require("../../src/config/supabase");

const userToken = jwt.sign(
  { id: 1, username: "testuser", role: "user" },
  "test-jwt-secret-for-tests"
);
const adminToken = jwt.sign(
  { id: 2, username: "admin", role: "admin" },
  "test-jwt-secret-for-tests"
);

const mockExpense = {
  id: 1,
  user_id: 1,
  amount: 15.5,
  date: "2024-01-10",
  category: "alimentacion",
  description: "Café",
};

describe("API /api/expenses - Pruebas de Integración", () => {
  // ── POST /api/expenses ──────────────────────────────────────────────────────
  describe("POST /api/expenses", () => {
    test("debe crear gasto y responder con 201", async () => {
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockExpense, error: null }),
          }),
        }),
      });

      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ amount: 15.5, date: "2024-01-10", category: "alimentacion" });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("category", "alimentacion");
    });

    test("debe responder con 401 sin token", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .send({ amount: 10, date: "2024-01-10", category: "otros" });

      expect(res.statusCode).toBe(401);
    });

    test("debe responder con 400 con datos inválidos", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ amount: -5, date: "2024-01-10", category: "otros" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("debe responder con 400 con categoría inválida", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ amount: 10, date: "2024-01-10", category: "videojuegos" });

      expect(res.statusCode).toBe(400);
    });
  });

  // ── GET /api/expenses ───────────────────────────────────────────────────────
  describe("GET /api/expenses", () => {
    test("usuario normal solo ve sus gastos - responde 200", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [mockExpense], error: null }),
          }),
        }),
      });

      const res = await request(app)
        .get("/api/expenses")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("admin ve todos los gastos - responde 200", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [mockExpense], error: null }),
        }),
      });

      const res = await request(app)
        .get("/api/expenses")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("debe responder con 401 sin token", async () => {
      const res = await request(app).get("/api/expenses");
      expect(res.statusCode).toBe(401);
    });
  });

  // ── GET /api/expenses/stats ─────────────────────────────────────────────────
  describe("GET /api/expenses/stats", () => {
    test("admin puede ver estadísticas - responde 200", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ amount: "10.00", user_id: 1 }],
          error: null,
        }),
      });

      const res = await request(app)
        .get("/api/expenses/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("totalCount");
      expect(res.body).toHaveProperty("totalAmount");
      expect(res.body).toHaveProperty("averagePerUser");
    });

    test("usuario normal no puede ver estadísticas - responde 403", async () => {
      const res = await request(app)
        .get("/api/expenses/stats")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });
  });

  // ── DELETE /api/expenses/:id ────────────────────────────────────────────────
  describe("DELETE /api/expenses/:id", () => {
    test("usuario puede eliminar su gasto - responde 200", async () => {
      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
      });

      const res = await request(app)
        .delete("/api/expenses/1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Gasto eliminado correctamente");
    });

    test("debe responder con 401 sin token", async () => {
      const res = await request(app).delete("/api/expenses/1");
      expect(res.statusCode).toBe(401);
    });
  });
});
