const userBookPreferenceModel = require('../model/userBookPreferenceModel')
const userModel = require('../model/userModel')

const authenticate = (request, response) => {
    const user = request.user
    console.log('user', user)
    if (user) {
        return response.status(200).send({
            message: 'Authentication successful, valid user.',
            user,
        })
    } else {
        return response.status(401).send({ message: 'User not authenticated' })
    }
}

const getAllUsers = async (request, response) => {
    console.log(request.user.role)
    try {
        if (request.user.role !== 'admin') {
            return response.status(403).json({
                message:
                    'Access denied: you do not have permission to view this data.',
            })
        }

        const users = await userModel.find({})

        const filteredUsers = users.filter((user) => user.role === 'user')

        return response.status(200).json({
            message: 'Users retrieved successfully.',
            users: filteredUsers,
        })
    } catch (error) {
        console.error('Error fetching users:', error)
        return response.status(500).json({ message: 'Internal server error.' })
    }
}

const userLikes = async (request, response) => {
    const userId = request.user._id
    const bookId = request.body.bookId
    const isLiked = request.body.isLiked

    try {
        let userPreference = await userBookPreferenceModel.findOne({
            user: userId,
        })

        if (isLiked) {
            if (!userPreference) {
                const newUserPreference = new userBookPreferenceModel({
                    user: userId,
                    likedBooks: [bookId],
                })
                await newUserPreference.save()
            } else {
                if (!userPreference.likedBooks.includes(bookId)) {
                    userPreference.likedBooks.push(bookId)
                    await userPreference.save()
                } else {
                    // console.log('Book is already liked by the user.')
                }
            }
        } else {
            if (userPreference && userPreference.likedBooks.includes(bookId)) {
                userPreference.likedBooks = userPreference.likedBooks.filter(
                    (id) => !id.equals(bookId)
                )
                await userPreference.save()
                // console.log('Removed book from liked books.')
            } else {
                // console.log('Book is not liked by the user, cannot unlike.')
            }
        }

        return response
            .status(200)
            .json({ message: 'User likes updated successfully.' })
    } catch (error) {
        console.error('Error in userLikes:', error)
        return response.status(500).json({ message: error.message })
    }
}

module.exports = { authenticate, userLikes, getAllUsers }
