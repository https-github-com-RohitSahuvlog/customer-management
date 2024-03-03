const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();
const cors = require('cors');


const app = express();
app.use(cors());
const port = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
};

// Function to establish database connection
async function connectDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        return connection;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw error;
    }
}

// Function to generate dummy data
function generateDummyData() {
    const records = [];
    for (let i = 0; i < 50; i++) {
        const customerName = `Customer ${i + 1}`;
        const age = Math.floor(Math.random() * (80 - 18 + 1)) + 18;
        const phone = `123456789${i.toString().padStart(2, '0')}`;
        const location = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)];
        records.push({ customerName, age, phone, location });
    }
    return records;
}

// Endpoint to create 50 records with dummy data
app.post('/api/createDummyRecords', async (req, res) => {
    try {
        const connection = await connectDB();
        const dummyData = generateDummyData();

        // Insert dummy records into the database
        await Promise.all(dummyData.map(async (record) => {
            await connection.execute(
                'INSERT INTO records (customer_name, age, phone, location) VALUES (?, ?, ?, ?)',
                [record.customerName, record.age, record.phone, record.location]
            );
        }));

        await connection.end();
        res.json({ message: 'Dummy records created successfully' });
    } catch (error) {
        console.error('Error creating dummy records:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/records', async (req, res) => {
    try {
        const connection = await connectDB();

        const [rows] = await connection.execute('SELECT * FROM records');

        await connection.end();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
