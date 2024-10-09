const express = require('express')
const router = express.Router()
const {signup} = require('../controller/authController')

router.post('/create-user', signup)

module.exports = router