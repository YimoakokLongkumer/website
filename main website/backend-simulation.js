// backend-simulation.js - This is a conceptual example of what the backend might look like
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simulated database files
const DB_FILES = {
  products: 'data/products.json',
  orders: 'data/orders.json',
  contacts: 'data/contacts.json'
};

// Initialize database files if they don't exist
function initializeDatabase() {
  for (const [key, file] of Object.entries(DB_FILES)) {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify([]));
      console.log(`Created ${file}`);
    }
  }
}

// Read from database file
function readFromDB(file) {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading from ${file}:`, error);
    return [];
  }
}

// Write to database file
function writeToDB(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${file}:`, error);
    return false;
  }
}

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  const products = readFromDB(DB_FILES.products);
  res.json(products);
});

// Get a specific product
app.get('/api/products/:id', (req, res) => {
  const products = readFromDB(DB_FILES.products);
  const product = products.find(p => p.id === parseInt(req.params.id));
  
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Submit a contact form
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  const contacts = readFromDB(DB_FILES.contacts);
  const newContact = {
    id: Date.now(),
    name,
    email,
    subject,
    message,
    timestamp: new Date().toISOString()
  };
  
  contacts.push(newContact);
  writeToDB(DB_FILES.contacts, contacts);
  
  res.json({ success: true, message: 'Contact form submitted successfully' });
});

// Place an order
app.post('/api/orders', (req, res) => {
  const { items, customerInfo, total } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  
  const orders = readFromDB(DB_FILES.orders);
  const newOrder = {
    id: Date.now(),
    items,
    customerInfo,
    total,
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  
  orders.push(newOrder);
  writeToDB(DB_FILES.orders, orders);
  
  res.json({ 
    success: true, 
    orderId: newOrder.id,
    message: 'Order placed successfully' 
  });
});

// Get all orders (admin endpoint)
app.get('/api/orders', (req, res) => {
  // In a real app, you would check for admin authentication here
  const orders = readFromDB(DB_FILES.orders);
  res.json(orders);
});

// Initialize and start server
initializeDatabase();

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  GET  /api/products`);
  console.log(`  GET  /api/products/:id`);
  console.log(`  POST /api/contact`);
  console.log(`  POST /api/orders`);
  console.log(`  GET  /api/orders (admin)`);
});