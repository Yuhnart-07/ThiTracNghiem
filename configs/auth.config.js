const { Buffer } = require("buffer");

const AUTH_COOKIE_NAME = "hp_exam_user";

const parseCookies = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((cookies, item) => {
    const separatorIndex = item.indexOf("=");

    if (separatorIndex === -1) {
      return cookies;
    }

    const key = item.slice(0, separatorIndex).trim();
    const value = item.slice(separatorIndex + 1).trim();

    if (key) {
      cookies[key] = decodeURIComponent(value);
    }

    return cookies;
  }, {});

const normalizeUser = (user) => ({
  id: user.ID || user.id,
  username: user.USERNAME || user.username,
  role: user.ROLE || user.role,
  maGiangVien: (user.MAGV || user.maGiangVien || "").trim(),
  maSinhVien: (user.MASV || user.maSinhVien || "").trim(),
  ho: user.HO || user.ho || "",
  ten: user.TEN || user.ten || "",
});

const encodeAuthUser = (user) => {
  const normalizedUser = normalizeUser(user);
  return Buffer.from(JSON.stringify(normalizedUser), "utf8").toString("base64url");
};

const decodeAuthUser = (token) => {
  if (!token) return null;

  try {
    return normalizeUser(JSON.parse(Buffer.from(token, "base64url").toString("utf8")));
  } catch {
    return null;
  }
};

const getAuthUserFromRequest = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  return decodeAuthUser(cookies[AUTH_COOKIE_NAME]);
};

const setAuthCookie = (res, user) => {
  res.cookie(AUTH_COOKIE_NAME, encodeAuthUser(user), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 8,
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
};

module.exports = {
  AUTH_COOKIE_NAME,
  getAuthUserFromRequest,
  setAuthCookie,
  clearAuthCookie,
};
