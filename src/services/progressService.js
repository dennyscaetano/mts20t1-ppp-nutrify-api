const { MealRepo, UserRepo } = require('../repositories/db');
const HttpError = require('../errors/HttpError');

function normalizeDate(dateStr) {
  if (!dateStr) return new Date().toISOString().slice(0, 10);
  // Expect YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) throw new HttpError(400, 'Parâmetro date deve estar no formato YYYY-MM-DD');
  return dateStr;
}

exports.getDailyProgress = async (requesterRole, requesterUserId, targetUserId, dateStr) => {
  const isAdmin = requesterRole === 'admin';
  const userId = (isAdmin && targetUserId) ? targetUserId : requesterUserId;
  const user = await UserRepo.findById(userId);
  if (!user) throw new HttpError(404, 'Usuário não encontrado');

  const date = normalizeDate(dateStr);

  const meals = await MealRepo.findByUserId(userId);
  const dailyMeals = meals.filter(m => (m.date || '').slice(0, 10) === date);
  const totalCalories = dailyMeals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
  const calorieGoal = user.calorieGoal || 2000;
  const difference = calorieGoal - totalCalories;
  const status = difference === 0 ? 'equal' : (difference > 0 ? 'below' : 'above');

  return { userId, date, totalCalories, calorieGoal, difference, status };
};


