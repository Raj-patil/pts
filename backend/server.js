const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Middleware for logging
app.use((req, res, next) => {
    const log = `[${new Date().toISOString()}] ${req.method} ${req.url} ${req.method === 'POST' ? JSON.stringify(req.body) : ''}\n`;
    fs.appendFileSync('server.log', log);
    console.log(log);
    next();
});

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.error('CRITICAL: Database connection failed:', err.message);
    } else {
        console.log('SUCCESS: Connected to MySQL database');
    }
});

// Health check
app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working', routes: ['/api/ping', '/api/test', '/api/tins', '/api/register', '/api/login'] });
});

// Routes
app.post('/api/register', (req, res) => {
    console.log('Registering user:', req.body.email);
    const { name, email, password } = req.body;
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, password], (err, result) => {
        if (err) {
            console.error('Registration Error:', err.message);
            return res.status(500).json({ error: err.message || 'Fails to register user' });
        }
        console.log('User registered successfully');
        res.status(201).json({ message: 'User registered successfully', id: result.insertId });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Login error' });
        }
        if (results.length > 0) {
            res.status(200).json({ message: 'Login successful', user: results[0] });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    });
});

app.get('/api/users', (req, res) => {
    const query = 'SELECT id, name, email FROM users';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error fetching users' });
        }
        res.status(200).json(results);
    });
});

// Tin Routes
app.get('/api/tins', (req, res) => {
    const { name, tin_type } = req.query;
    console.log('[DEBUG] GET /api/tins params:', req.query);
    let query = 'SELECT * FROM tins';
    const params = [];

    if (name && tin_type) {
        query += ' WHERE name = ? AND tin_type = ?';
        params.push(name, tin_type);
    } else if (name) {
        query += ' WHERE name = ?';
        params.push(name);
    } else if (tin_type) {
        query += ' WHERE tin_type = ?';
        params.push(tin_type);
    }
    
    query += ' ORDER BY id DESC';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('[DEBUG] Error fetching tins:', err.message);
            if (err.code === 'ER_NO_SUCH_TABLE') {
                return res.status(200).json([]);
            }
            return res.status(500).json({ error: 'Error fetching tins' });
        }
        console.log('[DEBUG] Tins fetched count:', results.length);
        res.status(200).json(results);
    });
});

app.post('/api/tins', (req, res) => {
    // 1. Explicitly log exactly what the frontend is sending
    console.log('[DEBUG] POST /api/tins Body:', req.body);

    const { 
        name, 
        quantity, 
        price, 
        total_amount, 
        status, 
        entry_date 
    } = req.body;
    
    // Capture the type - prioritize 'tin_type' which we set in the frontend
    const tin_type = req.body.tin_type || req.body.tinType || 'Not Selected';

    // 2. Pure schema without the "Standard" default to prevent hidden errors
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS tins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            tin_type VARCHAR(255) NOT NULL,
            quantity DECIMAL(10, 2) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            total_amount DECIMAL(10, 2) NOT NULL,
            status ENUM('Cash in', 'Cash out') NOT NULL,
            entry_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('[DB ERROR] Schema check failed:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        // 3. Explicitly mapped INSERT to ensure data goes to correct columns
        const insertQuery = `
            INSERT INTO tins (name, tin_type, quantity, price, total_amount, status, entry_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [name, tin_type, quantity, price, total_amount, status, entry_date];
        
        db.query(insertQuery, values, (err, result) => {
            if (err) {
                console.error('[DB ERROR] Insert failed:', err.message);
                return res.status(500).json({ error: 'Error saving data' });
            }
            console.log(`[SUCCESS] Registered: ${tin_type} for ${name}`);
            res.status(201).json({ message: 'Entry saved successfully', id: result.insertId });
        });
    });
});


// Expenses Routes
app.get('/api/expenses', (req, res) => {
    const query = 'SELECT * FROM expenses ORDER BY expense_date DESC, id DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('[DATABASE ERROR] Fetch expenses failed:', err.message);
            if (err.code === 'ER_NO_SUCH_TABLE') return res.json([]);
            return res.status(500).json({ error: 'Error fetching expenses' });
        }
        res.json(results);
    });
});

app.get('/api/revenue', (req, res) => {
    const tinsQuery = 'SELECT id, name, tin_type, quantity, price, total_amount as amount, status, entry_date as date, "tin" as type FROM tins';
    const expensesQuery = 'SELECT id, paid_to as name, "Expense" as tin_type, 1 as quantity, amount, amount, "Debit" as status, expense_date as date, "expense" as type FROM expenses';
    
    // Query for last 7 days trend
    const trendQuery = `
        SELECT 
            date_list.date,
            COALESCE(SUM(CASE WHEN t.status = 'Cash in' THEN t.total_amount ELSE 0 END), 0) as credit,
            COALESCE(SUM(CASE WHEN t.status = 'Cash out' THEN t.total_amount ELSE 0 END), 0) + 
            COALESCE((SELECT SUM(amount) FROM expenses WHERE expense_date = date_list.date), 0) as debit
        FROM (
            SELECT CURDATE() as date
            UNION SELECT DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            UNION SELECT DATE_SUB(CURDATE(), INTERVAL 2 DAY)
            UNION SELECT DATE_SUB(CURDATE(), INTERVAL 3 DAY)
            UNION SELECT DATE_SUB(CURDATE(), INTERVAL 4 DAY)
            UNION SELECT DATE_SUB(CURDATE(), INTERVAL 5 DAY)
            UNION SELECT DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        ) as date_list
        LEFT JOIN tins t ON t.entry_date = date_list.date
        GROUP BY date_list.date
        ORDER BY date_list.date ASC
    `;

    db.query(tinsQuery, (err, tinsResults) => {
        if (err) {
            console.error('[DB ERROR] Revenue (tins) failed:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        db.query(expensesQuery, (err, expensesResults) => {
            if (err) {
                console.error('[DB ERROR] Revenue (expenses) failed:', err.message);
                return res.status(500).json({ error: 'Database error' });
            }

            db.query(trendQuery, (err, trendResults) => {
                if (err) {
                    console.error('[DB ERROR] Revenue (trend) failed:', err.message);
                    return res.status(500).json({ error: 'Database error' });
                }

                let credited = 0;
                let tinsDebited = 0;
                let expensesTotal = 0;

                const creditedData = [];
                const debitedData = [];

                // Process Tins
                tinsResults.forEach(row => {
                    const amt = parseFloat(row.amount || 0);
                    const item = { ...row, amount: amt };

                    if (row.status === 'Cash in') {
                        credited += amt;
                        creditedData.push(item);
                    } else if (row.status === 'Cash out') {
                        tinsDebited += amt;
                        debitedData.push(item);
                    }
                });

                // Process Expenses
                expensesResults.forEach(row => {
                    const amt = parseFloat(row.amount || 0);
                    expensesTotal += amt;
                    debitedData.push({ ...row, amount: amt });
                });

                // Sort data by date descending
                const sortByDate = (a, b) => new Date(b.date) - new Date(a.date);
                creditedData.sort(sortByDate);
                debitedData.sort(sortByDate);

                res.json({
                    total_revenue: credited,
                    credited: credited,
                    debited: tinsDebited + expensesTotal,
                    credited_data: creditedData,
                    debited_data: debitedData,
                    daily_trends: trendResults
                });
            });
        });
    });
});

app.post('/api/expenses', (req, res) => {
    const { expense_date, paid_to, amount } = req.body;
    console.log('[DEBUG] POST /api/expenses:', req.body);

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            expense_date DATE NOT NULL,
            paid_to VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(createTableQuery, (err) => {
        if (err) {
            console.error('[DB ERROR] Expenses table check failed:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        const insertQuery = 'INSERT INTO expenses (expense_date, paid_to, amount) VALUES (?, ?, ?)';
        db.query(insertQuery, [expense_date, paid_to, amount], (err, result) => {
            if (err) {
                console.error('[DB ERROR] Expense insert failed:', err.message);
                return res.status(500).json({ error: 'Error saving entry' });
            }
            res.status(201).json({ message: 'Expense saved successfully', id: result.insertId });
        });
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is definitely running on http://0.0.0.0:${port}`);
    console.log('Available routes: /api/ping, /api/test, /api/tins, /api/expenses');
});
