const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

app.use(bodyParser.json());

app.listen(port, () => {
    console.log('Server running at.....4000');
});

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "postgres",
    database: "node",
    port: 5432,   //default port number
});

// Create the table if it does not exist
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log("Connection to PostgreSQL database was successful.......");

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

// GET all employees
app.get("/employees", (req, res) => {
    const query = "SELECT * FROM employees";
    pool.query(query, (err, result) => {
        if (err) {
            return res.status(500).send('Error executing query: ' + err.stack);
        }
        res.send(result.rows);
    });
});

// GET a particular employee by ID
app.get("/employee/:id", (req, res) => {
    const employeeId = req.params.id;
    const query = "SELECT * FROM employees WHERE id = $1";
    pool.query(query, [employeeId], (err, result) => {
        if (err) {
            return res.status(500).send('Error executing query: ' + err.stack);
        }
        if (result.rows.length === 0) {
            return res.status(404).send('Employee not found');
        }
        res.send(result.rows[0]);
    });
});

// CREATE a new employee
app.post("/employee", (req, res) => {
    const { name, age, department } = req.body;
    const query = "INSERT INTO employees (name, age, department) VALUES ($1, $2, $3) RETURNING *";
    pool.query(query, [name, age, department], (err, result) => {
        if (err) {
            return res.status(500).send('Error executing query: ' + err.stack);
        }
        res.status(201).send(result.rows[0]);
    });
});

// UPDATE an employee by ID
app.put("/employee/:id", (req, res) => {
    const employeeId = req.params.id;
    const { name, age, department } = req.body;
    const query = "UPDATE employees SET name = $1, age = $2, department = $3 WHERE id = $4 RETURNING *";
    pool.query(query, [name, age, department, employeeId], (err, result) => {
        if (err) {
            return res.status(500).send('Error executing query: ' + err.stack);
        }
        if (result.rows.length === 0) {
            return res.status(404).send('Employee not found');
        }
        res.send(result.rows[0]);
    });
});

// DELETE an employee by ID
app.delete("/employee/:id", (req, res) => {
    const employeeId = req.params.id;
    const query = "DELETE FROM employees WHERE id = $1 RETURNING *";
    pool.query(query, [employeeId], (err, result) => {
        if (err) {
            return res.status(500).send('Error executing query: ' + err.stack);
        }
        if (result.rows.length === 0) {
            return res.status(404).send('Employee not found');
        }
        res.send({ message: 'Employee deleted successfully' });
    });
});
