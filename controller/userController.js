const userBookPreferenceModel = require('../model/userBookPreferenceModel')
const userModel = require('../model/userModel')
const streamifier = require('streamifier')
const cloudinary = require('../configuration/cloudinaryConfig')

const authenticate = (request, response) => {
    const user = request.user
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
                }
            }
        } else {
            if (userPreference && userPreference.likedBooks.includes(bookId)) {
                userPreference.likedBooks = userPreference.likedBooks.filter(
                    (id) => !id.equals(bookId)
                )
                await userPreference.save()
            }
        }

        return response
            .status(200)
            .json({ message: 'User likes updated successfully.' })
    } catch (error) {
        return response.status(500).json({ message: error.message })
    }
}

const updateUserProfileImage = async (request, response) => {
    try {
        const userId = request.user._id

        const existingUser = await userModel.findOne({
            _id: userId,
        })

        if (!existingUser) {
            return response.status(404).send({ message: 'User not found' })
        }
        let imageURL = ''
        if (request.file) {
            try {
                const uploadImage = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'book-hub',
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
            existingUser.profileImage = imageURL
            existingUser.save()
            response
                .status(200)
                .send({ message: 'profile image uploaded successfully.' })
        } else {
            return response.status(400).send({
                message: 'Error while uploading image, try again later',
            })
        }
    } catch (error) {
        return response.status(500).json({ message: error.message })
    }
}

const getProfilePicture = async (request, response) => {
    try {
        const userId = request.user._id
        const existingUser = await userModel
            .findById(userId)
            .select('profileImage')

        if (!existingUser) {
            return response.status(404).send({ message: 'User not found' })
        }

        return response
            .status(200)
            .json({ profileImage: existingUser.profileImage || null })
    } catch (error) {
        return response.status(500).json({ message: error.message })
    }
}

module.exports = {
    authenticate,
    userLikes,
    getAllUsers,
    updateUserProfileImage,
    getProfilePicture,
}
