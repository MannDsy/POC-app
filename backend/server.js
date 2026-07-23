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
    rolling: true, 
    cookie: {
      maxAge: 60 * 60 * 1000
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

// ---- Ensure the interviews table exists (creates it once, no-op after that) ----
db.run(`
  CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_phone TEXT,
    primary_skill TEXT NOT NULL,
    secondary_skill TEXT,
    interviewer_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_at TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error("Failed to ensure interviews table exists:", err.message);
  } else {
    console.log("interviews table ready");
  }
});

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

  // const otp = generateOTP();
  const otp = "12345"; // TEMP: hardcoded for testing, revert to generateOTP() later

 req.session.otp = otp;
 req.session.email = email;
 req.session.createdAt = Date.now();

  // await transporter.sendMail({
  //   from: "prasham1504@gmail.com",
  //   to: email,
  //   subject:
  //     "Interview Management OTP",

  //   html: `
  //     <h2>OTP Verification</h2>

  //     <p>Your OTP is:</p>

  //     <h1>${otp}</h1>
  //   `
  // });

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

// ---- Start Interview: create a new interview record ----
app.post("/api/interviews", (req, res) => {
  const {
    candidateName,
    candidateEmail,
    candidatePhone,
    primarySkill,
    secondarySkill,
  } = req.body;

  // Basic required-field validation (mirrors the frontend's `required` fields)
  if (!candidateName || !candidateEmail || !primarySkill) {
    return res.status(400).json({
      success: false,
      message: "Candidate name, candidate email, and primary skill are required.",
    });
  }

  // Only a logged-in employee (interviewer) can start an interview
  const interviewerEmail = req.session.user;
  if (!interviewerEmail) {
    return res.status(401).json({
      success: false,
      message: "You must be logged in to start an interview.",
    });
  }

  const insertQuery = `
    INSERT INTO interviews
      (candidate_name, candidate_email, candidate_phone, primary_skill, secondary_skill, interviewer_email, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    insertQuery,
    [
      candidateName,
      candidateEmail,
      candidatePhone || null,
      primarySkill,
      secondarySkill || null,
      interviewerEmail,
      new Date().toISOString(),
    ],
    function (err) {
      if (err) {
        console.error("Failed to create interview:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create interview record.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Interview created successfully.",
        interviewId: this.lastID,
      });
    }
  );
});

// ---- Optional: list interviews (handy for a future "My Assigned Tasks" view) ----
app.get("/api/interviews", (req, res) => {
  const interviewerEmail = req.session.user;
  if (!interviewerEmail) {
    return res.status(401).json({
      success: false,
      message: "You must be logged in to view interviews.",
    });
  }

  db.all(
    `SELECT * FROM interviews WHERE interviewer_email = ? ORDER BY created_at DESC`,
    [interviewerEmail],
    (err, rows) => {
      if (err) {
        console.error("Failed to fetch interviews:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch interviews.",
        });
      }
      return res.json({ success: true, interviews: rows });
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