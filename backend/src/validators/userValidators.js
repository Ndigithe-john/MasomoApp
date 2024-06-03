const {
  signup_schema,
  login_schema,
  forgot_password_schema,
  reset_password_schema,
} = require("../schema/userSchema");

function signupValidator(body) {
  const createUser = signup_schema.validate(body, { abortEarly: false });
  if (createUser.error?.details.length) {
    let message = createUser.error.details.map((err) => err.message);
    throw new Error(message.join("\n"));
  }
  return createUser;
}
function loginValidator(body) {
  const user_login = login_schema.validate(body, { abortEarly: false });
  if (user_login.error?.details.length) {
    let message = user_login.error.details.map((err) => err.message);
    throw new Error(message.join("\n"));
  } else {
    return user_login;
  }
}

function forgotPasswordValidator(body) {
  const forgot_password = forgot_password_schema.validate(body, {
    abortEarly: false,
  });
  if (forgot_password.error?.details.length) {
    let message = forgot_password.error.details.map((err) => err.message);
    throw new Error(message.join("\n"));
  } else {
    return forgot_password;
  }
}

function resetPasswordValidator(body) {
  const reset_password = reset_password_schema.validate(body, {
    abortEarly: false,
  });
  if (reset_password.error?.details.length) {
    let message = reset_password.error.details.map((err) => err.message);
    throw new Error(message.join("\n"));
  }
  return reset_password;
}

module.exports = {
  signupValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  loginValidator,
};
