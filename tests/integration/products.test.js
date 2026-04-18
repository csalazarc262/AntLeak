// tests/integration/products.test.js
// Pruebas de INTEGRACIÓN: testean los endpoints HTTP completos
// También se mockea Supabase para no necesitar conexión real

jest.mock("../../src/config/supabase");

const request = require("supertest");
const app = require("../../src/app");
const supabase = require("../../src/config/supabase");

describe("API /api/products - Pruebas de Integración", () => {
  // ── GET /api/products ───────────────────────────────────────────────────────
  describe("GET /api/products", () => {
    test("debe responder con status 200 y lista de productos", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 1, name: "Monitor", price: 300 }],
          error: null,
        }),
      });

      const res = await request(app).get("/api/products");
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty("name", "Monitor");
    });

    test("debe responder con 500 si hay error en la DB", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error: { message: "DB down" } }),
      });

      const res = await request(app).get("/api/products");
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ── POST /api/products ──────────────────────────────────────────────────────
  describe("POST /api/products", () => {
    test("debe crear producto y responder con status 201", async () => {
      const newProduct = { name: "Webcam", price: 89 };

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 5, ...newProduct },
              error: null,
            }),
          }),
        }),
      });

      const res = await request(app).post("/api/products").send(newProduct);
      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject(newProduct);
      expect(res.body.id).toBeDefined();
    });

    test("debe responder con 400 si faltan campos", async () => {
      const res = await request(app).post("/api/products").send({ name: "Sin precio" });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ── DELETE /api/products/:id ────────────────────────────────────────────────
  describe("DELETE /api/products/:id", () => {
    test("debe eliminar producto y responder con 200", async () => {
      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const res = await request(app).delete("/api/products/1");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Producto eliminado correctamente");
    });
  });
});
