const express = require('express')
const router = express.Router()

const {
    addANewBook,
    getAllBooks,
    getABookById,
    updateBookById,
    deleteABookById,
    searchBooks,
} = require('../controller/bookController')

const {
    getBookLikeStatusById,
    getBookmarkStatusById,
    addBookToUserPreference,
    getBookPreferencesById,
    getUserPreference,
} = require('../controller/userPreferenceController')

const upload = require('../middleware/multer')
const { userLikes } = require('../controller/userController')
const { verifyUser } = require('../middleware/verify')

/*---------- books ----------*/
router.get('/', getAllBooks)
router.get('/search', searchBooks)
router.post('/add', upload.single('coverImage'), addANewBook)
router.put('/edit/:id', upload.single('coverImage'), updateBookById)
router.delete('/delete/:id', deleteABookById)

/*---------- user preference on books ----------*/
router.get('/like-preference/:bookId', verifyUser, getBookLikeStatusById)
router.get('/bookmark-preference/:bookId', verifyUser, getBookmarkStatusById)
router.get('/users-preference', verifyUser, getUserPreference)
router.get('/user-preference/:bookId', verifyUser, getBookPreferencesById)

router.post('/like', verifyUser, userLikes)
router.post('/bookmark', verifyUser, addBookToUserPreference)

router.get('/:id', getABookById)

module.exports = router
