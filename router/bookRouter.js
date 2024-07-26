const express = require('express')
const router = express.Router()

const { addANewBook, getAllBooks, getABookById } = require('../controller/bookController')
const upload = require('../middleware/multer')


router.get('/', getAllBooks)
router.get('/:id',getABookById)
router.post('/add',upload.single('coverImage'), addANewBook)


module.exports = router
