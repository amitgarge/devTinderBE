const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (password) =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) &&
  /\d/.test(password) &&
  !/\s/.test(password);

const validateSignup = (data) => {
  const errors = [];

  if (!data.firstName || data.firstName.length < 2) {
    errors.push("First name must be at least 2 characters");
  }

  if (!data.lastName || data.lastName.length < 2) {
    errors.push("Last name must be at least 2 characters");
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push("Invalid email format");
  }

  if (!data.password || !isStrongPassword(data.password)) {
    errors.push(
      "Password must be at least 8 chars, include upper, lower and number"
    );
  }

  if (!Number.isInteger(data.age) || data.age < 18) {
    errors.push("Age must be a number and at least 18");
  }

  if (!["male", "female", "others"].includes(data.gender)) {
    errors.push("Invalid gender value");
  }

  if (!Array.isArray(data.skills) || data.skills.length === 0) {
    errors.push("Atleast one skill is required");
  }

  return errors;
};

const validateUpdate = (data) => {
  const errors = [];

  if (data.age && (!Number.isInteger(data.age) || data.age < 18)) {
    errors.push("Age must be a number and at least 18");
  }

  if (data.gender && !["male", "female", "others"].includes(data.gender)) {
    errors.push("Invalid gender value");
  }

  if (data.skills && !Array.isArray(data.skills)) {
    errors.push("Skills must be an array");
  }

  return errors;
};

module.exports = {
  validateSignup,
  validateUpdate,
};
