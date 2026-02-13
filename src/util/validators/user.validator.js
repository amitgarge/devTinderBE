const validator = require("validator");

const validateSignup = (data) => {
  const errors = [];

  if (!data.firstName || data.firstName.length < 2) {
    errors.push("First name must be at least 2 characters");
  }

  if (!data.lastName || data.lastName.length < 2) {
    errors.push("Last name must be at least 2 characters");
  }

  if (!data.email || !validator.isEmail(data.email)) {
    errors.push("Invalid email format");
  }

  if (!data.password || !validator.isStrongPassword(data.password)) {
    errors.push(
      "Password must be at least 8 chars, include upper, lower and number",
    );
  }

  if (data.age !== undefined) {
    const age = Number(data.age);
    if (!Number.isInteger(age) || age < 18) {
      errors.push("Age must be a number and at least 18");
    }
  }

  if (data.gender !== undefined) {
    const allowedGenders = ["male", "female", "others"];
    if (!allowedGenders.includes(data.gender)) {
      errors.push("Invalid gender value");
    }
  }

  if (data.skills !== undefined) {
    if (!Array.isArray(data.skills)) {
      errors.push("Skills must be an array");
    } else {
      const invalid = data.skills.some(
        (skill) => typeof skill !== "string" || !skill.trim(),
      );

      if (invalid) {
        errors.push("Each skill must be a non-empty string");
      }
    }
  }

  return errors;
};

const validateUpdate = (data) => {
  const errors = [];

  if (data.firstName && data.firstName.length < 2) {
    errors.push("First name must be at least 2 characters");
  }

  if (data.lastName && data.lastName.length < 2) {
    errors.push("Last name must be at least 2 characters");
  }

  if (data.age !== undefined) {
    // handle string numbers too
    const ageNum = typeof data.age === "string" ? Number(data.age) : data.age;
    if (!Number.isInteger(ageNum) || ageNum < 18) {
      errors.push("Age must be an integer and at least 18");
    }
  }

  if (data.gender && !["male", "female", "others"].includes(data.gender)) {
    errors.push("Invalid gender value");
  }

  if (data.skills && !Array.isArray(data.skills)) {
    errors.push("Skills must be an array");
  }

  if (data.photoURL && !validator.isURL(data.photoURL)) {
    errors.push("Enter a valid URL");
  }

  return errors;
};

module.exports = {
  validateSignup,
  validateUpdate,
};
