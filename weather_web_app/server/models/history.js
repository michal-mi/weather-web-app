const mongoose = require("mongoose")
const Joi = require("joi")

const historySchema = new mongoose.Schema({
    userID: {type: String, required: true},
    city1: {type: String, required: true},
    city2: {type: String, required: true},
    date: {type: Date, required: false},
    begDate: { type: Date, required: false},
    endDate: { type:Date, required: false},
    dateOfSearch: {type: Date, require: true}
})

const History = mongoose.model("History", historySchema)
const validate = (data) => {
    const schema = Joi.object({
        userID: Joi.string().required().label("User ID"),
        city1: Joi.string().required().label("City 1"),
        city2: Joi.string().required().label("City 2"),
        date: Joi.date().optional().allow('').label("Date"),
        begDate: Joi.date().optional().allow('').label("Beginning date"),
        endDate: Joi.date().optional().allow('').label("Ending date"),
        dateOfSearch: Joi.date().required().label("Date Of Search")
    })
    return schema.validate(data)
}
module.exports = { History, validate }