import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import { Logados } from './controller/Logados.js';
import * as EmailValidator from 'email-validator';
const SECRET = 'alexvieira';

export let logados = new Logados();
export async function verificarADM(req, res, next) {
  //console.log("entrou no verificar ADM "+ req.body);
 

  let db = new sqlite3.Database('./database.db');
  let registroaux = "";
  try {
    const token = req.headers['authorization'].split(' ')[1];
    jwt.verify(token, SECRET, (err, decoded) => {


      if (req.params.registro != null) {

        registroaux = req.params.registro;

      } else {

        registroaux = req.body.registro;
      }

      if (err) {
        res.status(401).json({
          "success": false,
          "message": 'Usuário não autenticado!'
        });

        return;
      } else {
        db.get('SELECT * FROM blacklist WHERE token=?', [token], function (err, row) {

          if (row) {
            //db.close;
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
    console.log(token);
    jwt.verify(token, SECRET, (err, decoded) => {

      if (err) {
        res.status(401).json({
          "success": false,
          "message": 'Usuário não autenticado!'
        });
        return;
      } else {
        db.get('SELECT * FROM blacklist WHERE token=?', [token], function (err, row) {
          console.log(row);
          if (row) {

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
  //console.log(token);

  try {
    const token = req.headers['authorization'].split(' ')[1];
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        res.status(401).json({
          "success": false,
          "message": 'Usuário não autenticado'
        });

      } else {
        db.get('SELECT * FROM blacklist WHERE token=?', [token], function (err, row) {
         
          if (row) {

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



