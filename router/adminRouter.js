const express = require('express')
const router = express.Router()

const {
    requestSignupOtp,
    verifySignupOtp,
    signupGoogleUser,
    createUserByAdmin,
    login,
    logout,
} = require('../controller/authController')

const {
    requestOtp,
    verifyOtp,
    resetPassword,
} = require('../controller/passwordResetController')

const { getAllUsers } = require('../controller/userController')
const { deleteAUser } = require('../controller/adminController')
const { verifyUser } = require('../middleware/verify')

router.post('/request-signup-otp', requestSignupOtp)
router.post('/verify-signup-otp', verifySignupOtp)
router.post('/google-signup', signupGoogleUser)
router.post('/login', login)
router.post('/logout', logout)

router.post('/request-otp', requestOtp)
router.post('/verify-otp', verifyOtp)
router.post('/reset-password', resetPassword)

router.get('/all-users', verifyUser, getAllUsers)
router.post('/create-user', createUserByAdmin)
router.delete('/delete-user/:id', verifyUser, deleteAUser)

module.exports = router
