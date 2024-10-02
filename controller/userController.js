const authenticate = (request, response) => {
    response
        .status(200)
        .send({ message: ' Authentication successful, valid user.' })
}

module.exports = { authenticate }
