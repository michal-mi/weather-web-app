const mongoose = require("mongoose")
module.exports = () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
    const CONNECTION_URL = 'mongodb://mongodb:27017/new-docker-db';
    try {
        mongoose.connect(CONNECTION_URL, {
            useNewUrlParser: true, useUnifiedTopology: true
        })
        console.log("Połączono z bazą danych")
    } catch (error) {
        console.log(error);
        console.log("Problem z połączeniem do bazy!")
    }
}
