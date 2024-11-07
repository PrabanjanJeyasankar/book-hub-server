const jwt = require('jsonwebtoken')
const userModel = require('../model/userModel')
const { verifyAccessToken, refreshIdToken } = require('../services/authService')

const verifyUser = async (request, response, next) => {
    try {
        const authHeader = request.headers['cookie']
        if (authHeader && authHeader.includes('id_token')) {
            const email = await verifyIdTokenFromGoogle(request, response)
            if (!email) return

            const existingUser = await userModel.findOne({ email })
            request.user = existingUser
            return next()
        }

        if (!authHeader) {
            return response.status(401).send({ message: 'Token not found' })
        }

        const cookie = authHeader.split('=')[1]
        jwt.verify(cookie, process.env.ACCESS_TOKEN, async (error, decoded) => {
            if (error) {
                return response.status(401).json({ message: 'Session expired' })
            }

            const { id } = decoded
            const existingUser = await userModel.findById(id)
            if (existingUser) {
                const { password, ...data } = existingUser._doc
                request.user = data
            } else {
                request.user = existingUser
            }
            next()
        })
    } catch (error) {
        response.status(500).json({ message: error.message })
    }
}

const verifyIdTokenFromGoogle = async (request, response) => {
    const cookieString = request.headers['cookie']
    
    const parseCookies = (cookieString) => {
        if (!cookieString) return {}

        return cookieString.split('; ').reduce((acc, cookie) => {
            const [key, value] = cookie.split('=')
            acc[key] = decodeURIComponent(value)
            return acc
        }, {})
    }

    const { access_token, refresh_token, id_token } = parseCookies(cookieString)
    if (!access_token) {
        response.status(401).send('No access token provided')
        return null
    }

    try {
        const userData = await verifyAccessToken(id_token)
        return userData.email
    } catch (error) {
        if (refresh_token) {
            try {
                const newIdToken = await refreshIdToken(refresh_token)
                const newUserData = await verifyAccessToken(newIdToken)
                return newUserData.email
            } catch (refreshError) {
                response
                    .status(401)
                    .send('Invalid access token and refresh token')
                return null
            }
        } else {
            response
                .status(401)
                .send('Invalid access token and no refresh token provided')
            return null
        }
    }
}

module.exports = { verifyUser }
