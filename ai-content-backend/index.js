const express = require('express');
const bodyParser = require('body-parser');
const contentRoutes = require('./routes/content');

const app = express();

app.use(bodyParser.json());
app.use('/api/content', contentRoutes);

app.get('/', (req, res) => {
    res.send('Backend is up and running!');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
