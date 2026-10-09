const service = require('./credential.service');

const list = async (req, res, next) => {
  try {
    const credentials = await service.listCredentials(req.userEmail);
    res.json(credentials);
  } catch (err) {
    next(err);
  }
};

const reveal = async (req, res, next) => {
  try {
    const credential = await service.revealCredential(req.params.id, req.userEmail, req.encryptionKey);
    res.json(credential);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const credential = await service.createCredential(req.userEmail, req.encryptionKey, req.body);
    res.status(201).json(credential);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const credential = await service.updateCredential(req.params.id, req.userEmail, req.encryptionKey, req.body);
    res.json(credential);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await service.deleteCredential(req.params.id, req.userEmail);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await service.getStats(req.userEmail);
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, reveal, create, update, remove, getStats };
