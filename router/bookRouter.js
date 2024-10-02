const express = require('express')
const router = express.Router()

const { addANewBook, getAllBooks, getABookById, updateBookById, deleteABookById, searchBooks } = require('../controller/bookController')
const upload = require('../middleware/multer')


router.get('/', getAllBooks)

router.post('/add',upload.single('coverImage'), addANewBook)
router.put('/edit/:id', upload.single('coverImage'), updateBookById); 
router.delete('/delete/:id', deleteABookById)
router.get('/search', searchBooks)
router.get('/:id',getABookById)

module.exports = router
