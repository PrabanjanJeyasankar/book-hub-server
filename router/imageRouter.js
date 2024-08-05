const express = require('express')
const getFileByName = require('../controller/imageController')
const router = express.Router()

router.get('/upload/:filename', getFileByName)

module.exports = router