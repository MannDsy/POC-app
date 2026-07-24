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
    rolling: true, // resets the maxAge countdown on every authenticated request, instead of a fixed 5-min window from login
    cookie: {
      maxAge: 60 * 60 * 1000 // 1 hour (was 5 minutes) - more realistic for actually using the app
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

// ---- Canonical skill list, used to seed the skills table ----
const SKILL_LIST = [
  'C', 'C++', 'Embedded C', 'Python', 'Rust', 'Java', 'JavaScript', 'TypeScript', 'Go',
  'Zephyr RTOS', 'FreeRTOS', 'RTOS', 'Embedded Linux', 'Linux', 'Yocto', 'Buildroot',
  'Bare Metal Programming', 'Firmware Development', 'Device Drivers', 'Bootloader Development', 'U-Boot',
  'ARM Cortex-M', 'ARM Cortex-A', 'STM32', 'ESP32', 'AVR', 'PIC', 'MSP430',
  'Raspberry Pi', 'BeagleBone', 'NXP', 'Nordic nRF', 'TI Microcontrollers',
  'Embedded Systems', 'Digital Electronics', 'Analog Electronics', 'PCB Design', 'Circuit Design',
  'Hardware Debugging', 'Oscilloscope', 'Logic Analyzer', 'JTAG', 'UART', 'SPI', 'I2C', 'CAN',
  'USB', 'Ethernet', 'GPIO', 'PWM', 'ADC/DAC', 'FPGA', 'Verilog', 'VHDL',
  'Internet of Things (IoT)', 'MQTT', 'CoAP', 'BLE', 'Bluetooth', 'Wi-Fi', 'Zigbee', 'LoRa', 'NB-IoT', 'Matter',
  'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Computer Vision',
  'Natural Language Processing', 'Generative AI', 'Large Language Models (LLMs)',
  'Prompt Engineering', 'Retrieval-Augmented Generation (RAG)', 'AI Agents',
  'Edge AI', 'TinyML', 'TensorFlow Lite', 'TensorFlow Lite Micro', 'ONNX Runtime', 'OpenVINO',
  'NVIDIA Jetson', 'Google Coral', 'Qualcomm AI', 'Model Optimization',
  'Data Science', 'Data Analytics', 'Data Engineering', 'Data Visualization', 'Pandas', 'NumPy',
  'Scikit-learn', 'Matplotlib', 'OpenCV', 'PyTorch', 'TensorFlow', 'Keras',
  'AWS', 'Azure', 'Google Cloud Platform', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'GitLab',
  'Jenkins', 'CI/CD', 'Bash', 'Shell Scripting',
  'React', 'Node.js', 'Express.js', 'Next.js', 'HTML', 'CSS',
  'SQL', 'MySQL', 'PostgreSQL', 'SQLite', 'MongoDB', 'Redis',
  'CMake', 'West', 'GDB', 'OpenOCD', 'VS Code', 'Visual Studio', 'Eclipse',
  'Keil uVision', 'IAR Embedded Workbench', 'PlatformIO',
  'Unit Testing', 'Integration Testing', 'Hardware-in-the-Loop (HIL)', 'Static Code Analysis',
];

// ---- Ensure the skills table exists and is seeded ----
db.run(`
  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`, (err) => {
  if (err) {
    console.error("Failed to ensure skills table exists:", err.message);
    return;
  }
  const insertStmt = db.prepare(`INSERT OR IGNORE INTO skills (name) VALUES (?)`);
  SKILL_LIST.forEach((skillName) => {
    insertStmt.run(skillName);
  });
  insertStmt.finalize(() => {
    console.log("skills table ready and seeded");
  });
});

// ---- Ensure the experience_ranges table exists and is seeded ----
const EXPERIENCE_RANGES = [
  '0-1',
  '1-3',
  '3-6',
  '6-9',
  '10-12',
  '13-15',
  'More than 15',
];

db.run(`
  CREATE TABLE IF NOT EXISTS experience_ranges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL
  )
`, (err) => {
  if (err) {
    console.error("Failed to ensure experience_ranges table exists:", err.message);
    return;
  }
  const insertStmt = db.prepare(`INSERT OR IGNORE INTO experience_ranges (label, sort_order) VALUES (?, ?)`);
  EXPERIENCE_RANGES.forEach((label, index) => {
    insertStmt.run(label, index);
  });
  insertStmt.finalize(() => {
    console.log("experience_ranges table ready and seeded");
  });
});

// ---- Ensure the interviews table exists (creates it once, no-op after that) ----
// primary_skills / secondary_skills store a JSON array of skill names,
// e.g. '["Python","FreeRTOS"]', so more than one skill can be selected.
// experience_range stores a single label from experience_ranges, e.g. "3-6".
db.run(`
  CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_phone TEXT,
    primary_skills TEXT NOT NULL,
    secondary_skills TEXT,
    experience_range TEXT NOT NULL,
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


// ---- Ensure the employees table exists ----
db.run(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gid TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    isActive INTEGER NOT NULL DEFAULT 1,
    isAdmin INTEGER NOT NULL DEFAULT 0
  )
`, (err) => {
  if (err) {
    console.error("Failed to ensure employees table exists:", err.message);
  } else {
    console.log("employees table ready");
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

// ---- List all experience ranges (for the Years of Experience picker) ----
app.get("/api/experience-ranges", (req, res) => {
  db.all(`SELECT id, label FROM experience_ranges ORDER BY sort_order ASC`, [], (err, rows) => {
    if (err) {
      console.error("Failed to fetch experience ranges:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch experience ranges.",
      });
    }
    return res.json({ success: true, experienceRanges: rows });
  });
});

// ---- List all available skills (for the primary/secondary skill pickers) ----
app.get("/api/skills", (req, res) => {
  db.all(`SELECT id, name FROM skills ORDER BY name ASC`, [], (err, rows) => {
    if (err) {
      console.error("Failed to fetch skills:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch skills.",
      });
    }
    return res.json({ success: true, skills: rows });
  });
});

// ---- Start Interview: create a new interview record ----
app.post("/api/interviews", (req, res) => {
  const {
    candidateName,
    candidateEmail,
    candidatePhone,
    primarySkills,   // string[] - at least 1 required
    secondarySkills, // string[] - optional
    experienceRange, // string - required, e.g. "3-6"
  } = req.body;

  // Basic required-field validation (mirrors the frontend's `required` fields)
  if (!candidateName || !candidateEmail) {
    return res.status(400).json({
      success: false,
      message: "Candidate name and candidate email are required.",
    });
  }

  if (!Array.isArray(primarySkills) || primarySkills.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one primary skill must be selected.",
    });
  }

  if (!experienceRange) {
    return res.status(400).json({
      success: false,
      message: "Years of experience must be selected.",
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
      (candidate_name, candidate_email, candidate_phone, primary_skills, secondary_skills, experience_range, interviewer_email, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    insertQuery,
    [
      candidateName,
      candidateEmail,
      candidatePhone || null,
      JSON.stringify(primarySkills),
      Array.isArray(secondarySkills) && secondarySkills.length > 0
        ? JSON.stringify(secondarySkills)
        : null,
      experienceRange,
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
      const interviews = rows.map((row) => ({
        ...row,
        primary_skills: row.primary_skills ? JSON.parse(row.primary_skills) : [],
        secondary_skills: row.secondary_skills ? JSON.parse(row.secondary_skills) : [],
      }));

      return res.json({ success: true, interviews });
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


// ---- Upsert Employees/Interviewers Endpoint ----
app.post("/api/employees/upsert", (req, res) => {
  const employees = req.body;

  // 1. Array validation
  if (!Array.isArray(employees) || employees.length === 0) {
    return res.status(400).json({
      success: false,
      message: "An array with at least one employee record is required.",
    });
  }

  // 2. Format & Regex Validation
  const isNumericOnly = /^\d+$/;
  const isDomainValid = /^[a-zA-Z0-9._%+-]+@einfochips\.com$/i;

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const rowNum = i + 1;

    if (!emp.gid || !isNumericOnly.test(emp.gid.toString().trim())) {
      return res.status(400).json({
        success: false,
        message: `Row ${rowNum}: GID must contain numbers only.`,
      });
    }

    if (!emp.name || isNumericOnly.test(emp.name.toString().trim())) {
      return res.status(400).json({
        success: false,
        message: `Row ${rowNum}: Name cannot consist of numbers only.`,
      });
    }

    if (!emp.email || !isDomainValid.test(emp.email.toString().trim())) {
      return res.status(400).json({
        success: false,
        message: `Row ${rowNum}: Email must be a valid '@einfochips.com' address.`,
      });
    }
  }

  // 3. Database Execution
  const upsertQuery = `
    INSERT INTO employees (gid, name, email, isActive, isAdmin)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(gid) DO UPDATE SET
      name = excluded.name,
      email = excluded.email,
      isActive = excluded.isActive,
      isAdmin = excluded.isAdmin
  `;

  let completed = 0;
  let hasError = false;

  employees.forEach((emp) => {
    db.run(
      upsertQuery,
      [
        emp.gid.toString().trim(),
        emp.name.toString().trim(),
        emp.email.toString().trim().toLowerCase(),
        emp.isActive ?? 1,
        emp.isAdmin ?? 0,
      ],
      function (err) {
        if (hasError) return;

        if (err) {
          hasError = true;
          console.error("Database Insert/Update Error:", err.message);
          return res.status(500).json({
            success: false,
            message: `Database Error: ${err.message}`,
          });
        }

        completed++;
        if (completed === employees.length && !res.headersSent) {
          return res.status(200).json({
            success: true,
            message: "Panelist/User records updated successfully!",
          });
        }
      }
    );
  });
});