const router = require("express").Router()
const { History, validate } = require("../models/history")
const bcrypt = require("bcrypt")
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
                        await new History({ ...req.body }).save()
                        await session.commitTransaction()
                        session.endSession()
                        res.status(201).send({ message: "Utworzono wpis w historii" })
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
                        const histories = await History.find()
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send(histories)
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
                        const history = await History.findById(req.params.id)
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send(history)
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

router.get('/user/:id', async (req, res) => {
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
                        const histories = await History.find()
                        var userHistories = []
                        var count = 0
                        for (var prop in histories) {
                            if (histories.hasOwnProperty(prop))
                                count += 1;
                        }
                        for (var i = 0; i < count; i++) {
                            if (histories[i].userID === req.params.id) {
                                userHistories.push(await History.findById(histories[i]._id))
                            }
                        }
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send(userHistories)
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
                        await History.findByIdAndDelete(req.params.id).exec()
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send({ message: "Usunięto wpis w historii" })
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

router.delete('/deleteAll/:id', async (req, res) => {
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
                        const histories = await History.find()
                        var count = 0
                        for (var prop in histories) {
                            if (histories.hasOwnProperty(prop))
                                count += 1;
                        }
                        for (var i = 0; i < count; i++) {
                            if (histories[i].userID === req.params.id) {
                                await History.findByIdAndDelete(histories[i]._id).exec()
                            }
                        }
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send({ message: "Usunięto wpis w historii" })
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
