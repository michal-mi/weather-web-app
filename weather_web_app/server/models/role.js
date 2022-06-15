const mongoose = require("mongoose")
const Joi = require("joi")

const roleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
})

const Role = mongoose.model("Role", roleSchema)
const validate = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().label("Role Name"),
        description: Joi.string().required().label("Role Description"),
    })
    return schema.validate(data)
}
module.exports = { Role, validate }