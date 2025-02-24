const express = require('express');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Connexion à SQLite
const db = new Database('./users1.db');
console.log('Connected to SQLite database.');

// Création de la table utilisateurs
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        prenom TEXT NOT NULL,
        age INTEGER CHECK(age > 0),
        profession TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL CHECK(email LIKE '%@%')
    )
`);

// Routes API
app.get('/', (req, res) => res.send('API Running'));
app.get('/users', (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.json(users);
});
app.post('/users', (req, res) => {
    const { nom, prenom, age, profession, email } = req.body;
    console.log('Données reçues :', req.body);
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "L'email est invalide." });
    }
    
    const stmt = db.prepare(`
        INSERT INTO users (nom, prenom, age, profession, email)
        VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(nom, prenom, age, profession, email);
    console.log('Utilisateur ajouté avec succès. ID :', result.lastInsertRowid);
    res.json({ id: result.lastInsertRowid });
});
app.delete('/users/:id', (req, res) => {
    const stmt = db.prepare("DELETE FROM users WHERE id = ?");
    const result = stmt.run(req.params.id);
    res.json({ changes: result.changes });
});
app.put('/users/:id', (req, res) => {
    const { nom, prenom, age, profession, email } = req.body;
    const stmt = db.prepare(`UPDATE users SET nom = ?, prenom = ?, age = ?, profession = ?, email = ? WHERE id = ?`);
    const result = stmt.run(nom, prenom, age, profession, email, req.params.id);
    res.json({ message: "Utilisateur mis à jour" });
});

// Démarrer le serveur
app.listen(port, () => console.log(`Server running on port ${port}`));
