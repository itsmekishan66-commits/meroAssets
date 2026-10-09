const { AppError } = require('../../shared/errors');
const env = require('../../config/env');
const { SESSION_TTL_MS, OTP_TTL_MS, MAX_OTP_ATTEMPTS } = require('../../shared/constants');
const repository = require('./admin.repository');
const activity = require('../activity/activity.service');
const mapper = require('../credentials/credential.mapper');

// Shape one user for admin views. The role is derived from ADMIN_EMAILS in
// client/.env — there is no role field on the User model.
const toUserView = (user, counts = {}) => ({
  _id: user._id,
  email: user.email,
  name: user.name || '',
  phone: user.phone || '',
  address: user.address || '',
  role: env.isAdminEmail(user.email) ? 'admin' : 'user',
  disabled: Boolean(user.disabled),
  credentialCount: counts.total || 0,
  favoriteCount: counts.favorites || 0,
  createdAt: user.createdAt,
});

const normalizePage = (page = 1, limit = 20, maxLimit = 100) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), maxLimit);
  const safePage = Math.max(Number(page) || 1, 1);
  return { limit: safeLimit, page: safePage, skip: (safePage - 1) * safeLimit };
};

const getOverview = async () => {
  const [totalUsers, totalCredentials, totalFavorites, categories, recentSignups, breakdown, recentActivity] =
    await Promise.all([
      repository.countUsers(),
      repository.countCredentials(),
      repository.countFavorites(),
      repository.distinctCategories(),
      repository.findRecentSignups(6),
      repository.categoryBreakdown(),
      activity.listRecent(8),
    ]);

  return {
    totals: {
      users: totalUsers,
      credentials: totalCredentials,
      favorites: totalFavorites,
      categories: categories.length,
    },
    recentSignups,
    categoryBreakdown: breakdown,
    recentActivity,
  };
};

const listUsers = async ({ search = '', page = 1, limit = 20 }) => {
  const { limit: safeLimit, page: safePage, skip } = normalizePage(page, limit);

  const [users, total, counts] = await Promise.all([
    repository.findUsers({ search, limit: safeLimit, skip }),
    repository.countUsersByFilter(search),
    repository.credentialCountsByUser(),
  ]);

  const byEmail = Object.fromEntries(counts.map((c) => [c._id, c]));
  return {
    users: users.map((u) => toUserView(u, byEmail[u.email] || {})),
    total,
    page: safePage,
    limit: safeLimit,
  };
};

const getUserDetail = async (id) => {
  const user = await repository.findUserById(id);
  if (!user) throw new AppError('User not found', 404);

  const [credentials, counts] = await Promise.all([
    repository.findCredentialsForUser(user.email),
    repository.credentialCountsByUser(),
  ]);

  const byEmail = Object.fromEntries(counts.map((c) => [c._id, c]));
  return {
    user: toUserView(user, byEmail[user.email] || {}),
    credentials: credentials.map((c) => ({ ...mapper.toResponse(c), userEmail: c.userEmail })),
  };
};

const setUserDisabled = async (id, disabled, actorEmail) => {
  const user = await repository.findUserById(id);
  if (!user) throw new AppError('User not found', 404);
  if (user.email === actorEmail) {
    throw new AppError('You cannot disable your own account', 400);
  }
  if (env.isAdminEmail(user.email)) {
    throw new AppError('Admin accounts cannot be disabled', 400);
  }

  const updated = await repository.updateUserDisabled(id, Boolean(disabled));
  activity.logActivity(actorEmail, disabled ? 'admin.user.disabled' : 'admin.user.enabled', {
    targetEmail: updated.email,
  });

  return toUserView(updated);
};

const deleteUser = async (id, actorEmail) => {
  const user = await repository.findUserById(id);
  if (!user) throw new AppError('User not found', 404);
  if (user.email === actorEmail) {
    throw new AppError('You cannot delete your own account', 400);
  }
  if (env.isAdminEmail(user.email)) {
    throw new AppError('Admin accounts cannot be deleted', 400);
  }

  const [, removeResult] = await Promise.all([
    repository.deleteUser(id),
    repository.deleteCredentialsForUser(user.email),
  ]);

  activity.logActivity(actorEmail, 'admin.user.deleted', {
    targetEmail: user.email,
    credentialCount: removeResult.deletedCount || 0,
  });

  return { success: true };
};

const listCredentials = async ({ search = '', page = 1, limit = 20 }) => {
  const { limit: safeLimit, page: safePage, skip } = normalizePage(page, limit);

  const [credentials, total] = await Promise.all([
    repository.findCredentials({ search, limit: safeLimit, skip }),
    repository.countCredentialsByFilter(search),
  ]);

  return {
    credentials: credentials.map((c) => ({ ...mapper.toResponse(c), userEmail: c.userEmail })),
    total,
    page: safePage,
    limit: safeLimit,
  };
};

const listActivity = async ({ limit = 50 } = {}) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  return activity.listRecent(safeLimit);
};

// Settings are intentionally read-only from the app: values come from code
// constants and client/.env, and are changed there (not from
// the UI).
const getSettings = () => ({
  sessionTtlMs: SESSION_TTL_MS,
  otpTtlMs: OTP_TTL_MS,
  maxOtpAttempts: MAX_OTP_ATTEMPTS,
  adminEmails: [...env.adminEmails],
  smtpConfigured: Boolean(env.smtp.host),
});

const listAdmins = async () => {
  const emails = [...env.adminEmails];
  const users = await repository.findUsersByEmails(emails);
  const byEmail = new Map(users.map((u) => [u.email, u]));

  return emails.map((email) => {
    const user = byEmail.get(email);
    return {
      email,
      registered: Boolean(user),
      disabled: user ? Boolean(user.disabled) : false,
      name: user ? user.name || '' : '',
      createdAt: user ? user.createdAt : null,
    };
  });
};

module.exports = {
  getOverview,
  listUsers,
  getUserDetail,
  setUserDisabled,
  deleteUser,
  listCredentials,
  listActivity,
  getSettings,
  listAdmins,
};