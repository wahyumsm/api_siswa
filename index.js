const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

const { Client } = require("pg");
const bodyParser = require("body-parser");

// KONEKSI KE DATABASE POSTGRESQL
const client = new Client({
  user: "postgres", // Ganti dengan username PostgreSQL Anda
  host: "localhost",
  database: "apisiswa", // Ganti dengan nama database PostgreSQL Anda
  password: "wahyu123", // Ganti dengan password PostgreSQL Anda
  port: 5432, // Port default PostgreSQL
});

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error", err));

app.use(cors());
// MENAMPILKAN DATA DARI DATABASE POSTGRESQL
app.get("/api_siswa", (req, res) => {
  let responseData = {};

  client.query("SELECT * FROM api_siswa", (err, result) => {
    if (err) {
      console.error("Error executing query for api_siswa:", err);
      responseData.api_siswa;
    } else {
      responseData.api_siswa = result.rows;
    }

    client.query("SELECT * FROM dataorangtua", (err, result) => {
      if (err) {
        console.error("Error executing query for dataorangtua:", err);
        responseData.dataorangtua;
      } else {
        responseData.dataorangtua = result.rows;
      }

      return res.status(200).json({
        status: true,
        message: "Data api yang diambil",
        dataorangtua: responseData,
      });
    });
  });
});

// MENANGANI PERMINTAAN POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/api_siswa", async (req, res) => {
  try {
    const { nama, alamat, status } = req.body;
    console.log("Data yang diterima:", { nama, alamat, status }); // Tambahkan logging di sini

    // Eksekusi kueri INSERT ke database menggunakan parameterized query
    const query =
      "INSERT INTO api_siswa (nama, alamat, status) VALUES ($1, $2, $3)";
    await client.query(query, [nama, alamat, status]);

    // Tanggapi permintaan dengan status 201 Created jika berhasil
    res.status(201).json({
      status: true,
      message: "Data berhasil ditambahkan",
      data: { nama, alamat, status },
    });
  } catch (error) {
    // Tanggapi permintaan dengan status 500 Internal Server Error jika terjadi kesalahan
    console.error("Error:", error); // Tambahkan logging untuk pesan kesalahan
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Aplikasi express berjalan di http://localhost:${port}`);
});
