const express = require('express')
const router = express.Router()
const { signup } = require('../controller/authController')
const { getAllUsers } = require('../controller/userController')
const { deleteAUser } = require('../controller/adminController')
const { verifyUser } = require('../middleware/verify')

router.get('/all-users', verifyUser, getAllUsers)
router.post('/create-user', signup)
router.delete('/delete-user/:id', verifyUser, deleteAUser)

module.exports = router
