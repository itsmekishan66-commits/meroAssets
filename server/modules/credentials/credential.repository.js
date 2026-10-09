const Credential = require('../../models/credential.model');

const findByUser = (userEmail) => {
  return Credential.find({ userEmail }).sort({ updatedAt: -1 });
};

const findOneByUser = (id, userEmail) => {
  return Credential.findOne({ _id: id, userEmail });
};

const create = (data) => Credential.create(data);

const save = (credential) => credential.save();

const removeOne = (id, userEmail) => {
  return Credential.findOneAndDelete({ _id: id, userEmail });
};

const countByUser = (userEmail) => {
  return Credential.countDocuments({ userEmail });
};

const countFavoritesByUser = (userEmail) => {
  return Credential.countDocuments({ userEmail, favorite: true });
};

const distinctCategoriesByUser = (userEmail) => {
  return Credential.distinct('category', { userEmail });
};

module.exports = {
  findByUser,
  findOneByUser,
  create,
  save,
  removeOne,
  countByUser,
  countFavoritesByUser,
  distinctCategoriesByUser,
};
