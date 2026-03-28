export const getToken = () => {
  try { return localStorage.getItem('token') || null; }
  catch { return null; }
};

export const getUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw || raw === 'undefined' || raw === 'null') return null;
    return JSON.parse(raw);
  } catch { return null; }
};

export const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + getToken()
});

export const login = (token, user) => {
  if (token) localStorage.setItem('token', token);
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    if (user.role) localStorage.setItem('role', user.role);
  }
};

export const logout = () => {
  ['token','user','role','userPrimaryRole',
   'userPrimaryLanguage','targetJobId','testJustCompleted']
    .forEach(k => localStorage.removeItem(k));
};

export const isLoggedIn = () => !!(getToken() && getUser());

export const parseSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  if (typeof skills !== 'string') return [];
  const trimmed = skills.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      return trimmed.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return trimmed.split(',').map(s => s.trim()).filter(Boolean);
};
