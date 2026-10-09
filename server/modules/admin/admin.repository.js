const User = require('../../models/user.model');
const Credential = require('../../models/credential.model');

// Escape user input before it is embedded in a RegExp.
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Build a case-insensitive $or filter over the given fields, or {} for "".
const makeSearchFilter = (search, fields) => {
  if (!search) return {};
  const regex = new RegExp(escapeRegExp(search), 'i');
  return { $or: fields.map((field) => ({ [field]: regex })) };
};

const countUsers = () => User.countDocuments();
const countCredentials = () => Credential.countDocuments();
const countFavorites = () => Credential.countDocuments({ favorite: true });
const distinctCategories = () => Credential.distinct('category');

const findUsers = ({ search = '', limit = 20, skip = 0 }) =>
  User.find(makeSearchFilter(search, ['email', 'name']))
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

const countUsersByFilter = (search = '') =>
  User.countDocuments(makeSearchFilter(search, ['email', 'name']));

const findUserById = (id) => User.findById(id).lean();

const findUsersByEmails = (emails) => User.find({ email: { $in: emails } }).lean();

const updateUserDisabled = (id, disabled) =>
  User.findByIdAndUpdate(id, { disabled }, { new: true, runValidators: true }).lean();

const deleteUser = (id) => User.findByIdAndDelete(id).lean();

const deleteCredentialsForUser = (email) => Credential.deleteMany({ userEmail: email });

const findRecentSignups = (limit = 6) =>
  User.find().sort({ createdAt: -1 }).limit(limit).select('email name createdAt').lean();

const credentialCountsByUser = () =>
  Credential.aggregate([
    {
      $group: {
        _id: '$userEmail',
        total: { $sum: 1 },
        favorites: { $sum: { $cond: ['$favorite', 1, 0] } },
      },
    },
  ]);

const categoryBreakdown = () =>
  Credential.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]);

const CREDENTIAL_SEARCH_FIELDS = ['site', 'username', 'email', 'userEmail', 'notes', 'url'];

const findCredentials = ({ search = '', limit = 20, skip = 0 }) =>
  Credential.find(makeSearchFilter(search, CREDENTIAL_SEARCH_FIELDS))
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

const countCredentialsByFilter = (search = '') =>
  Credential.countDocuments(makeSearchFilter(search, CREDENTIAL_SEARCH_FIELDS));

const findCredentialsForUser = (email) =>
  Credential.find({ userEmail: email }).sort({ updatedAt: -1 }).lean();

module.exports = {
  countUsers,
  countCredentials,
  countFavorites,
  distinctCategories,
  findUsers,
  countUsersByFilter,
  findUserById,
  findUsersByEmails,
  updateUserDisabled,
  deleteUser,
  deleteCredentialsForUser,
  findRecentSignups,
  credentialCountsByUser,
  categoryBreakdown,
  findCredentials,
  countCredentialsByFilter,
  findCredentialsForUser,
};