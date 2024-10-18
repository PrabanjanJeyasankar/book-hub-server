const mongoose = require('mongoose')

const userBooksSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        borrowedBooks: [
            {
                bookId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'book',
                    required: true,
                },
                borrowedDate: {
                    type: Date,
                    required: true,
                    default: Date.now,
                },
                dueDate: {
                    type: Date,
                    required: true,
                },
                returned: {
                    type: Boolean,
                    default: false,
                },
                returnedDate: {
                    type: Date,
                },
            },
        ],
        requestedBooks: [
            {
                bookId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'book',
                    required: true,
                },
                requestDate: {
                    type: Date,
                    required: true,
                    default: Date.now,
                },
                status: {
                    type: String,
                    enum: ['pending', 'approved', 'rejected'],
                    default: 'pending',
                },
            },
        ],
    },
    {
        collection: 'userBooks',
        timestamps: true,
    }
)

module.exports = mongoose.model('UserBooks', userBooksSchema)
