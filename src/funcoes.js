import jwt from 'jsonwebtoken';
import { openDb } from "./configDB.js";
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
//import { Logados } from './controller/Logados.js';
import { logados } from './app.js';
import * as EmailValidator from 'email-validator';
const SECRET = 'alexvieira';
const dbx = await openDb();



//export let logados = new Logados();
export async function verificarADM(req, res, next) {
  //console.log("entrou no verificar ADM "+ req.body);


  let db = new sqlite3.Database('./database.db');
  let registroaux = "";
  try {
    const token = req.headers['authorization'].split(' ')[1];
    console.log("logado teste");
    console.log(logados.islogged());
    jwt.verify(token, SECRET, (err, decoded) => {


      if (req.params.registro != null) {

        registroaux = req.params.registro;

      } else {

        registroaux = req.body.registro;
      }

      if (err) {
        if ((logados.getDeslogar(token)) === 1) {
          logados.delete(token);
        }
        res.status(401).json({
          "success": false,
          "message": 'Usuário não autenticado!'
        });

        return;
      } else {
        db.get('SELECT * FROM blacklist WHERE token=?', [token], function (err, row) {

          if (row) {
            //db.close;
            if ((logados.getDeslogar(token)) === 1) {
              logados.delete(token);
            }
            res.status(401).json({
              "success": false,
              "message": 'Acesso Expirado, Favor Realizar o Login Novamente!'

            });
            return;
          } else {
            let registro = decoded.registro;

            db.get('SELECT * FROM usuario WHERE registro=?', [registro], function (err, row) {

              try {

                if (registroaux != row.registro) {
                  if (row.tipo_usuario === 0) {

                    db.close;
                    res.status(403).json({
                      "success": false,
                      "message": 'Usuário Não Autorizado!'
                    });
                    return;

                  } else {

                    next();
                  }

                } else {

                  next();
                }
              } catch (error) {

                res.status(403).json({
                  "success": false,
                  "message": "Usuário não Cadastrado, Favor Verificar o Número de Registro!"

                });

              }
            });
          }
        });
      }
    });

  } catch (error) {
    res.status(403).json({
      "success": false,
      "message": "Erro no formato do cabeçalho!"

    });

  } finally {
    db.close;

  }

};

export async function verificarUSER(req, res, next) {

  let db = new sqlite3.Database('./database.db');
  //console.log("Passou pelo verifica user");

  try {

    const token = req.headers['authorization'].split(' ')[1];
    console.log("Chegou a requisção no verificarUser");
    console.log(req.headers);
    jwt.verify(token, SECRET, (err, decoded) => {

      if (err) {
        if ((logados.getDeslogar(token)) === 1) {
          logados.delete(token);
        }
        res.status(401).json({
          "success": false,
          "message": 'Usuário não autenticado!'
        });
        return;
      } else {
        db.get('SELECT * FROM blacklist WHERE token=?', [token], function (err, row) {
          //console.log(row);
          if (row) {

            if ((logados.getDeslogar(token)) === 1) {
              logados.delete(token);
            }

            res.status(401).json({
              "success": false,
              "message": 'Usuário não autenticado ou Acesso Expirado, Favor Realizar o Login Novamente!'
            });
            return;
          } else {

            next();
          }
        });
      }
    });

  } catch (error) {
    res.status(403).json({
      "success": false,
      "message": "Erro no formato do cabeçalho!"

    });
  } finally {
    db.close;
  }
};

export async function verificarUSERLogout(req, res, next) {

  let db = new sqlite3.Database('./database.db');


  try {
    const token = req.headers['authorization'].split(' ')[1];
    console.log("Chegou token no Verificarlogout")
    console.log(token);
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {

        if ((logados.getDeslogar(token)) === 1) {
          logados.delete(token);
        }
        res.status(401).json({
          "success": false,
          "message": 'Usuário não autenticado'
        });

      } else {
        db.get('SELECT * FROM blacklist WHERE token=?', [token], function (err, row) {

          if (row) {
            if ((logados.getDeslogar(token)) === 1) {
              logados.delete(token);
            }

            res.status(401).json({
              "success": false,
              "message": 'Usuário não autenticado ou Acesso Expirado, Favor Realizar o Login Novamente!'
            });
            return;
          } else {

            next();
          }
        });
      }
    });

  } catch (error) {
    res.status(403).json({
      "success": false,
      "message": "Erro no formato do cabeçalho!"

    });
  } finally {
    db.close;
  }

};

export async function criarHash(senha) {
  const saltRounds = 6;
  const salt = bcrypt.genSaltSync(saltRounds);
  const result = await bcrypt.hash(senha, salt);
  //console.log(result)
  return result;

}


export async function verificarCadastro(pessoa) {
  let erros = [];

  try {
    console.log("Verifica campos ", pessoa);
    let registro = String(pessoa.registro);
    // registro= registro.trim();
    console.log(registro);

    if (pessoa.registro == "") {
      erros.push("Informe o Código do Usuário");

    }

    if (pessoa.senha == "d41d8cd98f00b204e9800998ecf8427e") {
      erros.push("Senha não pode ser vazia");

    }


    if (isNaN(pessoa.registro)) {
      erros.push("O Registro Aceita Apenas Números");


    }
    /*  if ((registro.length) != 7) {
       erros.push("O registro Precisa conter 7 números");
 
 
     } */
    if ((pessoa.nome === null) || (pessoa.email === null) || (pessoa.senha === null) || (pessoa.registro === null) || (pessoa.tipo_usuario === null)) {
      erros.push("Informe o Todos os Campos");


    }
    if (!(EmailValidator.validate(pessoa.email))) {
      erros.push("Email inválido");

    }
    if ((pessoa.nome === "") || (pessoa.email === "") || (pessoa.senha === "") || (pessoa.registro === "") || (pessoa.tipo_usuario === "")) {
      erros.push("Não Podem Existir Campos Vazios");


    }
    if ((pessoa.nome === " ") || (pessoa.email === " ") || (pessoa.senha === " ") || (pessoa.registro === " ") || (pessoa.tipo_usuario === " ")) {
      erros.push("Não Podem Existir Campos Vazios");


    }


  } catch (error) {
    erros.push("Quebra de protocolo");
    console.log("Quebra de protocolo")

  } finally {
    return erros;

  }

}
export async function verificarCadastroSegmento(segmento) {
  let erros = [];
  let distancia;

  if (typeof segmento.distancia === "number") {
    distancia = (String(segmento.distancia));


  } else {
    distancia = segmento.distancia;

  }


  if (isNaN(distancia)) {
    erros.push("A distância Aceita Apenas Números");

  }
  if (isNaN(segmento.status)) {
    erros.push("O Status Aceita Apenas Números");

  }

  if ((segmento.status != 1) && (segmento.status != 0)) {
    erros.push("O Status Aceita Apenas 0 ou 1");

  }

  if ((segmento.distancia === "") || (segmento.ponto_inicial === "") || (segmento.ponto_final === "") || (segmento.status === "") || (segmento.direcao === "")) {
    erros.push("Não Podem Existtir Campos Vazios");

  }

  if ((segmento.distancia === " ") || (segmento.ponto_inicial === " ") || (segmento.ponto_final === " ") || (segmento.status === " ") || (segmento.direcao === " ")) {
    erros.push("Não Podem Existtir Campos Vazios");

  }
  if ((segmento.distancia === null) || (segmento.ponto_inicial === null) || (segmento.ponto_final === null) || (segmento.status === null) || (segmento.direcao === null)) {
    erros.push("Não Podem Existtir Campos Nulos");

  }
  return erros;

}

export async function verificarCadastroPontos(ponto) {
  let erros = [];

  if (ponto.nome === "") {
    erros.push("Não Podem Existtir Campos Vazios");
  }
  if (ponto.nome === " ") {
    erros.push("Não Podem Existtir Campos Vazios");
  }
  if (ponto.nome === null) {
    erros.push("Não Podem Existtir Campos Nulos");
  }
  return erros;

}

export async function verificarLastADM() {

  let db = new sqlite3.Database('./database.db');
  let contador;

  try {

    let row = await dbx.get('SELECT COUNT(*) FROM usuario WHERE tipo_usuario = 1');

    contador = row['COUNT(*)'];


    console.log("QUANTIDADE DE ADMINISTRADORES ENCONTRADOS " + contador);
    return contador;

  } catch (error) {
    console.log("Erro ao Verificar Existência de Administradores no Banco de Dados");

  } finally {

    db.close;
  }




}


