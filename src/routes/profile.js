const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateUpdate } = require("../util/validators/user.validator");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    return res.status(400).send("ERROR: " + error);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const allowedFieldsToEdit = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "about",
      "skills",
      "photoURL",
    ];

    const isRequestBodyValid = Object.keys(req.body).every((key) =>
      allowedFieldsToEdit.includes(key),
    );

    if (!isRequestBodyValid) {
      return res.status(400).send("Invalid Edit request");
    }

    const errors = validateUpdate(req.body);

    if (errors.length > 0) {
      return res.status(400).send(errors);
    } else {
      const loggedInUser = req.user;

      Object.keys(req.body).forEach(
        (key) => (loggedInUser[key] = req.body[key]),
      );
      await loggedInUser.save();

      return res.send("User Details Updated successfully!");
    }
  } catch (error) {
    return res.status(400).send("ERROR: " + error.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const acceptedFields = ["currentPassword", "newPassword"];
    const isValidRequest = Object.keys(req.body).every((key) =>
      acceptedFields.includes(key),
    );

    if (!isValidRequest) {
      return res.status(400).send("Invalid Request");
    } else {
      const user = req.user;
      const isCurrentPassowordCorrect = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );
      if (!isCurrentPassowordCorrect) {
        return res.status(400).send("Current Password is not correct");
      } else {
        const isNewPasswordStrong = validator.isStrongPassword(req.body.newPassword);
        if (!isNewPasswordStrong) {
          return res
            .status(400)
            .send(
              "New Password must be at least 8 chars, include upper, lower and number and symbol",
            );
        } else {
          const newPasswordHash = await bcrypt.hash(req.body.newPassword, 10);
          user.password = newPasswordHash;
          await user.save();
          return res.send("Password Updated Successfully!");
        }
      }
    }
  } catch (error) {
    return res.status(400).send("ERROR: " + error.message);
  }
});

module.exports = profileRouter;
