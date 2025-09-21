import express from 'express';

const app = express();
// Use the port from the environment, or default to 3000
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello from Joachima!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
