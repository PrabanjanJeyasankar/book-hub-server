const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is a required field'],
        },
        author: {
            type: String,
            required: [true, 'Author is a required field'],
        },
        genre: {
            type: String,
            required: [true, 'Genre is a required field'],
        },
        publisher: {
            type: String,
            required: [true, 'Publisher is a required field'],
        },
        isbn: {
            type: String,
            required: [true, 'ISBN is a required field'],
            match: /^[0-9]{13}$/,
        },
        publicationDate: {
            type: Date,
            required: [true, 'Publication Date is a required field'],
        },
        language: {
            type: String,
            required: [true, 'Language is a required field'],
        },
        description: {
            type: String,
            required: [true, 'Description is a required field'],
        },
        availableCopies: {
            type: Number,
            required: [true, 'Available Copies is a required field'],
        },
        coverImage: {
            type: String,
            required: [true, 'Cover Image is a required field'],
        },
    },
    {
        collection: 'book',
        timestamps: true,
    }
)

module.exports = mongoose.model('book', bookSchema)
