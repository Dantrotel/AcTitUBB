const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const routerApi = require('./routes');

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

routerApi(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);    
});


