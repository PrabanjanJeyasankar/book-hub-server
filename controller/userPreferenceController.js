const mongoose = require('mongoose')
const userBookPreferenceModel = require('../model/userBookPreferenceModel')

const getABookByIdWithPreference = async (request, response) => {
    const bookId = request.params.bookId
    const userId = request.user._id
    const userPreference = await userBookPreferenceModel.findOne({
        user: userId,
    })

    if (!userPreference) {
        return res.status(404).json({
            liked: false,
            message: 'No preferences found for this user.',
        })
    }

    const isBookLiked = userPreference.likedBooks.includes(
        new mongoose.Types.ObjectId(bookId)
    )

    if (isBookLiked) {
        return response
            .status(200)
            .json({ liked: true, message: 'Book is liked by the user.' })
    } else {
        return response
            .status(200)
            .json({ liked: false, message: 'Book is not liked by the user.' })
    }
}

module.exports = {
    getABookByIdWithPreference,
}
