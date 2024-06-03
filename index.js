const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("./koneksi");

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const secretKey = "your_secret_key";

// Middleware autentikasi
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res
      .status(401)
      .json({ message: "Akses ditolak karena token tidak ada" });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    req.user = user;
    next();
  });
}

// Rute untuk login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await client.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Username atau password salah" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      secretKey,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/api_siswa", authenticateToken, (req, res) => {
  client.query("SELECT * FROM api_siswa", (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      res.status(200).json(result.rows);
    }
  });
});

app.post("/api_siswa", authenticateToken, async (req, res) => {
  try {
    const { nama, alamat, status } = req.body;
    const query =
      "INSERT INTO api_siswa (nama, alamat, status) VALUES ($1, $2, $3)";
    await client.query(query, [nama, alamat, status]);
    res.status(201).json({ message: "Data berhasil ditambahkan" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/api_siswa/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, alamat, status } = req.body;
    const query =
      "UPDATE api_siswa SET nama = $1, alamat = $2, status = $3 WHERE id = $4";
    await client.query(query, [nama, alamat, status, id]);
    res.status(200).json({ message: "Data berhasil diupdate" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/api_siswa/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const query = "DELETE FROM api_siswa WHERE id = $1";
    await client.query(query, [id]);
    res.status(200).json({ message: "Data berhasil dihapus" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
