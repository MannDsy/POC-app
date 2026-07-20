const express = require("express");
const cors = require("cors");

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Running");
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