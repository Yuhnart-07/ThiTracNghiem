const { Buffer } = require("buffer");
const crypto = require("crypto");

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

const normalizeUser = (user) => {
  let role = String(user.ROLE || user.role || "").trim().toUpperCase();
  if (role === "STUDENT") {
    role = "SINHVIEN";
  }
  return {
    id: user.ID || user.id,
    username: user.USERNAME || user.username,
    role: role,
    maGiangVien: (user.MAGV || user.maGiangVien || "").trim(),
    maSinhVien: (user.MASV || user.maSinhVien || "").trim(),
    maLop: (user.MALOP || user.maLop || "").trim(),
    ho: user.HO || user.ho || "",
    ten: user.TEN || user.ten || "",
  };
};

const signToken = (user) => {
  const normalizedUser = normalizeUser(user);
  const payload = Buffer.from(JSON.stringify(normalizedUser), "utf8").toString("base64url");
  const secret = process.env.COOKIE_SECRET || "default_secret";
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

const verifyToken = (token) => {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  const secret = process.env.COOKIE_SECRET || "default_secret";
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    return normalizeUser(JSON.parse(Buffer.from(payload, "base64url").toString("utf8")));
  } catch {
    return null;
  }
};

const getAuthUserFromRequest = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  return verifyToken(cookies[AUTH_COOKIE_NAME]);
};

const setAuthCookie = (res, user) => {
  res.cookie(AUTH_COOKIE_NAME, signToken(user), {
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
