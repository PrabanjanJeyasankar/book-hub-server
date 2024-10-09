const mongoose = require('mongoose')

const UserBookPreferenceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    likedBooks: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'book',
    },
    readingStatus: {
        type: String,
        enum: ['none', 'finishedReading', 'currentlyReading', 'wantToRead'],
        default: 'none',
    },
})

module.exports = mongoose.model('userPreference', UserBookPreferenceSchema)
