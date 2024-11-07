const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const userSchema = new mongoose.Schema(
    {
        accountType: {
            type: String,
            enum: ['google', 'email'],
            default: 'email',
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: function () {
                return this.signInType === 'email'
            },
        },
        userId: {
            type: String,
            required: true,
        },
        verifiedUser: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            required: true,
            enum: ['user', 'admin'],
            default: 'user',
        },
        profileImage: {
            type: String,
        },
        likedCollections: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'book',
            },
        ],
    },
    {
        collection: 'user',
        timestamps: true,
    }
)

userSchema.pre('save', function (next) {
    const user = this
    if (!user.isModified('password')) {
        return next()
    }

    bcrypt.genSalt(10, (error, salt) => {
        if (error) {
            return next(error)
        }
        bcrypt.hash(user.password, salt, (error, hash) => {
            if (error) {
                return next(error)
            }
            user.password = hash
            next()
        })
    })
})

userSchema.methods.generateJwtToken = function () {
    const id = this._id
    const payload = { id }
    return jwt.sign(payload, process.env.ACCESS_TOKEN, {
        expiresIn: '15d',
    })
}

module.exports = mongoose.model('user', userSchema)
