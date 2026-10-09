const service = require('./admin.service');

const overview = async (req, res, next) => {
  try {
    res.json(await service.getOverview());
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    res.json(await service.listUsers(req.query));
  } catch (err) {
    next(err);
  }
};

const getUserDetail = async (req, res, next) => {
  try {
    res.json(await service.getUserDetail(req.params.id));
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { disabled } = req.body || {};
    if (typeof disabled !== 'boolean') {
      return res.status(400).json({ error: 'disabled must be true or false' });
    }
    res.json(await service.setUserDisabled(req.params.id, disabled, req.userEmail));
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    res.json(await service.deleteUser(req.params.id, req.userEmail));
  } catch (err) {
    next(err);
  }
};

const listCredentials = async (req, res, next) => {
  try {
    res.json(await service.listCredentials(req.query));
  } catch (err) {
    next(err);
  }
};

const listActivity = async (req, res, next) => {
  try {
    res.json(await service.listActivity(req.query));
  } catch (err) {
    next(err);
  }
};

const settings = (req, res) => res.json(service.getSettings());

const listAdmins = async (req, res, next) => {
  try {
    res.json(await service.listAdmins());
  } catch (err) {
    next(err);
  }
};

module.exports = {
  overview,
  listUsers,
  getUserDetail,
  updateUser,
  deleteUser,
  listCredentials,
  listActivity,
  settings,
  listAdmins,
};