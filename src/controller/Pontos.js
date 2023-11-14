import { openDb } from "../configDB.js";
import sqlite3 from 'sqlite3';

const dbx = await openDb();

export async function createTablePontos() {
    await dbx.exec('CREATE TABLE IF NOT EXISTS pontos (id INTEGER Primary key AUTOINCREMENT, nome VARCHAR(100) NOT NULL UNIQUE)');
};


export async function insertPonto(req, res) {
    let ponto = req.body;
    console.log(ponto.nome);
    try {

        await dbx.get('INSERT INTO pontos(nome) VALUES (?)', [ponto.nome]);
        res.status(200).json({
            "success": true,
            "message": "Ponto cadastrado com Sucesso."
        });

    } catch (error) {

        res.status(400).json({
            "success": false,
            "message": "Não foi possível cadastrar o Ponto."
        });
    }

}

export async function selectPontos(req, res) {
    let pontos = req.body;
    console.log(pontos);

    let db = new sqlite3.Database('./database.db');

    try {

        db.all('SELECT * FROM pontos', function (err, row) {
            console.log(row);
            res.status(200).json({ pontos: row, "success": true, "message": "Pontos Encontrados!." });

        });

    } catch (error) {
        res.status(400).json({
            "success": false,
            "message": "Não foi Possível Caregar os Pontos."
        });
    }finally{
        db.close;
    }
}

export async function updatePontos(req, res) {
    let pontos = req.body;
    console.log(pontos);
    let db = new sqlite3.Database('./database.db');
    try {

        db.get('UPDATE pontos SET nome=? WHERE id=?', [pontos.nome, pontos.id], function (err, row) {

            if (!err) {
                res.status(200).json({
                    "success": true,
                    "message": "Ponto Alterado com Sucesso."
                });

            } else {
                res.status(400).json({
                    "success": false,
                    "message": "Não foi possível Alterar o Ponto."
                });
            }
        });

    } catch (error) {

        res.status(400).json({
            "success": false,
            "message": "Não foi possível Alterar o Ponto."
        });
    } finally {

        db.close;
    }

}

export async function deletePontos(req, res) {

    let db = new sqlite3.Database('./database.db');
    try {

        if (!req.params.id) {

            res.status(400).json({
                "success": false,
                "message": "Informe o Código do Ponto..."
            })

        } else {

            db.get('DELETE FROM pontos WHERE id=?', [req.params.id], function (err, row) {
                res.status(200).json({
                    "success": true,
                    "message": "O Ponto foi apagado com sucesso."
                })

            });
        }

    } catch (error) {

        res.status(400).json({
            "success": false,
            "message": "Ponto Inexistente..."
        })

    } finally {

        db.close;
    }


}