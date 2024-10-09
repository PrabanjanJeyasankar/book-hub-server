const express = require('express')
const router = express.Router()

const { addANewBook, getAllBooks, getABookById, updateBookById, deleteABookById, searchBooks } = require('../controller/bookController')
const {getABookByIdWithPreference } = require('../controller/userPreferenceController')
const upload = require('../middleware/multer')
const { userLikes } = require('../controller/userController')
const { verifyUser } = require('../middleware/verify')

router.get('/', getAllBooks)

router.post('/add',upload.single('coverImage'), addANewBook)
router.put('/edit/:id', upload.single('coverImage'), updateBookById); 
router.delete('/delete/:id', deleteABookById)
router.get('/search', searchBooks)
router.get('/:id',getABookById)
router.get('/user-preference/:bookId',verifyUser, getABookByIdWithPreference)
router.post('/like',verifyUser, userLikes)

module.exports = router
