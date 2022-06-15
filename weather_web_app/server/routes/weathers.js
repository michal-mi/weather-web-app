const router = require("express").Router()
const { Weather, validate } = require("../models/weather")
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

router.post('/', async (req, res) => {
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
                        const { error } = validate(req.body)
                        await new Weather({ ...req.body }).save()
                        await session.commitTransaction()
                        session.endSession()
                        res.status(201).send({ message: "Utworzono wpis o pogodzie" })
                    } catch (error) {
                        await session.abortTransaction()
                        session.endSession()
                        res.status(500).send({ message: "Wewnętrzny błąd serwera lub walidacji" })
                    }
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
                        const weathers = await Weather.find()
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send(weathers)
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
                        const weather = await Weather.findById(req.params.id)
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send(weather)
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

router.delete('/deleteAll', async (req, res) => {
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
                        await Weather.deleteMany()
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send({ message: "Usunięto wpis o pogodzie" })
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
                        await Weather.findByIdAndDelete(req.params.id).exec()
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send({ message: "Usunięto wpis o pogodzie" })
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
