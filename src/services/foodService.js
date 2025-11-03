const { FoodRepo } = require('../repositories/db');
const HttpError = require('../errors/HttpError');

exports.createFood = async (data) => {
  const food = await FoodRepo.create(data);
  return food;
};

exports.getFoods = async (sortBy = 'name', order = 'asc') => {
  const foods = await FoodRepo.findAll();
  const validFields = ['name', 'category', 'calories', 'protein', 'carbs', 'fat', 'createdAt', 'updatedAt'];
  const validOrder = ['asc', 'desc'];
  
  if (!validFields.includes(sortBy)) {
    throw new HttpError(400, `Campo de ordenação inválido. Campos permitidos: ${validFields.join(', ')}`);
  }
  if (!validOrder.includes(order.toLowerCase())) {
    throw new HttpError(400, `Direção de ordenação inválida. Use 'asc' ou 'desc'`);
  }
  
  const sorted = [...foods].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    // Handle null/undefined
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';
    
    // Date comparison for createdAt and updatedAt
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      const dateA = new Date(aVal).getTime();
      const dateB = new Date(bVal).getTime();
      const comparison = dateA - dateB;
      return order.toLowerCase() === 'asc' ? comparison : -comparison;
    }
    
    // String comparison for name and category
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      const comparison = aVal.localeCompare(bVal, 'pt-BR', { sensitivity: 'base' });
      return order.toLowerCase() === 'asc' ? comparison : -comparison;
    }
    
    // Numeric comparison for numbers (calories, protein, carbs, fat)
    const comparison = aVal - bVal;
    return order.toLowerCase() === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

exports.updateFood = async (id, data) => {
  const updated = await FoodRepo.update(id, data);
  if (!updated) throw new HttpError(404, 'Alimento não encontrado');
  return updated;
};

exports.deleteFood = async (id) => {
  const existed = await FoodRepo.findById(id);
  if (!existed) throw new HttpError(404, 'Alimento não encontrado');
  await FoodRepo.delete(id);
};
