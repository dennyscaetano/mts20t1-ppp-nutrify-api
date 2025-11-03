const MealService = require('../services/mealService');

exports.createMeal = async (req, res, next) => {
  try {
  const meal = await MealService.createMeal(req.userId, req.body);
  // sanitize: return id, date (server-generated), foods (ids) and computed totals/timestamps
  const { id, user, date, foods, totalCalories, totalProtein, totalCarbs, totalFat, createdAt, updatedAt } = meal;
  res.status(201).json({ id, user, date, foods, totalCalories, totalProtein, totalCarbs, totalFat, createdAt, updatedAt });
  } catch (err) {
    next(err);
  }
};

exports.getMeals = async (req, res, next) => {
  try {
  const meals = await MealService.getMeals(req.userRole, req.userId, req.query.userId);
  // sanitize: ensure id and timestamps
  const sanitized = meals.map(m => ({ id: m.id, user: m.user, date: m.date, foods: m.foods, totalCalories: m.totalCalories, totalProtein: m.totalProtein, totalCarbs: m.totalCarbs, totalFat: m.totalFat, createdAt: m.createdAt, updatedAt: m.updatedAt }));
  res.json(sanitized);
  } catch (err) {
    next(err);
  }
};

exports.updateMeal = async (req, res, next) => {
  try {
    const meal = await MealService.updateMeal(req.userRole, req.userId, req.params.id, req.body);
  // ensure foods are ids and totals/timestamps are present
  res.json(meal);
  } catch (err) {
    next(err);
  }
};

exports.deleteMeal = async (req, res, next) => {
  try {
    await MealService.deleteMeal(req.userRole, req.userId, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
