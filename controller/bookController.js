const mongoose = require('mongoose')
const bookModel = require('../model/bookModel')
const streamifier = require('streamifier')
const cloudinary = require('../configuration/cloudinaryConfig')

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

        let imageURL = ''
        if (request.file) {
            try {
                const uploadImage = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'blog-app',
                            use_filename: true,
                            unique_filename: false,
                        },
                        (error, result) => {
                            if (result) {
                                resolve(result)
                            } else {
                                reject(error)
                            }
                        }
                    )

                    streamifier
                        .createReadStream(request.file.buffer)
                        .pipe(stream)
                })
                imageURL = uploadImage.secure_url
            } catch (error) {
                return response
                    .status(500)
                    .send({ message: 'Image upload failed' })
            }
        } else {
            return response
                .status(400)
                .send({
                    message: 'Error while uploading image, try again later',
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
            coverImage: imageURL,
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
        const book = await bookModel.find({ isbn: bookIsbn })
        if (book.length === 0) {
            return response.status(404).send({
                message: 'Could not find the book',
            })
        }
        response.status(200).send({
            message: 'Found the book',
            book: book[0],
        })
    } catch (error) {
        response.status(500).send({
            message: error.message,
        })
    }
}

const updateBookById = async (request, response) => {
    const bookIsbn = request.params.id
    const updatedData = request.body

    try {
        let imageURL = ''
        if (request.file) {
            try {
                const uploadImage = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'blog-app',
                            use_filename: true,
                            unique_filename: false,
                        },
                        (error, result) => {
                            if (result) {
                                resolve(result)
                            } else {
                                reject(error)
                            }
                        }
                    )

                    streamifier
                        .createReadStream(request.file.buffer)
                        .pipe(stream)
                })
                imageURL = uploadImage.secure_url
            } catch (error) {
                return response
                    .status(500)
                    .send({ message: 'Image upload failed' })
            }
            updatedData.coverImage = imageURL
        }

        const updatedBook = await bookModel.findOneAndUpdate(
            { isbn: bookIsbn },
            updatedData,
            { new: true }
        )
        if (!updatedBook) {
            return response.status(404).send({
                message: 'Book not found',
            })
        }
        response.status(200).send({
            message: 'Book updated successfully',
            book: updatedBook,
        })
    } catch (error) {
        response.status(500).send({
            message: error.message,
        })
    }
}

const deleteABookById = async (request, response) => {
    const bookIsbn = request.params.id
    try {
        const deletedBook = await bookModel.findOneAndDelete({ isbn: bookIsbn })
        if (!deletedBook) {
            return response.status(404).send({
                message: 'Book not found',
            })
        }

        response.status(200).send({
            message: 'Book deleted successfully',
            book: deletedBook,
        })
    } catch (error) {
        response.status(500).send({
            message: error.message,
        })
    }
}

const searchBooks = async (request, response) => {
    const { query, genre, language, publisher } = request.query

    try {
        const searchCriteria = {
            $or: [
                { title: { $regex: new RegExp(`^${query}`, 'i') } },
                { author: { $regex: new RegExp(`^${query}`, 'i') } },
            ],
        }

        if (genre) {
            searchCriteria.genre = { $regex: new RegExp(`^${genre}`, 'i') }
        }

        if (language) {
            searchCriteria.language = language
        }

        if (publisher) {
            searchCriteria.publisher = publisher
        }

        const books = await bookModel.find(searchCriteria)

        if (books.length === 0) {
            return response.status(404).send({
                message: 'No Books Found.',
            })
        }

        response.status(200).send({
            message: 'Search results',
            books: books,
        })
    } catch (error) {
        response.status(500).send({
            message: error.message,
        })
    }
}

module.exports = {
    addANewBook,
    getAllBooks,
    getABookById,
    updateBookById,
    deleteABookById,
    searchBooks,
}
