
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

// for home page
app.get("/api/users/profile", (req, res) => {
  const userEmail = req.query.email;

  // Ensure the frontend sent an identifier
  if (!userEmail) {
    return res.status(400).json({ 
      message: "Email parameter is required to identify the user and load the menu items." 
    });
  }
  const query = `SELECT id, gid, name, email, isActive, isAdmin FROM employees WHERE email = ?`;
  db.get(query, [userEmail], (err, row) => {
    if (err) {
      return res.status(500).json({ 
        message: "Failed to query the employees table.", 
        error: err.message 
      });
    }
    
    // employee exists or not
    if (!row) {
      return res.status(404).json({ 
        message: "No employee found matching that email address." 
      });
    }

    // isActive or not
    if (row.isActive === 0) {
      return res.status(403).json({ 
        message: "Access blocked. This employee account is currently marked as inactive." 
      });
    }
    const employeeProfile = {
      id: row.id,
      gid: row.gid,
      name: row.name,
      email: row.email,
      role: row.isAdmin === 1 ? "admin" : "normal_user"
    };
    return res.json(employeeProfile);
  });
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