const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the React app build directory
app.use(serveStatic(path.join(__dirname, 'build')));

// Catch all handler: send back React's index.html file for any non-API requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
