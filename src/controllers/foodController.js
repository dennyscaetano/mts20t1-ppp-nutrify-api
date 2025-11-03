const FoodService = require('../services/foodService');

exports.createFood = async (req, res, next) => {
  try {
    const food = await FoodService.createFood(req.body);
  // sanitize: return id and timestamps
  const { id, name, category, calories, protein, carbs, fat, createdAt, updatedAt } = food;
  res.status(201).json({ id, name, category, calories, protein, carbs, fat, createdAt, updatedAt });
  } catch (err) {
    next(err);
  }
};

exports.getFoods = async (req, res, next) => {
  try {
  const sortBy = req.query.sortBy || 'name';
  const order = req.query.order || 'asc';
  const foods = await FoodService.getFoods(sortBy, order);
  const sanitized = foods.map(f => ({ id: f.id, name: f.name, category: f.category, calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat, createdAt: f.createdAt, updatedAt: f.updatedAt }));
  res.json(sanitized);
  } catch (err) {
    next(err);
  }
};

exports.updateFood = async (req, res, next) => {
  try {
    const food = await FoodService.updateFood(req.params.id, req.body);
  const { id, name, category, calories, protein, carbs, fat, createdAt, updatedAt } = food;
  res.json({ id, name, category, calories, protein, carbs, fat, createdAt, updatedAt });
  } catch (err) {
    next(err);
  }
};

exports.deleteFood = async (req, res, next) => {
  try {
    await FoodService.deleteFood(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
