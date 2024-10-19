const mongoose = require('mongoose')

const userSearchSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        searchHistory: [
            {
                searchTerm: {
                    type: String,
                    required: true,
                },
                searchDate: {
                    type: Date,
                    required: true,
                    default: Date.now,
                },
            },
        ],
        suggestions: [
            {
                suggestionTerm: {
                    type: String,
                    required: true,
                },
                relevanceScore: {
                    type: Number,
                    default: 0,
                },
            },
        ],
    },
    {
        collection: 'userSearch',
        timestamps: true,
    }
)

module.exports = mongoose.model('UserSearch', userSearchSchema)
