jest.mock("../../src/config/supabase");

const supabase = require("../../src/config/supabase");
const expenseService = require("../../src/services/expenseService");

const mockExpense = {
  id: 1,
  user_id: 1,
  amount: 15.5,
  date: "2024-01-10",
  category: "alimentacion",
  description: "Café",
  created_at: "2024-01-10T08:00:00Z",
};

describe("ExpenseService - Pruebas Unitarias", () => {
  // ── createExpense ───────────────────────────────────────────────────────────
  describe("createExpense()", () => {
    test("debe crear un gasto válido", async () => {
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockExpense, error: null }),
          }),
        }),
      });

      const result = await expenseService.createExpense({
        user_id: 1,
        amount: 15.5,
        date: "2024-01-10",
        category: "alimentacion",
      });

      expect(result).toMatchObject({ amount: 15.5, category: "alimentacion" });
    });

    test("debe lanzar error si faltan campos requeridos", async () => {
      await expect(
        expenseService.createExpense({ user_id: 1, amount: 10 })
      ).rejects.toThrow("Monto, fecha y categoría son requeridos");
    });

    test("debe lanzar error si el monto es negativo", async () => {
      await expect(
        expenseService.createExpense({ user_id: 1, amount: -5, date: "2024-01-10", category: "otros" })
      ).rejects.toThrow("El monto debe ser un número positivo");
    });

    test("debe lanzar error si el monto es cero", async () => {
      await expect(
        expenseService.createExpense({ user_id: 1, amount: 0, date: "2024-01-10", category: "otros" })
      ).rejects.toThrow("El monto debe ser un número positivo");
    });

    test("debe lanzar error con categoría inválida", async () => {
      await expect(
        expenseService.createExpense({ user_id: 1, amount: 10, date: "2024-01-10", category: "videojuegos" })
      ).rejects.toThrow("Categoría inválida");
    });

    test("debe lanzar error si Supabase falla", async () => {
      supabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
          }),
        }),
      });

      await expect(
        expenseService.createExpense({ user_id: 1, amount: 10, date: "2024-01-10", category: "otros" })
      ).rejects.toThrow("DB error");
    });
  });

  // ── getExpensesByUser ───────────────────────────────────────────────────────
  describe("getExpensesByUser()", () => {
    test("debe retornar gastos del usuario", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [mockExpense], error: null }),
          }),
        }),
      });

      const result = await expenseService.getExpensesByUser(1);
      expect(result).toHaveLength(1);
      expect(result[0].user_id).toBe(1);
    });

    test("debe lanzar error si Supabase falla", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
          }),
        }),
      });

      await expect(expenseService.getExpensesByUser(1)).rejects.toThrow("DB error");
    });
  });

  // ── getAllExpenses ──────────────────────────────────────────────────────────
  describe("getAllExpenses()", () => {
    test("debe retornar todos los gastos", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [mockExpense], error: null }),
        }),
      });

      const result = await expenseService.getAllExpenses();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
    });
  });

  // ── getExpenseStats ─────────────────────────────────────────────────────────
  describe("getExpenseStats()", () => {
    test("debe calcular estadísticas correctamente", async () => {
      const data = [
        { amount: "10.00", user_id: 1 },
        { amount: "20.00", user_id: 1 },
        { amount: "30.00", user_id: 2 },
      ];
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data, error: null }),
      });

      const result = await expenseService.getExpenseStats();
      expect(result.totalCount).toBe(3);
      expect(result.totalAmount).toBeCloseTo(60);
      expect(result.averagePerUser).toBeCloseTo(30);
    });

    test("debe retornar ceros si no hay gastos", async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await expenseService.getExpenseStats();
      expect(result).toEqual({ totalCount: 0, totalAmount: 0, averagePerUser: 0 });
    });
  });

  // ── deleteExpense ───────────────────────────────────────────────────────────
  describe("deleteExpense()", () => {
    test("admin puede eliminar cualquier gasto", async () => {
      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      const result = await expenseService.deleteExpense(1, 99, "admin");
      expect(result).toHaveProperty("message", "Gasto eliminado correctamente");
    });

    test("usuario solo puede eliminar su propio gasto", async () => {
      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
      });

      const result = await expenseService.deleteExpense(1, 1, "user");
      expect(result).toHaveProperty("message", "Gasto eliminado correctamente");
    });

    test("debe lanzar error si Supabase falla", async () => {
      supabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: { message: "DB error" } }),
        }),
      });

      await expect(expenseService.deleteExpense(1, 99, "admin")).rejects.toThrow("DB error");
    });
  });

  // ── VALID_CATEGORIES ────────────────────────────────────────────────────────
  describe("VALID_CATEGORIES", () => {
    test("debe exportar las categorías válidas", () => {
      expect(expenseService.VALID_CATEGORIES).toContain("alimentacion");
      expect(expenseService.VALID_CATEGORIES).toContain("transporte");
      expect(expenseService.VALID_CATEGORIES).toContain("otros");
    });
  });
});
