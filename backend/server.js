const session = require("express-session");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const db = require("./db");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(
  session({
    secret: "interview-monitoring-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 5 * 60 * 1000
    }
  })
);
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
app.post("/send-otp", (req, res) => {

  const { email } = req.body;

  db.get(
    `
    SELECT *
    FROM employees
    WHERE email = ?
    `,
    [email],

    async (err, employee) => {

      // Database error
      if (err) {

        return res.status(500).json({
          success: false,
          message: "Database Error"
        });
      }

      // Employee not found
      if (!employee) {

        return res.status(404).json({
          success: false,
          message:
            "Employee does not exist"
        });
      }

      // Employee inactive
      if (employee.isActive !== 1) {

        return res.status(403).json({
          success: false,
          message:
            "Your account is inactive. Please contact administrator."
        });
      }

      try {

        const otp = generateOTP();

       req.session.otp = otp;
       req.session.email = email;
       req.session.createdAt = Date.now();

        await transporter.sendMail({
          from: "prasham1504@gmail.com",
          to: email,
          subject:
            "Interview Management OTP",

          html: `
            <h2>OTP Verification</h2>

            <p>Your OTP is:</p>

            <h1>${otp}</h1>
          `
        });

        return res.json({
          success: true,
          message:
            "OTP Sent Successfully"
        });

      } catch (error) {

        console.error(error);

        return res.status(500).json({
          success: false,
          message:
            "Failed to send OTP"
        });
      }

    }
  );
});


app.post("/verify-otp", (req, res) => {

  const { email, otp } = req.body;

  if (!req.session.otp) {
    return res.status(400).json({
      success: false,
      message: "OTP session expired"
    });
  }

  if (req.session.email !== email) {
    return res.status(400).json({
      success: false,
      message: "Email mismatch"
    });
  }

  const otpAge =
    Date.now() - req.session.createdAt;

  if (otpAge > 5 * 60 * 1000) {

    return res.status(400).json({
      success: false,
      message: "OTP Expired"
    });

  }

  if (req.session.otp !== otp) {

    return res.status(400).json({
      success: false,
      message: "Invalid OTP"
    });

  }

  req.session.user = email;

  delete req.session.otp;

  return res.json({
    success: true,
    message: "Login Successful"
  });

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