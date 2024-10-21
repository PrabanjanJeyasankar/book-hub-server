const userModel = require('../model/userModel')

const deleteAUser = async (request, response) => {
    try {
        // Ensure request.user is populated by your authentication middleware
        const userRole = request.user?.role // Using optional chaining for safety

        // Check if the user is an admin
        if (userRole !== 'admin') {
            return response.status(403).json({
                message:
                    'Access denied: you do not have permission to perform this action.',
            })
        }

        // Get the user ID from the request parameters
        const userId = request.params.id
        console.log(request.params.id)
        // Attempt to delete the user
        const deletedUser = await userModel.findByIdAndDelete(userId)

        // Check if the user was found and deleted
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
        // Log the error for debugging (optional)
        console.error('Error deleting user:', error)
        return response.status(500).json({
            message: 'Internal server error.',
        })
    }
}

module.exports = {
    deleteAUser,
}
