const bcrypt = require('bcryptjs')
const userModel = require('../model/userModel')

const generateUserId = async (libraryNameCode) => {
    const libraryCode = libraryNameCode.toUpperCase()
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const startOfMonth = new Date(year, now.getMonth(), 1)
    const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59, 999) // Last day of the current month

    const usersThisMonth = await userModel.find({
        createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
        },
    })

    const formattedCount = String(usersThisMonth.length + 1).padStart(5, '0')
    console.log(`${libraryCode}${year}${month}${formattedCount}`)
    return `${libraryCode}${year}${month}${formattedCount}`
}

const signup = async (request, response) => {
    const { name, email, password } = request.body
    try {
        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return response.status(409).send({ message: 'User Already Exist.' })
        }
        const libraryCode = 'CHE'
        const userId = await generateUserId(libraryCode)

        const newUser = new userModel({ name, email, password, userId })
        console.log(newUser)
        await newUser.save()
        const token = newUser.generateJwtToken()
        const options = { httpOnly: 'true', secure: 'true', sameSite: 'none' }

        const { password: userPassword, ...userData } = newUser.toObject()

        response.cookie('sessionId', token, options)
        response.status(201).send({
            message: 'user created and successfully added into DB.',
            userData,
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({ message: error.message })
    }
}

const login = async (request, response) => {
    const { email, password } = request.body
    console.log(request.body)
    try {
        const existingUser = await userModel.findOne({ email })
        console.log(existingUser)
        if (!existingUser) {
            return response
                .status(404)
                .send({ message: 'User not found, Kindly sign up' })
        }
        const validPassword = await bcrypt.compare(
            password,
            existingUser.password
        )

        if (!validPassword) {
            return response.status(401).send({ message: 'Incorrect Password' })
        }

        const token = existingUser.generateJwtToken()
        const options = { httpOnly: 'true', secure: 'true', sameSite: 'none' }
        const { password: userPassword, ...userData } = existingUser

        response.cookie('sessionId', token, options)
        response
            .status(200)
            .send({ message: 'Logged in successfully', userData })
    } catch (error) {
        console.log(error)
        response.status(500).send({ message: error.message })
    }
}

module.exports = { signup, login }
