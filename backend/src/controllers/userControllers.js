const bcrypt = require("bcrypt");
const AppError = require("../utils/appError");
const User = require("../utils/getUserByEmail");
const crypto = require("crypto");
const sendMail = require("../utils/email");
const { format, addHours } = require("date-fns");
const {
  signupValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  loginValidator,
} = require("../validators/userValidators");
async function createAccount(req, res, next) {
  try {
    const { pool } = req;
    const create_user_body = req.body;
    const { FullName, Email, PhoneNumber, Password } = create_user_body;
    const hashed_password = await bcrypt.hash(Password, 8);
    signupValidator(create_user_body);
    if (pool._connected) {
      const new_user = await pool.query(
        "INSERT INTO Users (FullName, Email, PhoneNumber, Password) VALUES ($1, $2, $3, $4) RETURNING *",
        [FullName, Email, PhoneNumber, hashed_password]
      );
      if (new_user) {
        res.status(200).json({
          status: true,
          message: "User created successfully",
        });
      }
    } else {
      return next(new AppError("Error connecting to the database", 500));
    }
  } catch (error) {
    console.log(error);
    return next(new AppError(error.message, 500));
  }
}
async function login(req, res, next) {
  try {
    const { pool } = req;
    const login_body = req.body;
    const { Email, Password } = login_body;
    loginValidator(login_body);
    let user = await User(Email, pool);
    if (user) {
      let password_match = await bcrypt.compare(Password, user.password);
      if (password_match) {
        req.session.authorized = true;
        req.session.user = user;
        res.status(200).json({
          status: true,
          message: "logged in successfully",
        });
      } else {
        return next(new AppError("Incorrect Email or password", 401));
      }
    } else {
      return next(
        new AppError("User Not found! Please sign up to continue", 401)
      );
    }
  } catch (error) {
    console.log(error.message);
    return next(new AppError(`Error Loging in: ${error.message}`, 500));
  }
}
async function forgotPassword(req, res, next) {
  try {
    const { Email } = req.body;
    forgotPasswordValidator(req.body);
    const { pool } = req;
    const resetToken = crypto.randomBytes(32).toString("hex");
    const currentTime = format(addHours(new Date(), 1), "yyyyMMddHHmmss");
    console.log(currentTime);
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const query = `
    UPDATE Users
    SET "resetpasswordtoken" = $1,
    "resetpasswordexpires" = $2
    WHERE "email" = $3;
    `;
    const values = [hashedResetToken, currentTime, Email];
    const { rowCount } = await pool.query(query, values);

    if (rowCount > 0) {
      const resetURL = `${req.get("host")}/resetPassword/${resetToken}`;
      const message = `Forgot your password? Submit a PATCH request with the new password and passwordConfirm to ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

      await sendMail({
        email: Email,
        subject: "Password Reset Prompt",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email",
      });
    } else {
      return next(
        new AppError(
          "There was an error sending the email. Try again later",
          500
        )
      );
    }
  } catch (error) {
    console.log(error);
    return next(new AppError(error.message, 500));
  }
}
async function resetPassword(req, res, next) {
  try {
    const { pool } = req;

    const reset_body = req.body;
    resetPasswordValidator(reset_body);
    const { newPassword } = reset_body;
    const currentDate = format(new Date(), "yyyyMMddHHmmss");
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    let hashed_password = await bcrypt.hash(newPassword, 8);
    const query = `
    SELECT * 
   FROM Users 
    WHERE resetpasswordtoken =$1
  `;
    const result = await pool.query(query, [hashedToken]);
    if (result.rows.length === 0) {
      return next(new AppError("Invalid token"), 400);
    }
    const user = result.rows[0];
    console.log(user);
    const resetPasswordExpires = user.resetpasswordexpires;

    if (resetPasswordExpires < currentDate) {
      return next(new AppError("Token has expired"), 400);
    }
    const updateQuery = `
      UPDATE Users
      SET password =$1,
          resetpasswordtoken = $2,
          resetpasswordexpires = $3
      WHERE UserId = $4;`;
    const updateResults = await pool.query(updateQuery, [
      hashed_password,
      null,
      null,
      user.userid,
    ]);

    if (updateResults.rowCount === 0) {
      return next(new AppError("Error updating password", 500));
    }
    res.status(200).json({
      status: "success",
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);
    return next(new AppError(error.message, 500));
  }
}
async function logout(req, res, next) {
  try {
    const user = req.session.user;
    if (user) {
      req.session.destroy();
      return next(new AppError("Logged out successfully", 200));
    } else {
      return next(new AppError("login to continue", 401));
    }
  } catch (error) {
    console.log(error);
    return next(new AppError(error.message, 500));
  }
}

module.exports = {
  createAccount,
  login,
  forgotPassword,
  resetPassword,
  logout,
};
