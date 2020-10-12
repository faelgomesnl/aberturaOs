const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', isLoggedIn, (req, res) => {    
    res.render('links/add')
});

router.get('/teste', isLoggedIn, async (req, res) => {
    const idlogin = req.user.CODLOGIN  
    const links = await pool.query(`SELECT distinct L.NUM_CONTRATO, PAR.NOMEPARC, 
    PAR.CODPARC, PD.DESCRPROD, PS.CODPROD, sla.NUSLA, CON.CODUSUOS, 
    CONVERT(VARCHAR(19), GETDATE(), 120) as DATA, 
    CASE sla.NUSLA 
    WHEN 3 THEN DATEADD (HH, 4, CONVERT(VARCHAR(19), GETDATE(), 120))    
    WHEN 4 THEN DATEADD (HH, 6, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 5 THEN DATEADD (HH, 8, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 6 THEN DATEADD (HH, 18, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 7 THEN DATEADD (HH, 12, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 8 THEN DATEADD (HH, 12, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 10 THEN DATEADD (HH, 20, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 11 THEN DATEADD (HH, 16, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 13 THEN DATEADD (HH,24, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 15 THEN DATEADD (HH, 24, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 16 THEN DATEADD (HH, 72, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 17 THEN DATEADD (HH, 2, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 18 THEN DATEADD (HH, 0, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 19 THEN DATEADD (HH,48, CONVERT(VARCHAR(19), GETDATE(), 120)) 
    WHEN 21 THEN DATEADD (HH, 2, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 23 THEN DATEADD (HH,16, CONVERT(VARCHAR(19), GETDATE(), 120)) 
    WHEN 23 THEN DATEADD (HH, 12, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 24 THEN DATEADD (HH, 12, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 25 THEN DATEADD (HH, 4, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 26 THEN DATEADD (HH, 18, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 27 THEN DATEADD (HH, 12, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 28 THEN DATEADD (HH, 18, CONVERT(VARCHAR(19), GETDATE(), 120))
    WHEN 29 THEN DATEADD (HH, 8, CONVERT(VARCHAR(19), GETDATE(), 120))           
    WHEN 30 THEN DATEADD (HH, 24, CONVERT(VARCHAR(19), GETDATE(), 120))    
  END PREVISAO

    FROM sankhya.AD_TBACESSO L 
    INNER JOIN sankhya.TCSCON CON ON (L.NUM_CONTRATO = CON.NUMCONTRATO) 
    INNER JOIN sankhya.TGFPAR PAR ON (PAR.CODPARC = CON.CODPARC) 
    INNER JOIN sankhya.TCSPSC PS ON (CON.NUMCONTRATO=PS.NUMCONTRATO)
    INNER JOIN sankhya.TGFPRO PD ON (PD.CODPROD=PS.CODPROD)
    INNER JOIN sankhya.TCSSLA SLA ON (SLA.NUSLA = CON.NUSLA)
    WHERE L.ID_LOGIN = ${idlogin}
    AND PD.USOPROD='S' 
    AND PS.SITPROD IN ('A','B')
    AND CON.ATIVO = 'S'`); 

    res.render('links/testes',{lista: links.recordset})

});

/* router.get('/teste', isLoggedIn, async (req, res) => {
    const idlogin = req.user.CODLOGIN  
    const links2 = await pool.query(`SELECT distinct PS.CODPROD, PD.DESCRPROD
    FROM sankhya.AD_TBACESSO L 
    INNER JOIN sankhya.TCSCON CON ON (L.NUM_CONTRATO = CON.NUMCONTRATO) 
    INNER JOIN sankhya.TGFPAR PAR ON (PAR.CODPARC = CON.CODPARC) 
    INNER JOIN sankhya.TCSPSC PS ON (CON.NUMCONTRATO=PS.NUMCONTRATO)
    INNER JOIN sankhya.TGFPRO PD ON (PD.CODPROD=PS.CODPROD)
    WHERE L.ID_LOGIN = ${idlogin}`);

    res.render('links/testes',{lista2: links2.recordset})

}); */


//ADD OS
router.post('/teste', isLoggedIn,  async (req, res) => {    

    const links = await pool.query('select top (1) NUMOS +1 as NUMOS from sankhya.TCSOSE order by numos desc');  
    const numos = Object.values(links.recordset[0])    

    const texto = req.body.texto;
    const contrato = req.body.contrato; 
    const parceiro = req.body.codparc;
    const produto = req.body.codprod; 
    const dtprevisao = req.body.dtprevisao;
    const codosweb = req.body.codosweb; 

    await pool.query(`INSERT INTO sankhya.TCSOSE (NUMOS,NUMCONTRATO,DHCHAMADA,DTPREVISTA,CODPARC,CODCONTATO,CODATEND,CODUSURESP,DESCRICAO,SITUACAO,CODCOS,CODCENCUS,CODOAT) VALUES 
    ('${numos}','${contrato}',GETDATE(),'2020-10-07 14:27:18.077','${parceiro}',1,110,110,'${texto}','P','',30101,1000000);
    INSERT INTO SANKHYA.TCSITE (NUMOS,NUMITEM,CODSERV,CODPROD,CODUSU,CODOCOROS,CODUSUREM,DHENTRADA,DHPREVISTA,CODSIT,COBRAR,RETRABALHO) VALUES 
    ('${numos}',1,4381,'${produto}','${codosweb}',900,569,GETDATE(),'2020-08-10 14:27:18.077',15,'N','N')`);   
    
    req.flash('success', 'Ordem De Serviço Criada com Sucesso!!!!')
    res.redirect('/links')
    
});

router.get('/', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    C.NUMCONTRATO, 
    P.NOMEPARC,    
    O.NUMOS, 
    I.NUMITEM,
    USU.NOMEUSU AS EXECUTANTE,
    CONVERT(VARCHAR(30),O.DHCHAMADA,120) AS ABERTURA,
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
    res.redirect('/links');
});

module.exports = router; 