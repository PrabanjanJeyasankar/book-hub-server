require('dotenv').config()

const express = require('express')
const app = express()
const PORT = 3500
const cookieParser = require('cookie-parser')

const bookRouter = require('./router/bookRouter')
const imageRouter = require('./router/imageRouter')
const userRouter = require('./router/userRouter')

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

app.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/api/v1/book', bookRouter)
app.use('/api/v1', imageRouter)
app.use('/api/v1/user', userRouter)
// app.use('/upload', express.static(path.join(__dirname, 'upload')))

app.listen(PORT, console.log(`server running at http://localhost:${PORT}`))
