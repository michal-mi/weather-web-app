const router = require("express").Router()
const { Role, validate } = require("../models/role")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")

router.post('/', async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction()
        await new Promise(resolve => setTimeout(resolve, 15000));
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
                        await new Role({ ...req.body }).save()
                        await session.commitTransaction()
                        session.endSession()
                        res.status(201).send({ message: "Utworzono rolę" })
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
                        const roles = await Role.find()
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send(roles)
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
                        const role = await Role.findById(req.params.id)
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send(role)
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
                        const id = req.params.id
                        await Role.findByIdAndDelete(id).exec()
                        await session.commitTransaction()
                        session.endSession()
                        res.status(200).send({ message: "Usunięto rolę" })
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
