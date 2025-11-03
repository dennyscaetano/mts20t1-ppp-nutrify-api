const { MealRepo, FoodRepo } = require('../repositories/db');
const HttpError = require('../errors/HttpError');

exports.createMeal = async (userId, data) => {
  // data must contain only foods: array of food ids
  const foods = await Promise.all((data.foods || []).map(id => FoodRepo.findById(id)));
  if (!Array.isArray(data.foods) || data.foods.length === 0) throw new HttpError(400, 'Foods deve ser um array não vazio');
  if (foods.some(f => !f)) throw new HttpError(400, 'Um ou mais alimentos não foram encontrados');
  const totalCalories = foods.reduce((sum, f) => sum + (f?.calories || 0), 0);
  const totalProtein = foods.reduce((sum, f) => sum + (f?.protein || 0), 0);
  const totalCarbs = foods.reduce((sum, f) => sum + (f?.carbs || 0), 0);
  const totalFat = foods.reduce((sum, f) => sum + (f?.fat || 0), 0);
  const now = new Date().toISOString();
  const meal = await MealRepo.create({
    user: userId,
    date: now,
    foods: data.foods,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    createdAt: now,
    updatedAt: now
  });
  return meal;
};

exports.getMeals = async (requesterRole, requesterUserId, targetUserId) => {
  const isAdmin = requesterRole === 'admin';
  const meals = isAdmin
    ? (targetUserId ? await MealRepo.findByUserId(targetUserId) : await MealRepo.findAll())
    : await MealRepo.findByUserId(requesterUserId);
  // populate foods and recompute totals from foods to ensure consistency
  return Promise.all(meals.map(async (m) => {
    const foods = await Promise.all((m.foods || []).map(id => FoodRepo.findById(id)));
    const totalCalories = foods.reduce((sum, f) => sum + (f?.calories || 0), 0);
    const totalProtein = foods.reduce((sum, f) => sum + (f?.protein || 0), 0);
    const totalCarbs = foods.reduce((sum, f) => sum + (f?.carbs || 0), 0);
    const totalFat = foods.reduce((sum, f) => sum + (f?.fat || 0), 0);
    return { id: m.id, user: m.user, date: m.date, foods, totalCalories, totalProtein, totalCarbs, totalFat };
  }));
};

exports.updateMeal = async (requesterRole, userId, id, data) => {
  const existing = await MealRepo.findById(id);
  if (!existing) throw new HttpError(404, 'Refeição não encontrada');
  const isAdmin = requesterRole === 'admin';
  if (!isAdmin && existing.user !== userId) throw new HttpError(403, 'Acesso negado');
  // If foods are provided, validate and recompute totals
  let toUpdate = { ...data };
  if (data.foods) {
    if (!Array.isArray(data.foods) || data.foods.length === 0) throw new HttpError(400, 'Foods deve ser um array não vazio');
    const foods = await Promise.all(data.foods.map(fid => FoodRepo.findById(fid)));
    if (foods.some(f => !f)) throw new HttpError(400, 'Um ou mais alimentos não foram encontrados');
    toUpdate.totalCalories = foods.reduce((sum, f) => sum + (f?.calories || 0), 0);
    toUpdate.totalProtein = foods.reduce((sum, f) => sum + (f?.protein || 0), 0);
    toUpdate.totalCarbs = foods.reduce((sum, f) => sum + (f?.carbs || 0), 0);
    toUpdate.totalFat = foods.reduce((sum, f) => sum + (f?.fat || 0), 0);
  }
  toUpdate.updatedAt = new Date().toISOString();
  const updated = await MealRepo.update(id, toUpdate);
  return updated;
};

exports.deleteMeal = async (requesterRole, userId, id) => {
  const existed = await MealRepo.findById(id);
  if (!existed) throw new HttpError(404, 'Refeição não encontrada');
  const isAdmin = requesterRole === 'admin';
  if (!isAdmin && existed.user !== userId) throw new HttpError(403, 'Acesso negado');
  await MealRepo.delete(id);
};
