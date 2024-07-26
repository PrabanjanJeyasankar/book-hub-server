require('dotenv').config()

const express = require('express')
const app = express()
const PORT = 3500
const bookRouter = require('./router/bookRouter')
const cors = require('cors')


const mongoose = require('mongoose')
mongoose.connect(process.env.DB_URI)

const db = mongoose.connection

db.on('error', (error) => {
    console.log(error)
})

db.once('open', () => {
    console.log('db connected successfully.')
})

app.get('/', (request, response) => {
    response.status(200).send({ message: 'server running successfully' })
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1/book', bookRouter)

app.listen(PORT, console.log(`server running at http://localhost:${PORT}`))
