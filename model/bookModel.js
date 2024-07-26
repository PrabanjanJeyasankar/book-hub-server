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
        isbn: {
            type: String,
            required: true,
            match: /^[0-9]{13}$/,
        },
        coverImage: {
            type: String,
            required : [true, 'CoverImage is a required field']
        }
        // publisher: {
        //     type: String,
        //     required: [true, 'publisher is a required field'],
        // },
        // publicationDate: {
        //     type: Date,
        //     required: [true, 'publication date is a required field'],
        // },
        // date:{
        //     type:
        // }
    },
    {
        collection: 'book',
    },
    {
        timeStamp: true,
    }
)

module.exports = mongoose.model('book', bookSchema)

// Book Title
// Author
// ISBN
// Publisher
// Publication Date
// dd-mm-yyyy
// Genre
// Select Genre
// Language
// Cover Image
// No file chosen
// Description
// Available Copies
// Location
