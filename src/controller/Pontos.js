import { openDb } from "../configDB.js";
import sqlite3 from 'sqlite3';

const dbx = await openDb();

export async function createTablePontos() {
    await dbx.exec('CREATE TABLE IF NOT EXISTS pontos (id INTEGER Primary key AUTOINCREMENT, nome VARCHAR(100) NOT NULL UNIQUE)');
};


export async function insertPonto(req, res) {
    let ponto;

    try {
        ponto = req.body;
        console.log("Cadastrando Ponto");
        console.log(ponto);

        await dbx.get('INSERT INTO pontos(nome) VALUES (?)', [ponto.nome]);
        res.status(200).json({
            "success": true,
            "message": "Ponto cadastrado com Sucesso."
        });

    } catch (error) {

        res.status(403).json({
            "success": false,
            "message": "Não foi possível cadastrar o Ponto."
        });
    }

}

export async function selectPontos(req, res) {
    
    let db = new sqlite3.Database('./database.db');

    try {

        
        console.log("Selecionando Todos os Pontos");
        

        db.all('SELECT * FROM pontos', function (err, row) {
            console.log(row);
            res.status(200).json({ pontos: row, "success": true, "message": "Pontos Encontrados!." });

        });

    } catch (error) {
        res.status(403).json({
            "success": false,
            "message": "Não foi Possível Caregar os Pontos."
        });
    } finally {
        db.close;
    }
}

export async function selectPontosID(req, res) {
    let pontosID;
    

    let db = new sqlite3.Database('./database.db');

    try {

        pontosID = req.params.id;
        console.log("Selecionado ponto pelo ID");
        console.log(pontosID);

        db.get('SELECT * FROM pontos WHERE ponto_id=?', [pontosID], function (err, row) {
            console.log(row);
            res.status(200).json({ ponto: row, "success": true, "message": "Ponto Encontrado!." });

        });

    } catch (error) {
        res.status(403).json({
            "success": false,
            "message": "Não foi Possível Caregar os Pontos."
        });
    } finally {
        db.close;
    }
}

export async function updatePontos(req, res) {
    let pontos;
   
    let db = new sqlite3.Database('./database.db');
    try {

        pontos = req.body;
        console.log("Update Pontos ID");
        console.log(req.params.id);
        console.log("Dados do Update");
        console.log(pontos);

        db.get('UPDATE pontos SET nome=? WHERE ponto_id=?', [pontos.nome, req.params.id], function (err, row) {

            if (!err) {
                res.status(200).json({
                    "success": true,
                    "message": "Ponto Alterado com Sucesso."
                });

            } else {
                res.status(403).json({
                    "success": false,
                    "message": "Não foi possível Alterar o Ponto."
                });
            }
        });

    } catch (error) {

        res.status(403).json({
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
        console.log("Entrou no Deletar Ponto com o ID");
        console.log(req.params.id);

        if (!req.params.id) {

            res.status(403).json({
                "success": false,
                "message": "Informe o Código do Ponto..."
            })

        } else {

            db.get('DELETE FROM pontos WHERE ponto_id=?', [req.params.id], function (err, row) {
                res.status(200).json({
                    "success": true,
                    "message": "O Ponto foi apagado com sucesso."
                })

            });
        }

    } catch (error) {

        res.status(403).json({
            "success": false,
            "message": "Ponto Inexistente..."
        })

    } finally {

        db.close;
    }


}