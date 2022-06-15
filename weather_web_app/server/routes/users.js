const router = require("express").Router()
const { User, validate } = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose");

router.post("/", async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction()
        try {
            const { error } = validate(req.body)
            if (error)
                return res.status(400).send({ message: error.details[0].message })
            const user = await User.findOne({ email: req.body.email })
            if (user)
                return res
                    .status(409)
                    .send({ message: "Użytkownik o takim emailu istnieje!" })
            const salt = await bcrypt.genSalt(Number(process.env.SALT))
            const hashPassword = await bcrypt.hash(req.body.password, salt)
            const roleIDInput = "62a1d04015d3b56b945d9a28"
            await new User({ ...req.body, password: hashPassword, roleID: roleIDInput }).save()
            await session.commitTransaction()
            session.endSession()
            res.status(201).send({ message: "Utworzono użytkownika" })
        } catch (error) {
            await session.abortTransaction()
            session.endSession()
            res.status(500).send({ message: "Error occured during transaction or validation" })
        }
    } catch (err) {
        await session.abortTransaction()
        session.endSession()
        res.status(500).send({ message: "Error occured during transaction" })
    }
})

router.post("/withRole", async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction()
        if (req.headers.authorization === undefined) {
            console.log("Zly token")
            res.status(500).send({ message: "Zły token" })
        } else {
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.JWTPRIVATEKEY, async (err, user) => {
                if (err) return res.sendStatus(409)
                const email = req.body.email
                const id = req.body._id
                var status = true
                const users = await User.find()
                for (var i = 0; i < users.length; i++) {
                    if (users[i].email === email || users[i]._id === id) {
                        status = false
                        res.status(400).send({ message: "Użytkownik o takim mailu lub id istnieje!" })
                    }
                }
                if (status) {
                    const user = await User.findOne({ email: req.body.email })
                    const salt = await bcrypt.genSalt(Number(process.env.SALT))
                    const hashPassword = await bcrypt.hash(req.body.password, salt)
                    await new User({ ...req.body, password: hashPassword }).save()
                    await session.commitTransaction()
                    session.endSession()
                    res.status(201).send({ message: "Utworzono użytkowników" })
                }
            })
        }
    } catch (err) {
        await session.abortTransaction()
        session.endSession()
        res.status(500).send({ message: "Error occured during transaction" })
    }
})

router.get('/', async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction()
        if (req.headers.authorization === undefined) {
            await session.abortTransaction()
            session.endSession()
            res.status(401).send({ message: "Error occured during transaction - Bad token" })
        } else {
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.JWTPRIVATEKEY, async (err, user) => {
                if (err) {
                    await session.abortTransaction()
                    session.endSession()
                    res.status(401).send({ message: "Error occured during transaction - Bad token" })
                } else {
                    try {
                        const users = await User.find()
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send(users)
                    } catch (error) {
                        await session.abortTransaction()
                        session.endSession()
                        res.status(500).send({ message: "Wewnętrzny błąd serwera" })
                    }
                }
            })
        }
    } catch (err) {
        await session.abortTransaction()
        session.endSession()
        res.status(500).send({ message: "Error occured during transaction" })
    }
});

router.get('/:id', async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction()
        if (req.headers.authorization === undefined) {
            await session.abortTransaction()
            session.endSession()
            res.status(401).send({ message: "Error occured during transaction - Bad token" })
        } else {
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.JWTPRIVATEKEY, async (err, user) => {
                if (err) {
                    await session.abortTransaction()
                    session.endSession()
                    res.status(401).send({ message: "Error occured during transaction - Bad token" })
                } else {
                    try {
                        const user = await User.findById(req.params.id)
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send(user)
                    } catch (error) {
                        await session.abortTransaction()
                        session.endSession()
                        res.status(500).send({ message: "Wewnętrzny błąd serwera" })
                    }
                }
            })
        }
    } catch (err) {
        await session.abortTransaction()
        session.endSession()
        res.status(500).send({ message: "Error occured during transaction" })
    }
});

router.delete('/:id', async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction()
        if (req.headers.authorization === undefined) {
            await session.abortTransaction()
            session.endSession()
            res.status(401).send({ message: "Error occured during transaction - Bad token" })
        } else {
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.JWTPRIVATEKEY, async (err, user) => {
                if (err) {
                    await session.abortTransaction()
                    session.endSession()
                    res.status(401).send({ message: "Error occured during transaction - Bad token" })
                } else {
                    try {
                        await User.findByIdAndDelete(req.params.id).exec()
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send({ message: "Usunięto użytkownika" })
                    } catch (error) {
                        await session.abortTransaction()
                        session.endSession()
                        res.status(500).send({ message: "Wewnętrzny błąd serwera" })
                    }
                }
            })
        }
    } catch (err) {
        await session.abortTransaction()
        session.endSession()
        res.status(500).send({ message: "Error occured during transaction" })
    }
});

module.exports = router
