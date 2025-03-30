const { init } = require('@paralleldrive/cuid2')
const userModel = require('../model/userModel')
const superAdminCredentials = require('../database/initialData')
const {
    generateAndSendOtp,
    getOtpDocumentByEmail,
} = require('../services/authService')
const { getUserByEmail } = require('../services/userService')
const { setResponseBody } = require('../utils/responseFormatter')
const OtpError = require('../errors/otpError')
const cuid = init()
const bcrypt = require('bcryptjs')

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
    return `${libraryCode}${year}${month}${formattedCount}`
}

const requestSignupOtp = async (request, response) => {
    const { email, password, name } = request.body

    try {
        const existingUser = await getUserByEmail(email)
        if (existingUser) {
            if (existingUser.verifiedUser) {
                return response
                    .status(409)
                    .send(
                        setResponseBody(
                            'email already exist',
                            'existing_user',
                            null
                        )
                    )
            }
            await generateAndSendOtp(existingUser.email)
            existingUser.name = name
            existingUser.password = password

            return response
                .status(403)
                .send(
                    setResponseBody(
                        'User already exists, but not verified, please verify to continue.',
                        'unverified_existing_user',
                        null
                    )
                )
        }

        await generateAndSendOtp(email)

        const userId = await generateUserId('CHE')
        const newUser = new userModel({
            userId,
            email,
            name,
            password,
        })

        await newUser.save()

        return response
            .status(200)
            .send(setResponseBody('OTP sent to your email', null, null))
    } catch (error) {
        console.log("otp error", error)
        if (error instanceof OtpError) {
            return response
                .status(423)
                .send(
                    setResponseBody(
                        'Could not send OTP. Please try again later.',
                        'otp_error',
                        error.message
                    )
                )
        }

        return response
            .status(500)
            .send(
                setResponseBody('Something went wrong', 'server_error', error)
            )
    }
}

const verifySignupOtp = async (request, response) => {
    const { email, otp: inputOtp } = request.body

    try {
        const otpData = await getOtpDocumentByEmail(email)
        if (!otpData) {
            return response.status(404).send({ message: 'OTP expired, resend' })
        }
        if (otpData.otp.toString() !== inputOtp.toString()) {
            return response.status(400).send({ message: 'Invalid OTP' })
        }

        const existingUser = await getUserByEmail(email)

        existingUser.verifiedUser = true
        await existingUser.save()

        const token = existingUser.generateJwtToken()
        const options = { httpOnly: true, secure: true, sameSite: 'none' }
        const { password, ...userProfile } = existingUser.toObject()

        response.cookie('sessionId', token, options)
        response.status(201).send({
            message: 'User verified and created successfully.',
            userProfile,
        })
    } catch (error) {
        response.status(500).send({ message: error.message })
    }
}

const signupGoogleUser = async (request, response) => {
    const { name, email, googleId } = request.body

    try {
        let existingUser =
            (await userModel.findOne({ googleId })) ||
            (await userModel.findOne({ email }))
        if (existingUser) {
            return response.status(409).send({ error: 'User already exists' })
        }

        const userId = cuid()
        const newUser = new userModel({
            userId,
            name,
            email,
            googleId,
            password: null,
        })

        await newUser.save()

        const token = newUser.generateJwtToken()
        const options = { httpOnly: true, secure: true, sameSite: 'none' }

        const { password, ...userProfile } = newUser.toObject()
        response.cookie('sessionId', token, options)

        return response.status(201).send({
            message: 'Google user created successfully.',
            userProfile,
        })
    } catch (error) {
        return response.status(500).send({ error: 'Internal server error' })
    }
}

const login = async (request, response) => {
    const { email, password } = request.body
    try {
        const allUser = await userModel.find()
        if (allUser.length == 0) {
            const adminUser = new userModel(superAdminCredentials)
            await adminUser.save()
        }
        const existingUser = await userModel.findOne({ email })
        if (!existingUser) {
            return response
                .status(404)
                .send({ message: 'User not found, Kindly sign up' })
        }

        if (existingUser.accountType === 'google') {
            return response
                .status(400)
                .send({ message: 'You have signed up using Google. Please log in using Google.' })
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
        const { password: userPassword, ...userProfile } = existingUser._doc

        response.cookie('sessionId', token, options)
        response
            .status(200)
            .send({ message: 'Logged in successfully', userProfile })
    } catch (error) {
        console.log(error)
        response.status(500).send({ message: error.message })

    }
}

const logout = async (request, response) => {
    const authHeader = request.headers['cookie']
    try {
        if (!authHeader) {
            return response.status(204).send({ message: 'No Content' })
        }
        response.setHeader('Clear-Site-Data', '"cookies"')
        response.status(200).send({ message: 'Logged out!' })
    } catch (error) {
        response.status(500).send({ message: error.message })
    }
}

const createUserByAdmin = async (request, response) => {
    const { email, name } = request.body

    try {
        // Check if the user already exists
        const existingUser = await getUserByEmail(email)
        if (existingUser) {
            return response
                .status(409)
                .send(
                    setResponseBody(
                        'User already exists',
                        'existing_user',
                        null
                    )
                )
        }

        // Generate a random password
        const password = Math.random().toString(36).slice(-8) // Or use a stronger generator
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user
        const userId = generateUserId() // Assuming you have a helper to generate user IDs
        const newUser = new userModel({
            userId,
            email,
            name,
            password: hashedPassword,
        })

        await newUser.save()

        // Send password to user via email (recommended for security)
        await sendEmail(
            email,
            'Your new account password',
            `Your password is: ${password}`
        )

        return response
            .status(201)
            .send(setResponseBody('User created successfully', null, null))
    } catch (error) {
        return response
            .status(500)
            .send(setResponseBody('Server error', 'server_error', error))
    }
}

module.exports = {
    requestSignupOtp,
    verifySignupOtp,
    signupGoogleUser,
    createUserByAdmin,
    generateUserId,
    login,
    logout,
}
