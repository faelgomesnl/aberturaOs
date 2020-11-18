const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', isLoggedIn, (req, res) => {    
    res.render('links/add')
});

//ADICIONAR NOVO USUARIO, SOMENTE ADMIN
router.get('/newuser', isLoggedIn, (req, res) => {    
    res.render('links/newuser')
});

router.post('/newuser', isLoggedIn, (req, res) => {    
    const nomeusu = req.body.nomeusu;
    const senha = req.body.senha; 
    const fullname = req.body.fullname;

    pool.query(`INSERT INTO sankhya.AD_TBLOGIN (NOMEUSU, SENHA, fullname) VALUES('${nomeusu}','${senha}','${fullname}')`);
    
    //falta definir em qual página será direcionado no perfil do admin
    res.send('received')
});

//ADICIONAR CONTRATOS AOS NOVOS USUÁRIOS, SOMENTE ADMIN
router.get('/newcont', isLoggedIn, (req, res) => {    
    res.render('links/newcont')
});

router.post('/newcont', isLoggedIn, (req, res) => {  
    const contrato = req.body.contrato;
    const login = req.body.login; 

    pool.query(`INSERT INTO sankhya.AD_TBACESSO (NUM_CONTRATO, ID_LOGIN) VALUES('${contrato}','${login}')`);
    
    //falta definir em qual página será direcionado no perfil do admin (listagem de todos os logins cadastrados)
    res.send('received')
});

//ADD OS
router.get('/teste', isLoggedIn, async (req, res) => {
    const idlogin = req.user.CODLOGIN  
    const links = await pool.query(`SELECT distinct L.NUM_CONTRATO, PAR.NOMEPARC, 
    PAR.CODPARC, PD.DESCRPROD, PS.CODPROD, sla.NUSLA, CON.CODUSUOS 
    FROM sankhya.AD_TBACESSO L 
    INNER JOIN sankhya.TCSCON CON ON (L.NUM_CONTRATO = CON.NUMCONTRATO) 
    INNER JOIN sankhya.TGFPAR PAR ON (PAR.CODPARC = CON.CODPARC) 
    INNER JOIN sankhya.TCSPSC PS ON (CON.NUMCONTRATO=PS.NUMCONTRATO)
    INNER JOIN sankhya.TGFPRO PD ON (PD.CODPROD=PS.CODPROD)
    INNER JOIN sankhya.TCSSLA SLA ON (SLA.NUSLA = CON.NUSLA)
    WHERE L.ID_LOGIN = ${idlogin}
    AND PD.USOPROD='S' 
    AND PS.SITPROD IN ('A','B')
    OR CON.ATIVO = 'S'`); 

    res.render('links/testes',{lista: links.recordset})

});

router.post('/teste', isLoggedIn,  async (req, res) => {    

    const links = await pool.query('select top (1) NUMOS +1 as NUMOS from sankhya.TCSOSE order by numos desc');  
    const numos = Object.values(links.recordset[0])    

    const texto = req.body.texto;
    const contrato = req.body.contrato; 
    const parceiro = req.body.codparc;
    const produto = req.body.codprod; 
    //const dtprevisao = req.body.dtprevisao;
    //const codosweb = req.body.codosweb; 

    await pool.query(`INSERT INTO sankhya.TCSOSE (NUMOS,NUMCONTRATO,DHCHAMADA,DTPREVISTA,CODPARC,CODCONTATO,CODATEND,CODUSURESP,DESCRICAO,SITUACAO,CODCOS,CODCENCUS,CODOAT) VALUES 
    ('${numos}','${contrato}',GETDATE(),'2020-14-10 20:53','${parceiro}',1,110,110,'${texto}','P','',30101,1000000);
    INSERT INTO SANKHYA.TCSITE (NUMOS,NUMITEM,CODSERV,CODPROD,CODUSU,CODOCOROS,CODUSUREM,DHENTRADA,DHPREVISTA,CODSIT,COBRAR,RETRABALHO) VALUES 
    ('${numos}',1,4381,'${produto}',104,900,569,GETDATE(),'2020-14-10 20:53',15,'N','N')`);   
    
    req.flash('success', 'Ordem De Serviço Criada com Sucesso!!!!')
    res.redirect('/links')
    
});

//PAGINAS DATATABLES
//LISTAR TODAS AS OS ABERTAS
router.get('/', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    C.NUMCONTRATO, 
    P.NOMEPARC,    
    O.NUMOS, 
    I.NUMITEM,
    USU.NOMEUSU AS EXECUTANTE,
    CONVERT(VARCHAR(30),O.DHCHAMADA,120) AS ABERTURA,
    CONVERT(VARCHAR(30),O.DTPREVISTA,120) AS PREVISAO,
    CONVERT(NVARCHAR(MAX),O.DESCRICAO)AS DEFEITO,

    CONVERT(NVARCHAR(MAX),I.SOLUCAO) AS SOLUCAO,
    CID.NOMECID AS CIDADE,
    UFS.UF,
    SLA.DESCRICAO AS DESCRICAO_SLA,
    O.AD_MOTIVO_OI AS MOTIVO,
    O.AD_SOLICITANTE_OI AS SOLICITANTE,
    AD_TIPO_OI AS TIPO

    FROM sankhya.TCSOSE O
    INNER JOIN sankhya.TCSCON C ON (C.NUMCONTRATO=O.NUMCONTRATO)
    INNER JOIN sankhya.AD_TBACESSO AC ON (C.NUMCONTRATO=AC.NUM_CONTRATO)
    INNER JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.TCSITE I ON (O.NUMOS=I.NUMOS)
    INNER JOIN SANKHYA.TSIUSU USU ON (USU.CODUSU = I.CODUSU)

    LEFT JOIN SANKHYA.TCSITS ITS ON (ITS.CODSIT = I.CODSIT)
    LEFT JOIN SANKHYA.TGFCPL CPL ON (P.CODPARC = CPL.CODPARC)
    LEFT JOIN SANKHYA.TSICID CID ON (CPL.CODCIDENTREGA = CID.CODCID)
    LEFT JOIN SANKHYA.TSIUFS UFS ON (CID.UF = UFS.CODUF)
    LEFT JOIN sankhya.TCSSLA SLA ON (SLA.NUSLA = C.NUSLA)

    WHERE 
    O.NUFAP IS NULL
    AND I.TERMEXEC IS NULL
    AND I.NUMITEM = (SELECT MAX(NUMITEM) FROM SANKHYA.TCSITE WHERE NUMOS = O.NUMOS AND TERMEXEC IS NULL)
    AND O.DHCHAMADA >= '10/09/2020'
    AND AC.ID_LOGIN= ${idlogin}`);
    res.render('links/list', { lista: links.recordset });
});

//LISTAR TODAS AS OS FECHADAS
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
    TSIUSU.NOMEUSU AS FECHADA,

    CID.NOMECID AS CIDADE,
    UFS.UF,
    SLA.DESCRICAO AS DESCRICAO_SLA,
    O.AD_MOTIVO_OI AS MOTIVO,
    O.AD_SOLICITANTE_OI AS SOLICITANTE,
    AD_TIPO_OI AS TIPO

    FROM sankhya.TCSOSE O
    INNER JOIN sankhya.TCSCON C ON (C.NUMCONTRATO=O.NUMCONTRATO)
    INNER JOIN sankhya.AD_TBACESSO AC ON (C.NUMCONTRATO=AC.NUM_CONTRATO)
    INNER JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.TCSITE I ON (O.NUMOS=I.NUMOS)
    INNER JOIN sankhya.TSIUSU     ON (TSIUSU.CODUSU = O.CODUSUFECH)
    INNER JOIN sankhya.TSIUSU USU ON (USU.CODUSU = I.CODUSU)
    INNER JOIN sankhya.TSIUSU U ON (O.CODUSURESP=U.CODUSU)

    LEFT JOIN SANKHYA.TCSITS ITS ON (ITS.CODSIT = I.CODSIT)
    LEFT JOIN SANKHYA.TGFCPL CPL ON (P.CODPARC = CPL.CODPARC)
    LEFT JOIN SANKHYA.TSICID CID ON (CPL.CODCIDENTREGA = CID.CODCID)
    LEFT JOIN SANKHYA.TSIUFS UFS ON (CID.UF = UFS.CODUF)
    LEFT JOIN sankhya.TCSSLA SLA ON (SLA.NUSLA = C.NUSLA)

    WHERE 
    O.NUFAP IS NULL
    AND O.SITUACAO = 'F'
    AND I.TERMEXEC = (SELECT DISTINCT MAX (TERMEXEC) FROM SANKHYA.TCSITE WHERE NUMOS = O.NUMOS)
    AND O.DHCHAMADA >= '10/09/2020'
    AND AC.ID_LOGIN= ${idlogin}`);
    res.render('links/osclose', { lista: links.recordset });
});

//listar todas as OS registradas para o parceiro
router.get('/all', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT 
    C.NUMCONTRATO, 
    P.NOMEPARC,    
    O.NUMOS,
    (CASE O.SITUACAO WHEN 'F' THEN 'Fechada'ELSE 'Aberta' END) AS SITUACAO, 
    I.NUMITEM,
    CONVERT(VARCHAR(30),O.DHCHAMADA,113) AS ABERTURA,
    CONVERT(VARCHAR(30),O.DTFECHAMENTO,113) AS DT_FECHAMENTO,
    CONVERT(VARCHAR(30),I.TERMEXEC,113) AS DT_EXECUCAO,
    CONVERT(NVARCHAR(MAX),O.DESCRICAO)AS DEFEITO,
    CONVERT(NVARCHAR(MAX),I.SOLUCAO) AS SOLUCAO,
    U.NOMEUSU AS RESPONSAVEL,
    USU.NOMEUSU AS EXECUTANTE,
    TSIUSU.NOMEUSU AS FECHADA,

    CID.NOMECID AS CIDADE,
    UFS.UF,
    SLA.DESCRICAO AS DESCRICAO_SLA,
    O.AD_MOTIVO_OI AS MOTIVO,
    O.AD_SOLICITANTE_OI AS SOLICITANTE,
    AD_TIPO_OI AS TIPO

    FROM sankhya.TCSOSE O
    INNER JOIN sankhya.TCSCON C ON (C.NUMCONTRATO=O.NUMCONTRATO)
    INNER JOIN sankhya.AD_TBACESSO AC ON (C.NUMCONTRATO=AC.NUM_CONTRATO)
    INNER JOIN sankhya.TGFPAR P ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.TCSITE I ON (O.NUMOS=I.NUMOS)
    INNER JOIN sankhya.TSIUSU     ON (TSIUSU.CODUSU = O.CODUSUFECH)
    INNER JOIN sankhya.TSIUSU USU ON (USU.CODUSU = I.CODUSU)
    INNER JOIN sankhya.TSIUSU U ON (O.CODUSURESP=U.CODUSU)

    LEFT JOIN SANKHYA.TCSITS ITS ON (ITS.CODSIT = I.CODSIT)
    LEFT JOIN SANKHYA.TGFCPL CPL ON (P.CODPARC = CPL.CODPARC)
    LEFT JOIN SANKHYA.TSICID CID ON (CPL.CODCIDENTREGA = CID.CODCID)
    LEFT JOIN SANKHYA.TSIUFS UFS ON (CID.UF = UFS.CODUF)
    LEFT JOIN sankhya.TCSSLA SLA ON (SLA.NUSLA = C.NUSLA)

    WHERE 
    O.NUFAP IS NULL   
    AND O.DHCHAMADA >= '10/09/2020'
    AND AC.ID_LOGIN= ${idlogin}`);
    res.render('links/all', { lista: links.recordset });
});

//listar todos os usuários (login) cadastrados
router.get('/allogin', isLoggedIn,  async (req, res) => {
    const idlogin = req.user.CODLOGIN    
    const links = await pool.query(`SELECT CODLOGIN,fullname,NOMEUSU,ADMINISTRADOR
    FROM sankhya.AD_TBLOGIN`);
    res.render('links/allogin', { lista: links.recordset });
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