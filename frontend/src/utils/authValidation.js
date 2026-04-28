export const sanitizeEmailInput = (value = "") => value.replace(/\s/g, "");

export const sanitizeNameInput = (value = "") =>
  value
    .replace(/[^A-Za-z ]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^ /, "");

export const sanitizePasswordInput = (value = "") => value.replace(/\s/g, "");

export const validateEmail = (value) => {
  const trimmed = value.trim();

  if (!trimmed) return "Email is required.";
  if (/\s/.test(value)) return "Email must not contain blank spaces.";
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed)) {
    return "Please enter a valid email address.";
  }

  return "";
};

export const validateName = (label, value) => {
  const trimmed = value.trim();

  if (!trimmed) return `${label} is required.`;
  if (trimmed.length < 2) return `${label} must be at least 2 characters long.`;
  if (trimmed.length > 15) return `${label} must not exceed 15 characters.`;
  if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(trimmed)) {
    return `${label} must contain only letters and single spaces.`;
  }

  return "";
};

export const validatePassword = (value, fieldLabel = "Password") => {
  if (!value) return `${fieldLabel} is required.`;
  if (/\s/.test(value)) return `${fieldLabel} must not contain spaces.`;
  if (value.length < 6) return `${fieldLabel} must be at least 6 characters long.`;
  if (value.length > 15) return `${fieldLabel} must not exceed 15 characters.`;

  return "";
};
