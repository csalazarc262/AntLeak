// tests/unit/productService.test.js
// Pruebas UNITARIAS: testean la lógica pura sin tocar la base de datos real
// Se usa jest.mock() para simular (mockear) el cliente de Supabase

jest.mock("../../src/config/supabase");

const supabase = require("../../src/config/supabase");
const productService = require("../../src/services/productService");

describe("ProductService - Pruebas Unitarias", () => {
  // ── getAllProducts ──────────────────────────────────────────────────────────
  describe("getAllProducts()", () => {
    test("debe retornar lista de productos correctamente", async () => {
      const fakeProducts = [
        { id: 1, name: "Laptop", price: 999 },
        { id: 2, name: "Mouse", price: 25 },
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: fakeProducts, error: null }),
      });

      const result = await productService.getAllProducts();
      expect(result).toEqual(fakeProducts);
      expect(result).toHaveLength(2);
    });

    test("debe lanzar error si Supabase falla", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
      });

      await expect(productService.getAllProducts()).rejects.toThrow("DB error");
    });
  });

  // ── createProduct ───────────────────────────────────────────────────────────
  describe("createProduct()", () => {
    test("debe crear un producto válido", async () => {
      const newProduct = { name: "Teclado", price: 75 };
      const savedProduct = { id: 3, ...newProduct };

      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: savedProduct, error: null }),
          }),
        }),
      });

      const result = await productService.createProduct(newProduct);
      expect(result).toEqual(savedProduct);
      expect(result.id).toBeDefined();
    });

    test("debe lanzar error si falta el nombre", async () => {
      await expect(productService.createProduct({ price: 50 })).rejects.toThrow(
        "El nombre y el precio son obligatorios"
      );
    });

    test("debe lanzar error si el precio es negativo", async () => {
      await expect(
        productService.createProduct({ name: "Producto", price: -10 })
      ).rejects.toThrow("El precio debe ser un número positivo");
    });

    test("debe lanzar error si el precio es cero", async () => {
      await expect(
        productService.createProduct({ name: "Producto", price: 0 })
      ).rejects.toThrow("El precio debe ser un número positivo");
    });
  });
});
