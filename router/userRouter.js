const express = require('express')
const router = express.Router()
const {
    requestSignupOtp,
    verifySignupOtp,
    signupGoogleUser,
    login,
    logout,
} = require('../controller/authController')

const {
    authenticate,
    updateUserProfileImage,
    getProfilePicture,
} = require('../controller/userController')


const {
    requestOtp,
    verifyOtp,
    resetPassword,
} = require('../controller/passwordResetController')

const upload = require('../middleware/multer')
const { verifyUser } = require('../middleware/verify')

router.post('/request-signup-otp', requestSignupOtp)
router.post('/verify-signup-otp', verifySignupOtp)
router.post('/google-signup', signupGoogleUser)
router.post('/login', login)
router.post('/logout', logout)

router.post('/request-otp', requestOtp)
router.post('/verify-otp', verifyOtp)
router.post('/reset-password', resetPassword)

router.get('/authenticate', verifyUser, authenticate)
router.get('/profile-picture', verifyUser, getProfilePicture)
router.patch(
    '/update-profile',
    upload.single('file'),
    verifyUser,
    updateUserProfileImage
)

module.exports = router
   