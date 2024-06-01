const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 4000;

app.listen(port, () => {
    console.log('Server running at.....4000');
});

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "postergres",
    database: "node",
    port: 5432,   //default port number
});

//Create the table...

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log("Connection to PostgreSQL database was successful.......");

    // Create table if it does not exist
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS employees (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50),
            age INT,
            department VARCHAR(50)
        )
    `;
    client.query(createTableQuery, (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log("Table created or verified successfully.");
    });
});
//GET all employees
app.get("/", (req, res) => {
    let data = "SELECT * FROM employees"; // Use the correct table name here
    pool.query(data, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result.rows);
    });
});

//GET particular employees
app.get("/employee/:id", (req, res) => {
    const employeeId = req.params.id;
    console.log("id: " + employeeId);

    const sql = "SELECT * FROM employees WHERE id = $1";
    pool.query(sql, [employeeId], (err, result) => {
        if (err) {
            return res.status(500).send('Error executing query: ' + err.stack);
        }
        if (result.rows.length === 0) {
            return res.status(404).send('Employee not found');
        }
        res.send(result.rows[0]);
    });
});
