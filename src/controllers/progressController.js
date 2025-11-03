const ProgressService = require('../services/progressService');

exports.getDaily = async (req, res, next) => {
  try {
    const result = await ProgressService.getDailyProgress(
      req.userRole,
      req.userId,
      req.query.userId,
      req.query.date
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};


