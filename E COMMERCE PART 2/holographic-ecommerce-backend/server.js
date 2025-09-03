require('dd-trace').init(); // Initialize Datadog APM at the very top

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const { createClient } = require('redis');
const { Client } = require('@elastic/elasticsearch');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Import and initialize Stripe
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');
const rateLimit = require('express-rate-limit'); // Import rate-limit

require('dd-trace').init(); // Initialize Datadog APM at the very top

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Sentry Initialization
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// Apply rate limiting to all API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', apiLimiter);

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

// PostgreSQL Connection Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Redis Client
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
  await redisClient.connect();
  console.log('Connected to Redis');
})();

// Elasticsearch Client
const esClient = new Client({ node: process.env.ELASTICSEARCH_URL });

// Test Elasticsearch connection
(async () => {
  try {
    await esClient.ping();
    console.log('Connected to Elasticsearch');
  } catch (error) {
    console.error('Elasticsearch connection failed:', error);
  }
})();

// Test DB connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Connected to PostgreSQL at:', result.rows[0].now);
  });
});

// Function to index a product in Elasticsearch
const indexProduct = async (product) => {
  try {
    await esClient.index({
      index: 'products',
      id: product.id.toString(),
      document: product,
    });
    console.log(`Product ${product.id} indexed in Elasticsearch`);
  } catch (error) {
    console.error(`Error indexing product ${product.id}:`, error);
  }
};

// Basic API Routes
app.get('/', (req, res) => {
  res.send('Holographic E-commerce Backend API');
});

// Products API with Redis caching
app.get('/api/products', async (req, res) => {
  // Increment a custom Datadog metric for product API calls
  if (process.env.DATADOG_API_KEY) {
    require('dd-trace').tracer.metrics.increment('web.request.products', 1);
  }

  const cacheKey = 'all_products';
  try {
    // Check cache first
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      console.log('Serving products from Redis cache');
      return res.json(JSON.parse(cachedProducts));
    }

    // If not in cache, query PostgreSQL
    const result = await pool.query('SELECT * FROM products');
    const products = result.rows;

    // Store in Redis with an expiration (e.g., 1 hour)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(products));
    console.log('Serving products from PostgreSQL and caching in Redis');
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Search Products API
app.get('/api/products/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).send('Search query (q) is required');
  }

  try {
    const { hits } = await esClient.search({
      index: 'products',
      q: q,
    });
    res.json(hits.hits.map(hit => hit._source));
  } catch (error) {
    console.error('Elasticsearch search error:', error);
    res.status(500).send('Search Error');
  }
});

// Stripe Payment Intent API
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  // Basic Fraud Detection: Flag unusually high amounts
  if (amount > 100000) { // Example: Flag amounts over $1000 (in cents)
    console.warn('Potential fraud detected: unusually high amount', { amount, currency });
    // In a real system, this would trigger more advanced checks, manual review, or decline
    return res.status(400).json({ error: 'Transaction amount too high. Please contact support.' });
  }

  try {
    // Integrate with Stripe Radar (Stripe's built-in fraud detection)
    // Stripe Radar automatically evaluates payments for fraud using machine learning.
    // No explicit code change needed here for Radar to work, but it's good to acknowledge.
    // Ensure your Stripe account has Radar enabled and configured.

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // amount in cents
      currency: currency,
    });
    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// PayPal Create Order API
app.post('/api/paypal/create-order', async (req, res) => {
  const { amount, currency, description } = req.body;

  // Basic Fraud Detection: Flag unusually high amounts
  if (amount > 1000) { // Example: Flag amounts over $1000
    console.warn('Potential fraud detected: unusually high PayPal amount', { amount, currency });
    return res.status(400).json({ error: 'Transaction amount too high for PayPal. Please contact support.' });
  }

  try {
    // PayPal also has built-in fraud tools (e.g., Seller Protection).
    // Ensure your PayPal account is configured to leverage these features.

    // In a real PayPal integration, you would use PayPal's SDK
    // to create an order on your server. For this example, we'll
    // simulate a successful order creation and return a dummy ID.
    console.log('Backend: Creating PayPal order with:', { amount, currency, description });
    
    // Simulate PayPal API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const orderId = `ORDER-${Date.now()}`;
    res.status(200).send({ orderID: orderId });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: error.message });
  }
});

// Users API (placeholder)
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Orders API
app.get('/api/orders/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Fetch orders for the given user
    const ordersResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY order_date DESC',
      [userId]
    );
    const orders = ordersResult.rows;

    // For each order, fetch its items
    for (let order of orders) {
      const itemsResult = await pool.query(
        'SELECT oi.*, p.name as product_name, p.image_url FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE order_id = $1',
        [order.id]
      );
      order.items = itemsResult.rows;
    }

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).send('Server Error');
  }
});

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned to the client
  res.statusCode = 500;
  res.end(res.sentry + '\n');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
