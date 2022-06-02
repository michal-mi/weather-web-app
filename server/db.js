const mongoose = require("mongoose")
module.exports = () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
    const CONNECTION_URL = 'mongodb+srv://integracja:integracja@cluster.nddhx.mongodb.net/Integracja?retryWrites=true&w=majority';
    try {
        mongoose.connect(CONNECTION_URL, {
            useNewUrlParser: true, useUnifiedTopology: true
        })
        //mongoose.connect(process.env.DB, connectionParams)
        console.log("Połączono z bazą danych")
    } catch (error) {
        console.log(error);
        console.log("Problem z połączeniem do bazy!")
    }
}
