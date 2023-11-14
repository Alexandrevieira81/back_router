import { openDb } from "../configDB.js";
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import { criarHash, verificarCadastro, logados } from "../funcoes.js";
import bcrypt from 'bcrypt';
const SECRET = 'alexvieira';
const dbx = await openDb();

export async function createTableUsuarios() {

    await dbx.exec('CREATE TABLE IF NOT EXISTS pontos (id INTEGER Primary key AUTOINCREMENT, nome VARCHAR(100) NOT NULL UNIQUE)');

}

export async function createTableBlacklist() {

    await dbx.exec('CREATE TABLE IF NOT EXISTS blacklist (id INTEGER Primary key AUTOINCREMENT, token TTL)')

}

export async function usuarioLogout(req, res) {
    let registro;
    try {


        const token = req.headers['authorization'].split(' ')[1];

        jwt.verify(token, SECRET, (err, decoded) => {
            registro = decoded.registro;


        });
        console.log("Usuário " + registro + " Está tentado deslogar utilizando o token " + token);
        if (logados.get(registro) === -1) {

            res.status(403).json({
                "success": false,
                "message": "Problemas ao Deslogar Usuário não está Logado",

            });

        } else {

            await dbx.run('INSERT INTO blacklist (token) VALUES (?)', [token]);

            res.status(200).json({
                "success": true,
                "message": "Deslogado com sucesso.",

            });

            logados.delete(registro);
            listarUsuarios();

        }

    } catch (error) {

        res.status(403).json({
            "success": false,
            "message": "Problemas ao Deslogar",

        });

    }

    return;
}


export async function usuarioLogin(req, res) {

    let db = new sqlite3.Database('./database.db');

    try {
        let log = JSON.stringify(req.body);
        console.log("Login " + log);

        if (logados.get(req.body.registro) === false) {

            db.get('SELECT * FROM usuario WHERE registro=?', [req.body.registro], function (err, row) {

                if ((row) && (bcrypt.compareSync(req.body.senha, row.senha))) {

                    logados.add(row.registro);
                    const token = jwt.sign({ registro: row.registro }, SECRET, { expiresIn: 3000 });
                    res.status(200).json({
                        "registro": row.registro,
                        "success": true,
                        "message": "Login realizado com sucesso.",
                        token
                    });
                    listarUsuarios();
                } else {
                    res.status(403).json({
                        "success": false,
                        "message": "Não foi possível realizar o Login Verifique suas credenciais."
                    });
                }
            });

        } else {
            res.status(403).json({
                "success": false,
                "message": "Problemas ao Logar Usuário já está Logado",
            });
        }

    } catch (error) {

        res.status(403).json({
            "success": false,
            "message": "Ocorreu uma exceção realizar o Login Verifique suas credenciais."
        });

    } finally {
        db.close;

    }
}

export async function insertUsuarios(req, res) {
    let pessoa;
    let erros;

    try {

        pessoa = req.body;
        erros = await verificarCadastro(pessoa);
        console.log(erros);
        console.log("Inserção de usuários DADOS " + JSON.stringify(req.body));

        if (erros.length == 0) {
            pessoa.senha = await criarHash(pessoa.senha);
            await dbx.get('INSERT INTO usuario (registro, nome, email, senha, tipo_usuario) VALUES (?,?,?,?,?)', [pessoa.registro, pessoa.nome, pessoa.email, pessoa.senha, pessoa.tipo_usuario]);
            res.status(200).json({
                "success": true,
                "message": "Usuário cadastrado com Sucesso."
            });

        } else {

            res.status(403).json({
                "success": false,
                "message": erros
            });
        }


    } catch (error) {

        res.status(403).json({
            "success": false,
            "message": "Não foi possível cadastrar o usuário."
        });
    }
}

export async function updateUsuarios(req, res) {
    let pessoa;
   // let erros;
    let db = new sqlite3.Database('./database.db');

    try {

        pessoa = req.body;
        //erros = await verificarCadastro(pessoa);
        //console.log(erros);
        console.log("Atualização de usuários DADOS " + JSON.stringify(req.body));

       // if (erros.length == 0) {
            pessoa.senha = await criarHash(pessoa.senha);
            db.get('SELECT * FROM usuario WHERE registro=?', req.params.registro, function (err, row) {

                if (row) {


                    db.get('UPDATE usuario SET nome=?,email=?, senha=? WHERE registro=?', [pessoa.nome, pessoa.email, pessoa.senha, req.params.registro], function (err, row) {
                        res.status(200).json({
                            "success": true,
                            "message": "Cadastro Alterado com Sucesso"
                        })
                    });



                } else {
                    res.status(403).json({
                        "success": false,
                        "message": "Informe um Registro Válido!"
                    });
                }

            });

        //} else {
         //   res.status(403).json({
         //       "success": false,
          //      "message": erros
        //    });

       // }

    } catch (error) {

        res.status(403).json({
            "success": false,
            "message": "Erro no formato do cabeçalho!"
        });

    } finally {
        db.close;
    }
}
//FUNÇÃO PARA UPDATE COM DADOS COMPLETOS
/*    try {
       pessoa = req.body;
       erros = await verificarCadastro(pessoa);
       const token = req.headers['authorization'].split(' ')[1];

       if (erros.length == 0) {

           pessoa.senha = await criarHash(pessoa.senha);

           db.get('SELECT * FROM usuario WHERE registro=?', req.params.registro, function (err, row) {

               if (row) {

                   jwt.verify(token, SECRET, (err, decoded) => {
                       db.get('SELECT * FROM usuario WHERE registro=?', decoded.registro, function (err, row) {

                           if (row.tipo_usuario === 1) {
                               db.get('UPDATE usuario SET nome=?, registro=?, email=?, senha=?, tipo_usuario=? WHERE registro=?', [pessoa.nome, req.params.registro, pessoa.email, pessoa.senha, pessoa.tipo_usuario, req.params.registro], function (err, row) {
                                   res.status(200).json({
                                       "success": true,
                                       "message": "Cadastro Alterado com Sucesso"
                                   })
                               });
                           } else if ((pessoa.tipo_usuario === 1) && (row.tipo_usuario === 0)) {
                               res.status(403).json({
                                   "success": false,
                                   "message": "Você Não Tem Autorização para Mudar Seu Status"
                               })
                           } else {
                               db.get('UPDATE usuario SET nome=?, registro=?, email=?, senha=? WHERE registro=?', [pessoa.nome, req.params.registro, pessoa.email, pessoa.senha, req.params.registro], function (err, row) {
                                   res.status(200).json({
                                       "success": true,
                                       "message": "Cadastro Alterado com Sucesso"
                                   })
                               });

                           }
                       });
                   });



               } else {
                   res.status(403).json({
                       "success": false,
                       "message": "Informe um Registro Válido!"

                   });

               }


           });

       } else {
           res.status(403).json({
               "success": false,
               "message": erros
           });

       }

   } catch (error) {
       res.status(403).json({
           "success": false,
           "message": "Erro no formato do cabeçalho!"

       });
   } finally {
       db.close;

   }
} */

export async function selectAllUser(req, res,) {

    let db = new sqlite3.Database('./database.db');


    try {
        //console.log(" Solicitação de Lista de Usuários " + JSON.stringify(req.headers));

        db.all('SELECT nome,registro,email,tipo_usuario  FROM usuario', function (err, row) {

            let usuarios = JSON.stringify({ usuarios: row, "success": true, "message": "Lista de Usuários!." });

            res.status(200).json(JSON.parse(usuarios));

        });

    } catch (error) {
        res.status(403).json({
            "success": false,
            "message": "Não existem usuários cadastrados."
        });
    } finally {
        db.close;
    }
}

export async function selectUser(req, res) {

    let db = new sqlite3.Database('./database.db');

    try {
        //console.log(" Solicitação dos dados de Usuário " + JSON.stringify(req.headers));

        db.get('SELECT nome,registro,email,tipo_usuario  FROM usuario where registro=?', [req.params.registro], function (err, row) {

            if (row) {

                let usuario = JSON.stringify({ usuario: row, "success": true, "message": "Usuário Encontrado!." });

                //console.log(usuario);

                res.status(200).json(JSON.parse(usuario));

            } else {

                let usuario = JSON.stringify({ "success": false, "message": "Usuário Não Localizado!." });

                res.status(403).json(JSON.parse(usuario));
            }

        });

    } catch (error) {
        res.status(403).json({
            "success": false,
            "message": "Não existem usuários cadastrados."
        });
    } finally {
        db.close;
    }
}


export async function deleteUsuarios(req, res) {

    let db = new sqlite3.Database('./database.db');
    
    try {
        console.log("DELETAR O USUÁRIO ", req.params.registro)

        if (!req.params.registro) {

            res.status(403).json({
                "success": false,
                "message": "Informe o REGISTRO do Usuário..."
            })

        } else {

            db.get('DELETE FROM usuario WHERE registro=?', [req.params.registro], function (err, row) {
                res.status(200).json({
                    "success": true,
                    "message": "O Usuário foi apagado com sucesso."
                })

            });
        }

    } catch (error) {

        res.status(403).json({
            "success": false,
            "message": "Usuário Inexistente..."
        })

    } finally {

        db.close;
    }

}
async function listarUsuarios() {
    let db = new sqlite3.Database('./database.db');

    try {
        let log = logados.islogged();
        console.log("Usuários Logados")
        for (let i = 0; i < log.length; i++) {

            db.get('SELECT * FROM usuario WHERE registro=?', log[i], function (err, row) {


                console.log(row.registro);
                console.log(row.nome);
                console.log("___________________________________________")


            });

        }

    } catch (error) {

        console.log("Ocorreu um problema com a lista de usuários logados")
    } finally {
        db.close;
    }


}
