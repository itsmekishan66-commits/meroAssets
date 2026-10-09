const { AppError } = require('../../shared/errors');
const { encryptPassword, decryptPassword } = require('../../shared/utils/crypto');
const { MASKED_PASSWORD } = require('../../shared/constants');
const repository = require('./credential.repository');
const mapper = require('./credential.mapper');
const activity = require('../activity/activity.service');

// GET all credentials (passwords masked)
const listCredentials = async (userEmail) => {
  const credentials = await repository.findByUser(userEmail);
  return credentials.map(mapper.toResponse);
};

// GET single credential with decrypted password
const revealCredential = async (id, userEmail, encryptionKey) => {
  const credential = await repository.findOneByUser(id, userEmail);
  if (!credential) throw new AppError('Not found', 404);

  const password = decryptPassword(credential.encryptedPassword, encryptionKey);
  activity.logActivity(userEmail, 'credential.reveal', { site: credential.site });
  return mapper.toRevealed(credential, password);
};

// POST create credential
const createCredential = async (userEmail, encryptionKey, data) => {
  const { site, url, username, email, password, notes, category } = data;

  const encryptedPassword = encryptPassword(password, encryptionKey);
  const credential = await repository.create({
    userEmail,
    site,
    url,
    username,
    email,
    encryptedPassword,
    notes,
    category: category || 'General',
  });

  activity.logActivity(userEmail, 'credential.create', { site: credential.site });
  return mapper.toResponse(credential);
};

// PUT update credential
const updateCredential = async (id, userEmail, encryptionKey, data) => {
  const { site, url, username, email, password, notes, category, favorite } = data;

  const credential = await repository.findOneByUser(id, userEmail);
  if (!credential) throw new AppError('Not found', 404);

  if (site !== undefined) credential.site = site;
  if (url !== undefined) credential.url = url;
  if (username !== undefined) credential.username = username;
  if (email !== undefined) credential.email = email;
  if (notes !== undefined) credential.notes = notes;
  if (category !== undefined) credential.category = category;
  if (favorite !== undefined) credential.favorite = favorite;

  if (password && password !== MASKED_PASSWORD) {
    credential.encryptedPassword = encryptPassword(password, encryptionKey);
  }

  credential.updatedAt = new Date();
  await repository.save(credential);
  activity.logActivity(userEmail, 'credential.update', { site: credential.site });

  return mapper.toResponse(credential);
};

// DELETE credential
const deleteCredential = async (id, userEmail) => {
  const credential = await repository.removeOne(id, userEmail);
  if (!credential) throw new AppError('Not found', 404);
  activity.logActivity(userEmail, 'credential.delete', { site: credential.site });
  return { success: true };
};

// GET stats
const getStats = async (userEmail) => {
  const [total, favorites, categories] = await Promise.all([
    repository.countByUser(userEmail),
    repository.countFavoritesByUser(userEmail),
    repository.distinctCategoriesByUser(userEmail),
  ]);
  return { total, favorites, categories: categories.length };
};

module.exports = {
  listCredentials,
  revealCredential,
  createCredential,
  updateCredential,
  deleteCredential,
  getStats,
};
