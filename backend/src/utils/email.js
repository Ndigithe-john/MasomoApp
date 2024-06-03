const nodemailer = require("nodemailer");
require("dotenv").config();
const email_config = require("../config/emailConfig");

const sendMail = async (options) => {
  //Create a transpoter
  const transpoter = nodemailer.createTransport(email_config);

  //Define the email
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //Send the email
  await transpoter.sendMail(mailOptions);
};
module.exports = sendMail;
