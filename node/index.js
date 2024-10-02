const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

const config = {
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'nodedb'
};

async function connectToDatabase() {
    try {
        const connection = await mysql.createConnection(config);
        console.log('Conectado ao banco de dados');

        const createTableQuery = `CREATE TABLE IF NOT EXISTS people (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))`;
        await connection.query(createTableQuery);
        console.log('Tabela "people" pronta ou já existe.');

        const [rows] = await connection.query('SELECT COUNT(*) AS count FROM people');
        if (rows[0].count === 0) {
            const insertQuery = `INSERT INTO people (name) VALUES ('Hendrich'), ('Arthur'), ('Alencar')`;
            await connection.query(insertQuery);
            console.log('Dados iniciais inseridos');
        } else {
            console.log('Dados iniciais já existem, não serão inseridos novamente');
        }

        await connection.end();
    } catch (err) {
        console.log('Erro ao conectar ou consultar o banco de dados:', err);
        process.exit(1);
    }
}

async function listUsers() {
    try {
        const connection = await mysql.createConnection(config);
        const query = `SELECT * FROM people`;
        const [results] = await connection.query(query);

        const users = results.map(result => ({ id: result.id, name: result.name }));
        await connection.end();

        return users;
    } catch (err) {
        console.log('Erro ao buscar dados:', err);
        return [];
    }
}

connectToDatabase();

app.get('/', async (req, res) => {
    let response = '<h1>Full Cycle Rocks!</h1>';

    const users = await listUsers();

    if (users && users.length > 0) {
        response += '<ul>';
        users.forEach(user => {
            response += `<li>${user.name}</li>`;
        });
        response += '</ul>';
    } else {
        response += '<p>Nenhum usuário encontrado</p>';
    }

    res.send(response);
});

app.get('/h3ndr1ch', (req, res) => {
    res.send(`
        <html>
            <head>
                <style>
                    h1 {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    }
                </style>
            </head>
            <body>
                <h1>Hendrich 2</h1>
            </body>
        </html>
    `);
});

app.get('/users', async (req, res) => {
    const users = await listUsers();
    let response = `
        <h1>Gerenciar Usuários</h1>
        <form action="/users/add" method="POST">
            <input type="text" name="name" placeholder="Digite o nome do novo usuário" required />
            <button type="submit">Adicionar Usuário</button>
        </form>
        <h2>Usuários Existentes</h2>
    `;

    if (users && users.length > 0) {
        response += '<ul>';
        users.forEach(user => {
            response += `
                <li>${user.name}
                    <form action="/users/delete" method="POST" style="display:inline;">
                        <input type="hidden" name="id" value="${user.id}" />
                        <button type="submit">Remover</button>
                    </form>
                </li>
            `;
        });
        response += '</ul>';
    } else {
        response += '<p>Nenhum usuário encontrado</p>';
    }

    res.send(response);
});

app.post('/users/add', async (req, res) => {
    const { name } = req.body;
    try {
        const connection = await mysql.createConnection(config);
        const insertQuery = `INSERT INTO people (name) VALUES (?)`;
        await connection.query(insertQuery, [name]);
        await connection.end();
        res.redirect('/users');
    } catch (err) {
        console.log('Erro ao adicionar usuário:', err);
        res.status(500).send('Erro ao adicionar usuário');
    }
});

app.post('/users/delete', async (req, res) => {
    const { id } = req.body;
    try {
        const connection = await mysql.createConnection(config);
        const deleteQuery = `DELETE FROM people WHERE id = ?`;
        await connection.query(deleteQuery, [id]);
        await connection.end();
        res.redirect('/users');
    } catch (err) {
        console.log('Erro ao remover usuário:', err);
        res.status(500).send('Erro ao remover usuário');
    }
});

app.listen(port, () => {
    console.log(`Servidor está rodando na porta ${port}`);
});
