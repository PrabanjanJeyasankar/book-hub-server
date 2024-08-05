const getFileByName = (request, response) => {
    const {filename} = request.params
    const parentDirectory = (__dirname).split('controller')[0]
    const filePath = parentDirectory + 'upload/' + filename
    response.sendFile(filePath)
    console.log(filePath)
}

module.exports = getFileByName