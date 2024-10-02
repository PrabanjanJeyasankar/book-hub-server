const express = require('express')
const router = express.Router()
const { signup, login } = require('../controller/authController')
const { authenticate } = require('../controller/userController')
const { verifyUser } = require('../middleware/verify')

router.post('/signup', signup)
router.post('/login', login)
router.get('/authenticate', verifyUser, authenticate)

module.exports = router
