const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Create an Express application
const app = express();
const port = process.env.PORT || 5000;

// midlleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app