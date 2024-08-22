const express = require("express");
const Vehicle = require("./models/vehicle.js");
const { Sequelize, Model } = require("sequelize");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// Load configuration from the correct path
const configPath = path.join(__dirname, "config", "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

if (!dbConfig.dialect) {
  throw new Error("Dialect needs to be explicitly supplied in the config.");
}

const sequelize = new Sequelize("", dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
});

sequelize
  .query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database};`)
  .then(() => {
    console.log(`Database "${dbConfig.database}" created or already exists.`);

    const db_connection = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
      }
    );

    return db_connection.sync();

    // Define route after database sync
    app.get("/vehicle", async (req, res) => {
      try {
        const vehicle = await Vehicle.create({
          model: "Tesla",
          horsepower: 900,
          price: 25000,
        });
        res.status(201).json(vehicle);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
    // Start the server
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });
