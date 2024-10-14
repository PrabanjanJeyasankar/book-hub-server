const mongoose = require('mongoose')
const userBookPreferenceModel = require('../model/userBookPreferenceModel')

const getBookLikeStatusById = async (request, response) => {
    const bookId = request.params.bookId
    const userId = request.user._id

    const userPreference = await userBookPreferenceModel.findOne({
        user: userId,
    })

    if (!userPreference) {
        return response.status(404).json({
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

const getBookmarkStatusById = async (request, response) => {
    const bookId = request.params.bookId
    const userId = request.user._id

    const userPreference = await userBookPreferenceModel.findOne({
        user: userId,
    })

    if (!userPreference) {
        return response.status(404).json({
            bookmarked: false,
            message: 'No preferences found for this user.',
        })
    }

    const isUserBookmarked = userPreference.bookmarkedBooks.find((bookmark) =>
        bookmark.book.equals(bookId)
    )

    if (isUserBookmarked) {
        return response.status(200).json({
            bookmarked: true,
            readingStatus: userPreference.readingStatus,
            message: `Book is bookmarked with a ${userPreference.readingStatus} status.`,
        })
    } else {
        return response.status(200).json({
            bookmarked: false,
            message: 'Book is not bookmarked by the user.',
        })
    }
}

const addBookToUserPreference = async (request, response) => {
    try {
        const { bookId, status } = request.body
        const userId = request.user._id

        if (
            ![
                'finishedReading',
                'currentlyReading',
                'wantToRead',
                'none',
            ].includes(status)
        ) {
            return response.status(400).json({ message: 'Invalid status' })
        }

        let preference = await userBookPreferenceModel.findOne({ user: userId })

        if (preference) {
            const bookmarkedBookIndex = preference.bookmarkedBooks.findIndex(
                (bookmark) => bookmark.book.equals(bookId)
            )

            if (bookmarkedBookIndex !== -1) {
                if (status === 'none') {
                    preference.bookmarkedBooks.splice(bookmarkedBookIndex, 1)
                    await preference.save()
                    return response
                        .status(200)
                        .json({ message: 'Book un-bookmarked', preference })
                } else {
                    preference.bookmarkedBooks[
                        bookmarkedBookIndex
                    ].readingStatus = status
                    await preference.save()
                    return response.status(200).json({
                        message: `Book status updated to ${status}`,
                        preference,
                    })
                }
            } else {
                preference.bookmarkedBooks.push({
                    book: bookId,
                    readingStatus: status,
                })
                await preference.save()
                return response.status(200).json({
                    message: `Book added with status ${status}`,
                    preference,
                })
            }
        } else {
            preference = await userBookPreferenceModel.create({
                user: request.user._id,
                bookmarkedBooks: [
                    {
                        book: bookId,
                        readingStatus: status,
                    },
                ],
            })
            return response
                .status(200)
                .json({ message: 'Book added to preferences', preference })
        }
    } catch (error) {
        return response.status(500).json({ message: 'Internal server error' })
    }
}

const getBookPreferencesById = async (request, response) => {
    const bookId = request.params.bookId
    const userId = request.user._id

    const userPreference = await userBookPreferenceModel.findOne({
        user: userId,
    })

    if (!userPreference) {
        return response.status(404).json({
            liked: false,
            bookmarked: false,
            readingStatus: null,
            message: 'No preferences found for this user.',
        })
    }

    const isBookLiked = userPreference.likedBooks.includes(
        new mongoose.Types.ObjectId(bookId)
    )

    const bookmarkedBook = userPreference.bookmarkedBooks.find((bookmark) =>
        bookmark.book.equals(bookId)
    )

    const readingStatus = bookmarkedBook ? bookmarkedBook.readingStatus : null

    return response.status(200).json({
        liked: isBookLiked,
        bookmarked: !!bookmarkedBook,
        readingStatus,
        message: `Preferences fetched successfully, liked: ${isBookLiked}, bookmarked: ${!!bookmarkedBook}, readingStatus: ${readingStatus}`,
    })
}

const getUserPreference = async (request, response) => {
    const userId = request.user._id

    try {
        const preferences = await userBookPreferenceModel.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'book',
                    localField: 'likedBooks',
                    foreignField: '_id',
                    as: 'likedBooksDetails',
                },
            },
            {
                $lookup: {
                    from: 'book',
                    localField: 'bookmarkedBooks.book',
                    foreignField: '_id',
                    as: 'bookmarkedBooksDetails',
                },
            },
            {
                $project: {
                    _id: 0,
                    likedBooks: '$likedBooksDetails',
                    bookmarkedBooks: {
                        $map: {
                            input: '$bookmarkedBooks',
                            as: 'bookmark',
                            in: {
                                book: {
                                    $arrayElemAt: [
                                        '$bookmarkedBooksDetails',
                                        {
                                            $indexOfArray: [
                                                '$bookmarkedBooks.book',
                                                '$$bookmark.book',
                                            ],
                                        },
                                    ],
                                },
                                readingStatus: '$$bookmark.readingStatus',
                            },
                        },
                    },
                },
            },
        ])

        if (preferences.length === 0) {
            return response
                .status(404)
                .json({ message: 'User preferences not found' })
        }

        response.status(200).json({
            message: 'Fetched user preferences',
            preferences: preferences[0],
        })
    } catch (error) {
        response.status(500).json({ message: error.message })
    }
}

module.exports = {
    getBookLikeStatusById,
    getBookmarkStatusById,
    addBookToUserPreference,
    getBookPreferencesById,
    getUserPreference,
}
