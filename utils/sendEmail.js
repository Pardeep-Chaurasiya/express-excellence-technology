const { createTransport } = require("nodemailer");

const resetPasswordMail = async (name, email, resetToken) => {
  try {
    const transporter = createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: process.env.emailUser,
        pass: process.env.emailPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const mailOptions = {
      from: process.env.emailUser,
      to: email,
      subject: "For reset password",
      html: `Hii ${name}, Click the following link to reset your password: <a href="http://localhost:5000/verify-reset-password/${resetToken} "target=_blank> Click Here </a> and reset your password `,
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log(err.message);
        return;
      }
      console.log("Email has been sent :- ", info.response);
      transporter.close();
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = resetPasswordMail;
