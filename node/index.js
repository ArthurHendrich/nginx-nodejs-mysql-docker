const express = require('express')
const mysql = require('mysql2/promise')  

const app = express()
const port = 3000

const config = {
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'nodedb'
}

async function connectToDatabase() {
    try {
        const connection = await mysql.createConnection(config)
        console.log('Connected to database')

        const createTableQuery = `CREATE TABLE IF NOT EXISTS people (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))`
        await connection.query(createTableQuery)
        console.log('Table `people` is ready or already exists.')

        const insertQuery = `INSERT INTO people (name) VALUES ('Hendrich'), ('Arthur'), ('Alencar')`
        await connection.query(insertQuery)
        console.log('Data inserted')

        await connection.end()
    } catch (err) {
        console.log('Error connecting to or querying the database:', err)
        process.exit(1)
    }
}

async function listUsers() {
    try {
        const connection = await mysql.createConnection(config)
        console.log('Connected to database for fetching users')

        const query = `SELECT * FROM people`
        const [results] = await connection.query(query)
        
        const users = results.map(result => result.name)
        await connection.end()
        
        return users
    } catch (err) {
        console.log('Error fetching data:', err)
        return []
    }
}

connectToDatabase()

app.get('/', async (req, res) => {
    let response = '<h1>Full Cycle Rocks!</h1>'

    const users = await listUsers()  

    if (users && users.length > 0) {
        response += '<ul>'
        users.forEach(user => {
            response += `<li>${user}</li>`
        })
        response += '</ul>'
    } else {
        response += '<p>No users found</p>'
    }

    res.send(response)
})

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
})
