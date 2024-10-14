const multer = require('multer')
const fs = require('fs')

// const createDirectoryIfNotExist = (uploadingDirectory) => {
//     if (!fs.existsSync(uploadingDirectory)) {
//         fs.mkdirSync(uploadingDirectory)
//     }
// }

// const storage = multer.diskStorage({
//     filename: function (request, file, callback) {
//         callback(null, file.originalname)
//     },
//     destination: function (request, file, callback) {
        
//         const uploadingDirectory = './upload'

//         createDirectoryIfNotExist(uploadingDirectory)
//         callback(null, './upload')
//     },
// })

const storage = multer.memoryStorage()
const upload = multer({ storage })

module.exports = upload
