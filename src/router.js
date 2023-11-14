import { Router } from "express";
import { insertUsuarios, selectAllUser, selectUser, updateUsuarios, deleteUsuarios, usuarioLogin, usuarioLogout } from './controller/Usuarios.js';
import { selectAllSegmentos, insertRota, insertSegmento, insertRotaSegmento, selectRotas } from "./controller/Rotas.js";
import { insertSegmentos, updateSegmentos, selectSegmentos, deleteSegmento } from "./controller/Segmentos.js"
import { insertPonto, selectPontos, updatePontos, deletePontos } from "./controller/Pontos.js"
import { verificarADM, verificarUSER, verificarUSERLogout } from "./funcoes.js";
const router = Router();



router.get('/', (req, res) => {

    res.send("Trabalhando com rotas.!")
})
router.post('/logout', verificarUSERLogout, usuarioLogout);
router.post('/login', usuarioLogin);

router.post('/usuarios', verificarADM, insertUsuarios);
router.get('/usuarios', verificarADM, selectAllUser);
router.get('/usuarios/:registro', verificarADM, selectUser);
router.put('/usuarios/:registro', verificarADM, updateUsuarios);
router.delete('/usuarios/:registro', verificarADM, deleteUsuarios);


router.post('/rota', insertRota);
//router.post('/segmento', insertSegmento);
router.post('/rotasegmento', insertRotaSegmento);

router.post('/segmento', verificarADM, insertSegmentos);
router.put('/segmento', verificarADM, updateSegmentos);
router.get('/segmento', selectSegmentos);
router.delete('/segmento/:id', deleteSegmento);

router.post('/pontos', insertPonto);
router.get('/pontos', selectPontos);
router.put('/pontos', updatePontos);
router.delete('/pontos/:id', deletePontos);

//seleciona todos os pontos de segmento para o usuário poder escolher sua origem e destino
router.get('/segmentos', selectAllSegmentos);

//Seleciona e calculas as rotas baseado no ponto de origem e destino
router.post('/rotas', verificarUSER, selectRotas);

export default router;