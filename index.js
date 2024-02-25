const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = process.env.PORT || 3000;

const db = new sqlite3.Database('database.db');

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS devinettes (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, reponse TEXT)');
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Devinettes API');
});

app.get('/devinette', (req, res) => {
    db.get('SELECT * FROM devinettes ORDER BY RANDOM() LIMIT 1', (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).send({ message: 'Erreur interne du serveur' });
        } else {
            res.send(row);
        }
    });
});

app.get('/devinettes/:id', (req, res) => {
    const id = req.params.id;

    db.get('SELECT * FROM devinettes WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).send({ message: 'Erreur interne du serveur' });
        } else if (!row) {
            res.status(404).send({ message: 'Devinette non trouvée' });
        } else {
            res.send(row);
        }
    });
});

app.put('/devinettes/:id', (req, res) => {
    const id = req.params.id;
    const { question, reponse } = req.body;
    if (!question || !reponse) {
        res.status(400).send({message : 'Il manque des paramètres.'});
        return;
    }

    db.run('UPDATE devinettes SET question = ?, reponse = ? WHERE id = ?', [question, reponse, id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('ERREUR INTERNE DU SERVEUR');
        } else if (this.changes === 0) {
            res.status(404).send({ message: 'Devinette non trouvée' });
        } else {
            res.status(200).send({message: 'Devinette modifiée avec succès'});
        }
    });
});

app.delete('/devinettes/:id', (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM devinettes WHERE id = ?', [id], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send('ERREUR INTERNE DU SERVEUR');
        } else if (this.changes === 0) {
            res.status(404).send({ message: 'Devinette non trouvée' });
        } else {
            res.status(200).send({message : 'Devinette supprimée avec succès'});
        }
    });
});

app.post('/devinette', (req, res) => {
    const { question, reponse } = req.body;
    if (!question || !reponse) {
        res.status(400).send({message: 'Il manque des paramètres.'});
        return;
    }

    db.run('INSERT INTO devinettes (question, reponse) VALUES (?, ?)', [question, reponse], function (err) {
        if (err) {
            console.error(err);
            res.status(500).send({message: 'Erreur interne du serveur'});
        } else {
            res.status(201).send({ id: this.lastID });
        }
    });
});

app.listen(port, () => {
    console.log(`Devinettes API fonctionne sur le port ${port}`);
});
