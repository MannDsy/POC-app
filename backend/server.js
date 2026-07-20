
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "prasham1504@gmail.com",
    pass: "ihmrbflzxsnhemid",
  },
});
function generateOTP() {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
}
app.get("/", (req, res) => {
  res.send("Backend Running");
});
app.post("/send-otp", async (req, res) => {

  const { email } = req.body;

  const otp = generateOTP();

  db.run(
    `
    INSERT INTO otp_verification
    (
      email,
      otp
    )
    VALUES (?,?)
    `,
    [email, otp]
  );

  await transporter.sendMail({
    from: "prasham1504@gmail.com",
    to: email,
    subject: "Interview Management OTP",
    html: `
      <h2>OTP Verification</h2>
      <p>Your OTP is</p>
      <h1>${otp}</h1>
    `,
  });

  res.json({
    success: true,
    message: "OTP Sent Successfully",
  });

});

app.post("/verify-otp", (req, res) => {

  const { email, otp } = req.body;

  db.get(
    `
    SELECT *
    FROM otp_verification
    WHERE email = ?
    ORDER BY id DESC
    LIMIT 1
    `,

    [email],

    (err, row) => {

      if (!row) {

        return res.json({
          success: false,
          message: "OTP Not Found"
        });
      }

      if (row.otp === otp) {

        return res.json({
          success: true,
          message: "Login Successful"
        });
      }

      return res.json({
        success: false,
        message: "Invalid OTP"
      });
    }
  );
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Mail Error:", error);
  } else {
    console.log("Mail Server Ready");
  }
});