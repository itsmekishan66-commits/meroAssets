const { MASKED_PASSWORD } = require('../../shared/constants');

const toResponse = (cred) => ({
  _id: cred._id,
  site: cred.site,
  url: cred.url,
  username: cred.username,
  email: cred.email,
  notes: cred.notes,
  category: cred.category,
  favorite: cred.favorite,
  createdAt: cred.createdAt,
  updatedAt: cred.updatedAt,
  password: MASKED_PASSWORD,
});

const toRevealed = (cred, password) => ({
  _id: cred._id,
  site: cred.site,
  url: cred.url,
  username: cred.username,
  email: cred.email,
  password,
  notes: cred.notes,
  category: cred.category,
  favorite: cred.favorite,
});

module.exports = { toResponse, toRevealed };
