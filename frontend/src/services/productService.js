import { api } from '../api/client.js';

/**
 * Servicio para consumir endpoints de productos
 */

// Obtener todos los productos agrupados por categoría
export const getProductsByCategory = async () => {
  try {
    const response = await api.get('/products/by-category');
    console.log('✅ Productos por categoría obtenidos:', response);
    return response;
  } catch (error) {
    console.error('❌ Error al obtener productos por categoría:', error);
    throw error;
  }
};

// Obtener todos los productos (sin agrupar)
export const getAllProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.category_id) queryParams.append('category_id', filters.category_id);
    if (filters.product_type) queryParams.append('product_type', filters.product_type);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.offset) queryParams.append('offset', filters.offset);

    const path = `/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get(path);
    console.log('✅ Todos los productos obtenidos:', response);
    return response;
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    throw error;
  }
};

// Crear nuevo producto
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    console.log('✅ Producto creado:', response);
    return response;
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    throw error;
  }
};

// Actualizar producto
export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/products/${productId}`, productData);
    console.log('✅ Producto actualizado:', response);
    return response;
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    throw error;
  }
};

// Eliminar producto
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    console.log('✅ Producto eliminado:', response);
    return response;
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    throw error;
  }
};
