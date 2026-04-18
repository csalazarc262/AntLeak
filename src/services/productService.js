const supabase = require("../config/supabase");

/**
 * Obtiene todos los productos de la base de datos
 */
async function getAllProducts() {
  const { data, error } = await supabase.from("products").select("*");
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Obtiene un producto por su ID
 */
async function getProductById(id) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Crea un nuevo producto
 */
async function createProduct(product) {
  const { name, price } = product;

  if (!name || price == null) {
    throw new Error("El nombre y el precio son obligatorios");
  }
  if (typeof price !== "number" || price <= 0) {
    throw new Error("El precio debe ser un número positivo");
  }

  const { data, error } = await supabase
    .from("products")
    .insert([{ name, price }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Elimina un producto por su ID
 */
async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { message: "Producto eliminado correctamente" };
}

module.exports = { getAllProducts, getProductById, createProduct, deleteProduct };
