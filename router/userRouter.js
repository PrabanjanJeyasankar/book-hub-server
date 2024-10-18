const express = require('express')
const router = express.Router()
const { signup, login, logout } = require('../controller/authController')
const { authenticate, getAllUsers, updateUserProfileImage, getProfilePicture } = require('../controller/userController')
const { verifyUser } = require('../middleware/verify')
const upload = require('../middleware/multer')

router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)
router.get('/authenticate', verifyUser, authenticate)
router.get('/all-users', verifyUser, getAllUsers)
router.get('/profile-picture', verifyUser, getProfilePicture)
router.patch('/update-profile',upload.single('file'), verifyUser, updateUserProfileImage)

module.exports = router
