const express = require('express');
const path = require('path');

const app = express();
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 7000;

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`JBlog is running 🚀 access http://${HOST}:${PORT}`);
});

