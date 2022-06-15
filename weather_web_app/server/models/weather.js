const mongoose = require("mongoose")
const Joi = require("joi")

const weatherSchema = new mongoose.Schema({
    city1: { type: String, required: true },
    city2: { type: String, required: true },
    begDate: { type: String, required: false },
    endDate: { type: String, required: false },
    date: { type: String, required: false },
    dataCity1: {type: Array, required: true},
    dataCity2: {type: Array, required: true}
})

const Weather = mongoose.model("Weather", weatherSchema)
const validate = (data) => {
    const schema = Joi.object({
        city1: Joi.string().required().label("City 1"),
        city2: Joi.string().required().label("City 2"),
        begDate: Joi.string().optional().allow('').label("Beginning date"),
        endDate: Joi.string().optional().allow('').label("Ending date"),
        date: Joi.string().optional().allow('').label("Date"),
        dataCity1: Joi.array().required().label("Data from API"),
        dataCity2: Joi.array().required().label("Data from API")
    })
    return schema.validate(data)
}
module.exports = { Weather, validate }