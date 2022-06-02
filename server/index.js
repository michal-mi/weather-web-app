require('dotenv').config()//
const userRoutes = require("./routes/users")//
const authRoutes = require("./routes/auth")//

const cors = require('cors')//
const express = require('express')
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const connection = require('./db')//

connection()//

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(express.json())//
app.use(cors())//

const router = require('./router');

app.use("/forecasts/", router);
app.use(express.static('public'));

app.get('/', (req, res) => {
    const d = new Date();
    res.json({ currentTime: d.toDateString() });
    console.log('Received a GET request');
})

app.use("/api/users", userRoutes)//
app.use("/api/auth", authRoutes)//

app.listen(PORT, () => console.log(`Server działa na porcie: ${PORT}`))

