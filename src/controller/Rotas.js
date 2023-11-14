import { openDb } from "../configDB.js";
import sqlite3 from 'sqlite3';

const dbx = await openDb();

export async function createTableRota() {
    await dbx.exec('CREATE TABLE IF NOT EXISTS rota (idrota INTEGER Primary key AUTOINCREMENT, nome_rota VARCHAR(100),origem VARCHAR(50),destino VARCHAR(50))');
};


export async function createTableSegmento() {
    await dbx.exec('CREATE TABLE IF NOT EXISTS segmento(idsegmento INTEGER Primary key AUTOINCREMENT, nome VARCHAR(100),distancia int, direcao VARCHAR(20),partida VARCHAR(50),chegada VARCHAR(50),ordem INTEGER,status BOOL)');
};

export async function createTableSegmentoRota() {

    await dbx.exec('PRAGMA foreign_keys = 1; CREATE TABLE IF NOT EXISTS rotasegmento (id_rota INTEGER , id_segmento INTEGER, FOREIGN KEY(id_rota) REFERENCES rota(idrota),FOREIGN KEY(id_segmento) REFERENCES segmento(idsegmento),PRIMARY KEY(id_rota,id_segmento))');

};

export async function insertSegmento(req, res) {
    let segmento = req.body;
    console.log(segmento);
    try {

        await dbx.get('INSERT INTO segmento(nome, distancia, direcao, ponto_inicial, ponto_final, ordem, status) VALUES (?,?,?,?,?,?,?)', [segmento.nome, segmento.distancia, segmento.direcao, segmento.ponto_inicial, segmento.ponto_final, segmento.ordem, segmento.status]);
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

export async function insertRota(req, res) {
    let rota = req.body;
    console.log(rota);

    try {
        await dbx.get('INSERT INTO rota (nome_rota, origem, destino) VALUES (?,?,?)', [rota.nome_rota, rota.origem, rota.destino]);
        res.status(200).json({
            "success": true,
            "message": "Rota cadastrada com Sucesso."
        });

    } catch (error) {

        res.status(400).json({
            "success": false,
            "message": "Não foi possível cadastrar a Rota."
        });
    }
}

export async function insertRotaSegmento(req, res) {
    let rotaseg = req.body;
    console.log(rotaseg);

    try {

        await dbx.get('INSERT INTO rotasegmento (id_rota , id_segmento) VALUES (?,?)', [rotaseg.id_rota, rotaseg.id_segmento]);
        res.status(200).json({
            "success": true,
            "message": "Segmento Vinculado com Sucesso."
        });


    } catch (error) {

        res.status(400).json({
            "success": false,
            "message": "Não foi possível Vincular o Segmento."
        });
    }
}

export async function selectRotas(req, res) {
    //let origem = req.params?.origem;
    // let destino = req.params?.destino;

    let origem = req.body.origem;
    let destino = req.body.destino;


    let db = new sqlite3.Database('./database.db');
    let rota = [];
    let rota_filtrada = [];
    let flag_rota_nome;
    let flag_rota_nomeAux;
    let flag_status = 0;
    let enviado = 0;


    try {

        db.all('SELECT rota.nome_rota,segmento.nome,segmento.distancia,segmento.direcao,segmento.ponto_inicial,segmento.ponto_final,segmento.ordem,segmento.status FROM rota,segmento,rotasegmento where rota.origem=? and rota.destino=? and rotasegmento.id_rota = rota.idrota and segmento.idsegmento = rotasegmento.id_segmento', [origem, destino], function (err, row) {

            console.log(row);
            if (row != "") {
                flag_rota_nome = row[0].nome_rota;
                flag_rota_nomeAux = row[0].nome_rota;

            } else {
                res.status(400).json({
                    "success": false,
                    "message": "Informe o ponto de origem da destino da rota!"
                });
                return;
            }


            for (let i = 0; i < row.length; i++) {
                let obj = row[i];


                if (flag_rota_nomeAux !== obj.nome_rota) {
                    var temp = rota.length;
                    while (temp >= 0) {
                        rota.pop();
                        temp--;
                    }
                    flag_rota_nomeAux = obj.nome_rota;


                }
                rota.push(obj);

                if (obj.status != 1) {
                    flag_status = 1;

                } else if ((flag_status == 0) && (flag_rota_nome === obj.nome_rota)) {

                    rota_filtrada.push(obj);

                } else if ((flag_status == 0) && (flag_rota_nome !== obj.nome_rota)) {
                    for (let i = 0; i < rota_filtrada.length; i++) {
                        delete rota_filtrada[i].nome_rota;
                        delete rota_filtrada[i].nome;

                    }


                    res.status(200).json({ "success": true, "message": "Rota calculada com sucesso!.", rota: rota_filtrada });
                    enviado = 1;
                    break;

                } else if ((flag_rota_nome !== obj.nome_rota) && (flag_status == 1)) {

                    flag_rota_nome = obj.nome_rota;
                    flag_status = 0;

                    var tam = rota_filtrada.length;
                    while (tam >= 0) {
                        rota_filtrada.pop();
                        tam--;
                    }
                    rota_filtrada.push(obj);
                }

            };
            //console.log(rota_filtrada.length);
            //console.log(rota.length);

            if ((enviado == 0) && (rota_filtrada.length == rota.length)) {
                console.log("passou no rota.length");
                //let usuarios = JSON.stringify({ usuarios: row, "success": true, "message": "Não precisava de retorno aqui!." });
                for (let i = 0; i < rota_filtrada.length; i++) {
                    delete rota_filtrada[i].nome_rota;
                    delete rota_filtrada[i].nome;

                }
                res.status(200).json({ "success": true, "message": "Rota calculada com sucesso.", rota: rota_filtrada });
                //res.status(200).json(rota_filtrada);
                enviado = 1;

            } else if (enviado == 0) {

                res.status(400).json({
                    "success": false,
                    "message": "Erro ao calcular a rota!"
                });

            }
        });

    } catch (error) {
        res.status(400).json({
            "success": false,
            "message": "Erro ao calcular a rota!"
        });
    }
}



export async function selectAllSegmentos(req, res) {


    let db = new sqlite3.Database('./database.db');

    try {

        db.all('SELECT ponto_inicial, ponto_final FROM segmento ORDER BY ordem', function (err, row) {
            console.log(row);
            res.status(200).json(row);

        });

    } catch (error) {
        res.status(400).json({
            "success": false,
            "message": "Não foi Possível Caregar os Segmentos."
        });
    }
}


