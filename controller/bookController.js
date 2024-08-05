const bookModel = require('../model/bookModel')

const addANewBook = async (request, response) => {
    const {
        title,
        author,
        genre,
        publisher,
        isbn,
        publicationDate,
        language,
        description,
        availableCopies,
    } = request.body
    const coverImage = request.file

    try {
        const path = '/upload/' + coverImage.filename
        const existingBook = await bookModel.find({ isbn: isbn })

        if (existingBook.length !== 0) {
            return response.status(409).send({
                book: existingBook[0],
                message: 'Book Already Exists',
            })
        }

        const newBook = new bookModel({
            title,
            author,
            genre,
            publisher,
            isbn,
            publicationDate,
            language,
            description,
            availableCopies,
            coverImage: path,
        })
        await newBook.save()

        response.status(201).send({
            message: 'Added successfully',
            book: newBook,
        })
    } catch (error) {
        response.status(500).send({
            message: error.message,
        })
    }
}

const getAllBooks = async (request, response) => {
    try {
        const books = await bookModel.find()
        if (books.length == 0) {
            return response.status(404).send({
                message: 'Data Not Found !',
            })
        }
        console.log(books)
        response.status(200).send({
            message: 'All books Fetched',
            books: books,
        })
    } catch (error) {
        response.status(500).send({
            message: error.message,
        })
    }
}

const getABookById = async (request, response) => {
    const bookIsbn = request.params.id
    try {
        const book = await bookModel.find({
            isbn: bookIsbn,
        })
        if (book.length == 0) {
            return response.status(404).send({
                message: 'Could not find the book',
            })
        }
        console.log(book)
        response.status(200).send({
            message: 'Found the book',
            book: book,
        })
    } catch (error) {
        response.status(500).send({
            message: error.message,
        })
    }
}

// const deleteABook = async (request, response) => {
//     const
// }

module.exports = {
    addANewBook,
    getAllBooks,
    getABookById,
}
