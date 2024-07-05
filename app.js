const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const path = require('path')
app.use(express.json())
const bcrypt = require('bcrypt')
dbPath = path.join(__dirname, 'userData.db')
let db = null
const initalizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3001, () => {
      console.log('Server Running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
  }
}
initalizeDbAndServer()

const checkingPassword = password => {
  return password.length > 4
}

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const selectUserName = `
  SELECT 
    *
  FROM
    user
  WHERE
    username = '${username}';`
  const dbUser = await db.get(selectUserName)

  if (dbUser === undefined) {
    const postQuery = `
    INSERT INTO
      user(username,name,password,gender,location)
      VALUES
      (
        '${username}',
        '${name}',
        '${hashedPassword}',
        '${gender}',
        ${location}'
      );`

    if (checkingPassword(password)) {
      await db.run(postQuery)
      response.send('User created successfully')
    } else {
      response.status(400)
      response.send('Password is too short')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})
