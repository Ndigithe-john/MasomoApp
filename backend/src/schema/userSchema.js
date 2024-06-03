const joi = require("joi");

const signup_schema = joi
  .object({
    FullName: joi.string().required(),
    Email: joi.string().required(),
    PhoneNumber: joi.number().required(),
    Password: joi.string().required(),
    C_password: joi.ref("Password"),
  })
  .with("Password", "C_password");

const login_schema = joi.object({
  Email: joi.string().required(),
  Password: joi.string().required(),
});
const forgot_password_schema = joi.object({
  Email: joi.required(),
});
const reset_password_schema = joi
  .object({
    newPassword: joi.string().required(),
    confirmNewPassword: joi.ref("newPassword"),
  })
  .with("newPassword", "confirmNewPassword");
module.exports = {
  signup_schema,
  login_schema,
  forgot_password_schema,
  reset_password_schema,
};
