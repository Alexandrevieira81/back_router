import { openDb } from "../configDB.js";
import sqlite3 from 'sqlite3';

const dbx = await openDb();

export async function createTableSegmentos() {
    await dbx.exec('PRAGMA foreign_keys = 1;CREATE TABLE IF NOT EXISTS segmentos(id INTEGER Primary key AUTOINCREMENT,distancia REAL, ponto_inicial int,ponto_final int,direcao VARCHAR(20),status BOOL,FOREIGN KEY(ponto_inicial) REFERENCES pontos(id),FOREIGN KEY(ponto_final) REFERENCES pontos(id) ON DELETE CASCADE)');
};

export async function insertSegmentos(req, res) {
    let segmento;

    try {

        segmento = req.body;
        console.log("CADASTRANDO segmentos");
        console.log(segmento);

        await dbx.get('INSERT INTO segmentos(distancia, direcao, ponto_inicial, ponto_final,status) VALUES (?,?,?,?,?)', [segmento.distancia, segmento.direcao, segmento.ponto_inicial, segmento.ponto_final, segmento.status]);
        res.status(200).json({
            "success": true,
            "message": "Segmento cadastrado com Sucesso."
        });

    } catch (error) {

        res.status(400).json({
            "success": false,
            "message": "Não foi possível cadastrar o Segmento."
        });
    }

}
export async function selectSegmentos(req, res) {


    let db = new sqlite3.Database('./database.db');

    try {


        console.log("Selecionando Todos Os Segmentos");

        /*    db.all('SELECT * FROM segmentos', function (err, row) {
               console.log(row);
               res.status(200).json({ segmentos: row, "success": true, "message": "Segmentos Encontrados!." });
   
           }); */

        let sql = 'SELECT segmentos.id, pontos_iniciais.nome AS ponto_inicial, pontos_finais.nome AS ponto_final,segmentos.distancia,segmentos.direcao,segmentos.status FROM segmentos INNER JOIN pontos AS pontos_iniciais ON segmentos.ponto_inicial = pontos_iniciais.id INNER JOIN pontos AS pontos_finais ON segmentos.ponto_final = pontos_finais.id';

        db.all(sql, function (err, row) {
            console.log(row);
            res.status(200).json({ segmentos: row, "success": true, "message": "Segmentos Encontrados!." });

        });

    } catch (error) {
        res.status(400).json({
            "success": false,
            "message": "Não foi Possível Caregar os Segmentos."
        });
    }
}

export async function selectSegmentosID(req, res) {
    let segmento;
   

    let db = new sqlite3.Database('./database.db');

    try {

        let segmento = req.params.id;
        console.log("Selecionado Segmento pelo ID");
        console.log(segmento);


        let sql = 'SELECT segmentos.id, pontos_iniciais.nome AS ponto_inicial, pontos_finais.nome AS ponto_final,segmentos.distancia,segmentos.direcao,segmentos.status FROM segmentos INNER JOIN pontos AS pontos_iniciais ON segmentos.ponto_inicial = pontos_iniciais.id INNER JOIN pontos AS pontos_finais ON segmentos.ponto_final = pontos_finais.id WHERE segmentos.id=?';

        db.get(sql, [segmento], function (err, row) {

            if (row) {
                console.log(row);
                res.status(200).json({ segmento: row, "success": true, "message": "Segmentos Encontrados!." });

            } else {
                res.status(403).json({
                    "success": false,
                    "message": "Não existe segmento com este código."
                });

            }


        });

    } catch (error) {
        res.status(403).json({
            "success": false,
            "message": "Não foi Possível Caregar os Segmentos."
        });
    }
}

export async function updateSegmentos(req, res) {
    let segmento;
    
    let db = new sqlite3.Database('./database.db');
    try {

        segmento = req.body;
        console.log("Atualizando Segmento ID");
        console.log(req.params.id);
        console.log("Dados da Atualização");
        console.log(segmento);
        
        db.get('UPDATE segmentos SET distancia=?, ponto_inicial=?, ponto_final=?, direcao=?, status=? WHERE id=?', [segmento.distancia, segmento.ponto_inicial, segmento.ponto_final, segmento.direcao, segmento.status, req.params.id], function (err, row) {

            if (!err) {
                res.status(200).json({
                    "success": true,
                    "message": "Segmento Alterado com Sucesso."
                });

            } else {
                res.status(403).json({
                    "success": false,
                    "message": "Não foi possível Alterar o Segmento."
                });
            }
        });

    } catch (error) {

        res.status(403).json({
            "success": false,
            "message": "Não foi possível Alterar o Segmento."
        });
    } finally {

        db.close;
    }

}

export async function deleteSegmento(req, res) {

    let db = new sqlite3.Database('./database.db');
    try {
        console.log("Deletando Segmento ID");
        console.log(req.params.id);

        if (!req.params.id) {

            res.status(403).json({
                "success": false,
                "message": "Informe o Código do Segmento..."
            })

        } else {

            db.get('DELETE FROM segmentos WHERE id=?', [req.params.id], function (err, row) {
                res.status(200).json({
                    "success": true,
                    "message": "O Segmento foi apagado com sucesso."
                })

            });
        }

    } catch (error) {

        res.status(403).json({
            "success": false,
            "message": "Segmento Inexistente..."
        })

    } finally {

        db.close;
    }


}