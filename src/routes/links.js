const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', isLoggedIn, (req, res) => {    
    res.render('links/add')
});

/* //ADD PARCEIRO
router.post('/add', isLoggedIn,  async (req, res) => {    
    const nome = req.body.nome;
    const endereco = req.body.endereco;
    await pool.query(`INSERT INTO sankhya.AD_TBPARCEIRO (NOME, ENDERECO) VALUES('${nome}','${endereco}')`);
    req.flash('success', 'Parceiro Adicionado com Sucesso!!!!')
    res.redirect('/links')
    
}); */

router.get('/teste', isLoggedIn, async (req, res) => {
    const idlogin = req.user.CODLOGIN  
    const links = await pool.query(`SELECT distinct L.NUM_CONTRATO, PAR.NOMEPARC, PAR.CODPARC
    FROM sankhya.AD_TBACESSO L 
    INNER JOIN sankhya.TCSCON CON ON (L.NUM_CONTRATO = CON.NUMCONTRATO) 
    INNER JOIN sankhya.TGFPAR PAR ON (PAR.CODPARC = CON.CODPARC) 
    WHERE L.ID_LOGIN = ${idlogin}`);     
    
    res.render('links/testes',{lista: links.recordset})

});


//ADD OS
router.post('/teste', isLoggedIn,  async (req, res) => {    

    const links = await pool.query('select top (1) NUMOS +1 as NUMOS from sankhya.TCSOSE order by numos desc');  
    const numos = Object.values(links.recordset[0])    

    const texto = req.body.texto;
    const contrato = req.body.contrato; 
    const parceiro = req.body.codparc;

    await pool.query(`INSERT INTO sankhya.TCSOSE (NUMOS,NUMCONTRATO,DHCHAMADA,DTPREVISTA,CODPARC,CODCONTATO,CODATEND,CODUSURESP,DESCRICAO,SITUACAO,CODCOS,CODCENCUS) VALUES 
    ('${numos}','${contrato}',GETDATE(),GETDATE(),'${parceiro}',1,12,569,'${texto}','P',35,30101);
    INSERT INTO SANKHYA.TCSITE (NUMOS,NUMITEM,CODSERV,CODPROD,CODUSU,CODOCOROS,CODUSUREM,DHENTRADA,DHPREVISTA,CODSIT) VALUES 
    ('${numos}',1,978,3242,569,66,569,GETDATE(),GETDATE(),97)`);

    /* await pool.query(`INSERT INTO SANKHYA.TCSITE (NUMOS,NUMITEM,CODSERV,CODPROD,CODUSU,CODOCOROS,CODUSUREM,DHENTRADA,DHPREVISTA,CODSIT) VALUES 
    (285990,1,978,3242,569,66,569,GETDATE(),GETDATE(),97)`); */
/* 
    await pool.query(`INSERT INTO SANKHYA.TCSITE (NUMOS,NUMITEM,CODSERV,CODPROD,CODUSU,CODOCOROS,CODUSUREM,DHENTRADA,DHPREVISTA,CODSIT) VALUES 
    (285988,1,978,3242,569,66,569,GETDATE(),GETDATE(),97)`); */
    
    //res.send('recebido')
    
    req.flash('success', 'Ordem De Serviço Criada com Sucesso!!!!')
    res.redirect('/links')
    
});

//LISTAR PARCEIRO
/* router.get('/', isLoggedIn,  async (req, res) => {
    const links = await pool.query('SELECT * FROM sankhya.AD_TBPARCEIRO');
    res.render('links/list', { lista: links.recordset });
}); */

router.get('/', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    C.NUMCONTRATO, 
    P.NOMEPARC,    
    O.NUMOS, 
    I.NUMITEM,
    USU.NOMEUSU AS EXECUTANTE,
    CONVERT(VARCHAR(30),O.DHCHAMADA,113) AS ABERTURA,
    CONVERT(NVARCHAR(MAX),O.DESCRICAO)AS DEFEITO
    FROM sankhya.TCSOSE O
    INNER JOIN sankhya.TCSCON C ON (C.NUMCONTRATO=O.NUMCONTRATO)
    INNER JOIN sankhya.AD_TBACESSO AC ON (C.NUMCONTRATO=AC.NUM_CONTRATO)
    INNER JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.TCSITE I ON (O.NUMOS=I.NUMOS)
    INNER JOIN SANKHYA.TSIUSU USU ON (USU.CODUSU = I.CODUSU)
    WHERE 
    O.NUFAP IS NULL
    AND I.TERMEXEC IS NULL
    AND I.NUMITEM = (SELECT MAX(NUMITEM) FROM SANKHYA.TCSITE WHERE NUMOS = O.NUMOS AND TERMEXEC IS NULL)
    AND O.DHCHAMADA >= '10/09/2020'
    AND AC.ID_LOGIN= ${idlogin}`);
    res.render('links/list', { lista: links.recordset });
});

router.get('/osclose', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    C.NUMCONTRATO, 
    P.NOMEPARC,    
    O.NUMOS, 
    I.NUMITEM,
    CONVERT(VARCHAR(30),O.DHCHAMADA,113) AS ABERTURA,
    CONVERT(VARCHAR(30),O.DTFECHAMENTO,113) AS DT_FECHAMENTO,
    CONVERT(VARCHAR(30),I.TERMEXEC,113) AS DT_EXECUCAO,
    CONVERT(NVARCHAR(MAX),O.DESCRICAO)AS DEFEITO,
    CONVERT(NVARCHAR(MAX),I.SOLUCAO) AS SOLUCAO,
    U.NOMEUSU AS RESPONSAVEL,
    USU.NOMEUSU AS EXECUTANTE,
    TSIUSU.NOMEUSU AS FECHADA

    FROM sankhya.TCSOSE O
    INNER JOIN sankhya.TCSCON C ON (C.NUMCONTRATO=O.NUMCONTRATO)
    INNER JOIN sankhya.AD_TBACESSO AC ON (C.NUMCONTRATO=AC.NUM_CONTRATO)
    INNER JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.TCSITE I ON (O.NUMOS=I.NUMOS)
    INNER JOIN sankhya.TSIUSU     ON (TSIUSU.CODUSU = O.CODUSUFECH)
    INNER JOIN sankhya.TSIUSU USU ON (USU.CODUSU = I.CODUSU)
    INNER JOIN sankhya.TSIUSU U ON (O.CODUSURESP=U.CODUSU)

    WHERE 
    O.NUFAP IS NULL
    AND O.SITUACAO = 'F'
    AND I.TERMEXEC = (SELECT DISTINCT MAX (TERMEXEC) FROM SANKHYA.TCSITE WHERE NUMOS = O.NUMOS)
    AND O.DHCHAMADA >= '10/09/2020'
    AND AC.ID_LOGIN= ${idlogin}`);
    res.render('links/osclose', { lista: links.recordset });
});

//remover parceiro
router.get('/delete/:id', isLoggedIn,  async (req, res) => {
    const {id}  = req.params;
    await pool.query(`DELETE FROM sankhya.AD_TBPARCEIRO WHERE ID = ${id}`);
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/links');
});

//editar parceiro - exibição tela
router.get('/edit/:id', isLoggedIn,  async (req, res) => {
    const {id}  = req.params;
    const links = await pool.query(`SELECT * FROM sankhya.AD_TBPARCEIRO WHERE ID = ${id}`);
    res.render('links/edit', { lista: links.recordset[0] })
    /*//req.flash('success', 'Link Removed Successfully');
    res.redirect('/links'); */
});

//update
router.post('/edit/:id', async (req, res) => {
    const {id} = req.params;
    const nome = req.body.nome.substring(0,100);
    const endereco = req.body.endereco.substring(0,100);
    await pool.query(`UPDATE sankhya.AD_TBPARCEIRO set NOME=${nome} ENDERECO=${endereco} WHERE ID = ${id}`);
    /* req.flash('success', 'Link Updated Successfully'); */
    res.redirect('/links');
});


module.exports = router; 