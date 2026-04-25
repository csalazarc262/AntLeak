/**
 * PRUEBAS QUE FALLAN INTENCIONALMENTE
 *
 * Cada prueba documenta un comportamiento que el código NO implementa aún.
 * Son útiles para registrar mejoras pendientes o bugs conocidos.
 * Razón del fallo indicada en cada bloque.
 */

jest.mock("../../src/config/supabase");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const supabase = require("../../src/config/supabase");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");

const authService    = require("../../src/services/authService");
const expenseService = require("../../src/services/expenseService");
const userService    = require("../../src/services/userService");

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SERVICE
// ─────────────────────────────────────────────────────────────────────────────
describe("AuthService - Comportamientos pendientes", () => {

  test("el registro debe devolver un token de acceso inmediato", async () => {
    /*
     * FALLA PORQUE: register() solo devuelve los datos del usuario.
     * No genera un token. El usuario tendría que hacer login por separado.
     * MEJORA: devolver { token, user } igual que login() para un onboarding fluido.
     */
    bcrypt.hash.mockResolvedValue("$2a$10$hash");
    supabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 2, username: "nuevo", email: "nuevo@test.com", role: "user" },
            error: null,
          }),
        }),
      }),
    });

    const result = await authService.register({
      username: "nuevo",
      email: "nuevo@test.com",
      password: "pass123",
    });

    expect(result).toHaveProperty("token"); // ← no existe, falla
  });

  test("debe devolver mensaje específico cuando la cuenta está desactivada", async () => {
    /*
     * FALLA PORQUE: el servicio filtra usuarios con active=true en la consulta.
     * Si el usuario está inactivo, simplemente no lo encuentra y lanza
     * "Credenciales inválidas" — igual que si no existiera.
     * MEJORA: detectar usuarios inactivos y lanzar "Tu cuenta ha sido desactivada".
     */
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
          }),
        }),
      }),
    });

    await expect(
      authService.login("usuarioInactivo", "pass123")
    ).rejects.toThrow("Tu cuenta ha sido desactivada"); // ← lanza "Credenciales inválidas", falla
  });

  test("debe usar factor de costo 12 al hashear contraseñas", async () => {
    /*
     * FALLA PORQUE: el servicio usa bcrypt con costo 10.
     * MEJORA: subir el costo a 12 para mayor seguridad.
     */
    bcrypt.hash.mockResolvedValue("$2a$12$hash");
    supabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 1, username: "u", email: "u@u.com", role: "user" },
            error: null,
          }),
        }),
      }),
    });

    await authService.register({ username: "u", email: "u@u.com", password: "pass" });

    expect(bcrypt.hash).toHaveBeenCalledWith("pass", 12); // ← fue llamado con 10, falla
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// EXPENSE SERVICE
// ─────────────────────────────────────────────────────────────────────────────
describe("ExpenseService - Comportamientos pendientes", () => {

  test("debe rechazar gastos con fecha futura", async () => {
    /*
     * FALLA PORQUE: el servicio no valida si la fecha es futura.
     * Acepta cualquier string de fecha sin verificar que sea <= hoy.
     * MEJORA: agregar validación de fecha antes del INSERT.
     */
    await expect(
      expenseService.createExpense({
        user_id: 1,
        amount: 1500,
        date: "2099-12-31",
        category: "alimentacion",
      })
    ).rejects.toThrow("La fecha no puede ser futura"); // ← no lanza nada, falla
  });

  test("debe rechazar descripción mayor a 120 caracteres", async () => {
    /*
     * FALLA PORQUE: el límite de 120 caracteres solo se aplica en el frontend
     * (atributo maxLength del input). El backend no valida la longitud.
     * MEJORA: validar en expenseService antes de insertar en BD.
     */
    await expect(
      expenseService.createExpense({
        user_id: 1,
        amount: 1500,
        date: "2026-04-25",
        category: "otros",
        description: "a".repeat(121),
      })
    ).rejects.toThrow("La descripción no puede superar los 120 caracteres"); // ← no lanza, falla
  });

  test("debe lanzar error al intentar eliminar un gasto ajeno como usuario", async () => {
    /*
     * FALLA PORQUE: el servicio agrega el filtro user_id para usuarios normales,
     * pero si Supabase no encuentra filas (0 rows deleted) no lanza ningún error.
     * El DELETE simplemente no elimina nada y retorna éxito de todas formas.
     * MEJORA: verificar que realmente se eliminó una fila y lanzar error si no.
     */
    supabase.from.mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null, count: 0 }),
        }),
      }),
    });

    await expect(
      expenseService.deleteExpense(1, 999, "user")
    ).rejects.toThrow("No tienes permiso para eliminar este gasto"); // ← retorna éxito, falla
  });

  test("las estadísticas deben incluir el promedio por gasto", async () => {
    /*
     * FALLA PORQUE: getExpenseStats() devuelve averagePerUser (promedio por usuario),
     * no averagePerExpense (promedio por gasto individual).
     * MEJORA: agregar averagePerExpense = totalAmount / totalCount al resultado.
     */
    supabase.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [
          { amount: "1000", user_id: 1 },
          { amount: "2000", user_id: 1 },
          { amount: "3000", user_id: 2 },
        ],
        error: null,
      }),
    });

    const result = await expenseService.getExpenseStats();

    expect(result).toHaveProperty("averagePerExpense"); // ← no existe, falla
    expect(result.averagePerExpense).toBeCloseTo(2000);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// USER SERVICE
// ─────────────────────────────────────────────────────────────────────────────
describe("UserService - Comportamientos pendientes", () => {

  test("debe rechazar emails con formato inválido", async () => {
    /*
     * FALLA PORQUE: el servicio no valida el formato del email.
     * Acepta cualquier string y lo pasa directamente a Supabase.
     * MEJORA: validar con regex o librería antes de insertar.
     */
    await expect(
      userService.createUser({
        username: "usuario",
        email: "esto-no-es-un-email",
        password: "pass123",
      })
    ).rejects.toThrow("Formato de email inválido"); // ← no lanza, falla
  });

  test("debe rechazar nombres de usuario menores a 3 caracteres", async () => {
    /*
     * FALLA PORQUE: el servicio solo verifica que username no sea falsy.
     * Un username de 1 o 2 caracteres ("ab") pasa la validación.
     * MEJORA: agregar validación de longitud mínima.
     */
    await expect(
      userService.createUser({
        username: "ab",
        email: "test@test.com",
        password: "pass123",
      })
    ).rejects.toThrow("El nombre de usuario debe tener al menos 3 caracteres"); // ← no lanza, falla
  });

  test("debe impedir eliminar al último administrador del sistema", async () => {
    /*
     * FALLA PORQUE: softDeleteUser() no verifica si el usuario a eliminar
     * es el único admin activo. Podría dejarse el sistema sin administradores.
     * MEJORA: contar admins activos antes de eliminar y bloquear si solo queda uno.
     */
    supabase.from.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    await expect(
      userService.softDeleteUser(1) // supuesto único admin
    ).rejects.toThrow("No se puede eliminar al último administrador"); // ← no lanza, falla
  });

});
