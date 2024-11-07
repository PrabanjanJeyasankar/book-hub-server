const userModel = require('../model/userModel')

const deleteAUser = async (request, response) => {
    try {
        const userRole = request.user?.role

        if (userRole !== 'admin') {
            return response.status(403).json({
                message:
                    'Access denied: you do not have permission to perform this action.',
            })
        }

        const userId = request.params.id
        const deletedUser = await userModel.findByIdAndDelete(userId)

        if (!deletedUser) {
            return response.status(404).json({
                message: 'User not found.',
            })
        }

        return response.status(200).json({
            message: 'User deleted successfully.',
            user: deletedUser,
        })
    } catch (error) {
        return response.status(500).json({
            message: 'Internal server error.',
        })
    }
}

module.exports = {
    deleteAUser,
}
