const Activity = require('../../models/activity.model');

const create = (entry) => Activity.create(entry);

const findRecent = (limit = 50) =>
  Activity.find().sort({ createdAt: -1 }).limit(limit).lean();

module.exports = { create, findRecent };