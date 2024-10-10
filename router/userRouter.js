const express = require('express')
const router = express.Router()
const { signup, login, logout } = require('../controller/authController')
const { authenticate, getAllUsers } = require('../controller/userController')
const { verifyUser } = require('../middleware/verify')

router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)
router.get('/authenticate', verifyUser, authenticate)
router.get('/all-users', verifyUser, getAllUsers)

module.exports = router
