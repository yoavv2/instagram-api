const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const routes = require('./config/routes');
const env = require('./config/env/index');

const app = express();
const port = process.env.PORT || 4000;

// Configure CORS with credentials support
app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if(!origin) return callback(null, true);
      
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization']
  })
);

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  next();
});

app.use(express.static('public'));
app.use(express.json());
app.use(routes);

mongoose
  .connect(env.mongoUrl)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    listen();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

function listen() {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  }).on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });
}
