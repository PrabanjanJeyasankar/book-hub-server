const express = require('express')
const router = express.Router()
const { signup, login, logout } = require('../controller/authController')
const { authenticate, userLikes } = require('../controller/userController')
const { verifyUser } = require('../middleware/verify')

router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)
router.get('/authenticate', verifyUser, authenticate)
// router.post('/like',verifyUser, userLikes)

module.exports = router
