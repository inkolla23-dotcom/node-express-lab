
const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const initializeDB = require('./database')

const app = express()
app.use(express.json())

const jwtSecret = 'MY_SECRET_TOKEN'

let db = null

// User Registration
app.post('/register/', async (request, response) => {
  const {username, name, password} = request.body

  if (!username || !name || !password) {
    return response.status(400).send('All fields are required')
  }

  const existingUser = await db.get(
    'SELECT * FROM users WHERE username = ?',
    [username]
  )

  if (existingUser !== undefined) {
    return response.status(400).send('User already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await db.run(
    'INSERT INTO users (username, name, password) VALUES (?, ?, ?)',
    [username, name, hashedPassword]
  )

  response.status(200).send('User created successfully')
})

// User Login
app.post('/login/', async (request, response) => {
  const {username, password} = request.body

  if (!username || !password) {
    return response.status(400).send('Username and password are required')
  }

  const user = await db.get(
    'SELECT * FROM users WHERE username = ?',
    [username]
  )

  if (user === undefined) {
    return response.status(400).send('Invalid user')
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password
  )

  if (isPasswordMatched === false) {
    return response.status(400).send('Invalid password')
  }

  const payload = {username: username}
  const jwtToken = jwt.sign(payload, jwtSecret)

  response.send({jwt_token: jwtToken})
})

// Initialize Database and Start Server
const initializeDBAndServer = async () => {
  try {
    db = await initializeDB()

    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
