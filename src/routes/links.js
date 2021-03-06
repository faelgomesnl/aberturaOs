const express = require('express');
const router = express.Router();
const path = require('path')

//anexar arquivo
const multer = require('multer');

const DIR = './uploads';

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, DIR);
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
 
const upload = multer({storage: storage});



const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', isLoggedIn, (req, res) => {    
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
    
    res.redirect('/links/allogin')
});

//ADICIONAR CONTRATOS AOS NOVOS USUÁRIOS, SOMENTE ADMIN
router.get('/newcont', isLoggedIn, async (req, res) => {  
    
    const links = await pool.query(`SELECT CODLOGIN,fullname,NOMEUSU,ADMINISTRADOR
    FROM sankhya.AD_TBLOGIN 
    ORDER BY NOMEUSU `); 
   
    res.render('links/newcont',{lista: links.recordset})
});


router.post('/newcont', isLoggedIn, async (req, res) => {  

    const contrato = req.body.contrato;
    const login = req.body.login; 

    pool.query(`INSERT INTO sankhya.AD_TBACESSO (NUM_CONTRATO, ID_LOGIN) VALUES('${contrato}','${login}')`);
    
    req.flash('success', 'O Contrato foi Vincunlado com Sucesso!!!!')
    res.redirect('/links/newcont')
});

//ADD OS
router.get('/teste', isLoggedIn, async (req, res) => {
    const idlogin = req.user.CODLOGIN  

    //contrato
    const links = await pool.query(`SELECT DISTINCT L.NUM_CONTRATO, PAR.NOMEPARC,
    CASE
         WHEN CON.AD_CODOCOROS IS NULL THEN 900
         ELSE CON.AD_CODOCOROS
       END AS CARTEIRA,
    PAR.CODPARC, PD.DESCRPROD, 
    PS.CODPROD, CON.CODUSUOS , L.ID_LOGIN,
CASE  WHEN (DATEPART(DW,GETDATE() )) = 7   
     THEN
            CASE 
            WHEN CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END < (ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0)) 
            --add apenas 360
            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, (CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) ), 
            DATEADD(DD, 2, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','08:00'),111))))
			

            WHEN (CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) ) >= 0 and (CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) ) <=600
            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, (CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) ), 
            DATEADD(DD, 3, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','08:00'),111))))
			
        
            ELSE DATEDIFF(MI, GETDATE(), DATEADD(MI, ((CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) )-600), DATEADD(DD, 4, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','08:00'),111))) )
			
            END 

    WHEN (DATEPART(DW,GETDATE() )) = 1
    THEN
            CASE WHEN CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END < (ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0)) 
            --add apenas 360
            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, (CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) ), 
            DATEADD(DD, 1, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','08:00'),111)))
)
			
            WHEN (CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) ) >= 0 and (CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) ) <=600
            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, (CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) ), 
            DATEADD(DD, 2, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','08:00'),111))))
			
        
            ELSE DATEDIFF(MI, GETDATE(), DATEADD(MI, ((CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) )-600), DATEADD(DD, 3, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','08:00'),111))))
			
            END

    ELSE

        CASE WHEN CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END < (ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0)) 
            --add apenas 360
            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END, GETDATE()))
			

            WHEN (CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) ) >= 0 and (CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) ) <=600
            THEN DATEDIFF(MI, GETDATE(), DATEADD(MI, (CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) ), 
            DATEADD(DD, 1, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','08:00'),111))))
			
        
            ELSE DATEDIFF(MI, GETDATE(), DATEADD(MI, ((CASE WHEN RIGHT(TC.VALORTEMPO, 2) = '00'
            THEN DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '00', ':00')) 
            ELSE DATEDIFF(MI, 0, REPLACE(TC.VALORTEMPO, '30', ':30')) 
            END - ISNULL(DATEDIFF(MI,GETDATE(),convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','18:00'),111)),0) )-600), DATEADD(DD, 2, convert(datetime,Concat(CONVERT(VARCHAR(10), CAST(getdate() AS DATETIME), 111),' ','08:00'),111))))
			
            END
   
END AS VALORTEMPO,
    CD.NOMECID AS CIDADE,
    (CONVERT(VARCHAR(45),EN.NOMEEND,103)) as LOGRADOURO
    FROM sankhya.AD_TBACESSO L
    INNER JOIN sankhya.TCSCON CON ON (L.NUM_CONTRATO = CON.NUMCONTRATO)
    INNER JOIN sankhya.TGFPAR PAR ON (PAR.CODPARC = CON.CODPARC) 
    INNER JOIN sankhya.TCSPSC PS ON (CON.NUMCONTRATO=PS.NUMCONTRATO)
    INNER JOIN sankhya.TGFPRO PD ON (PD.CODPROD=PS.CODPROD)
    INNER JOIN sankhya.TGFCTT C ON (PAR.CODPARC=C.CODPARC)
    LEFT JOIN sankhya.TCSSLA SLA ON (SLA.NUSLA = CON.NUSLA)
    LEFT JOIN sankhya.TCSRSL TC ON (SLA.NUSLA=TC.NUSLA)
    LEFT JOIN sankhya.TSIBAI BR ON (PAR.CODBAI=BR.CODBAI)
    LEFT JOIN sankhya.TSICID CD ON (CD.CODCID=PAR.CODCID)
    LEFT JOIN sankhya.TSIEND EN ON (EN.CODEND=PAR.CODEND)
    LEFT JOIN sankhya.TSIUFS UF ON (UF.UF=CD.UF)
    LEFT JOIN sankhya.TFPLGR LG ON (LG.CODLOGRADOURO=EN.CODLOGRADOURO)
    WHERE L.ID_LOGIN = ${idlogin}
    AND CON.ATIVO = 'S'
    AND PS.SITPROD IN ('A','B')
    AND PD.USOPROD='S'
    AND TC.PRIORIDADE =1`);     
    
    //contatos
    const links2 = await pool.query(`SELECT DISTINCT 
    CONVERT(VARCHAR(30),c.CODCONTATO,103)+' - '+CONVERT(VARCHAR(30),con.NUMCONTRATO,103)+' - '
    + UPPER  (CONVERT(VARCHAR(30),c.NOMECONTATO,103)) as CONTATO,
    c.CODCONTATO AS CODCONT,
    UPPER  (CONVERT(VARCHAR(30),c.NOMECONTATO,103)) as NOME
    from sankhya.TGFPAR P
    INNER JOIN sankhya.TGFCTT C ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.TCSCON CON ON (P.CODPARC = CON.CODPARC)
    inner join sankhya.AD_TBACESSO L ON (L.NUM_CONTRATO = CON.NUMCONTRATO)
    INNER JOIN sankhya.TCSPSC PS ON (CON.NUMCONTRATO=PS.NUMCONTRATO)
    INNER JOIN sankhya.TGFPRO PD ON (PD.CODPROD=PS.CODPROD)
    WHERE L.ID_LOGIN = ${idlogin}
    AND CON.ATIVO = 'S'
    AND PS.SITPROD IN ('A','B')
    AND PD.USOPROD='S'
    order by CONTATO`);

    //produtos
    const links3 = await pool.query(`SELECT DISTINCT 
    CONVERT(VARCHAR(30),con.NUMCONTRATO,103)+' - '+CONVERT(VARCHAR(30),PS.CODPROD,103)+' - '
    + UPPER  (CONVERT(VARCHAR(50),PD.DESCRPROD,120)) as PRODUTO,
    con.NUMCONTRATO,
     PD.DESCRPROD, 
     PS.CODPROD
    from sankhya.TGFPAR P
    INNER JOIN sankhya.TGFCTT C ON (P.CODPARC=C.CODPARC)
    INNER JOIN sankhya.TCSCON CON ON (P.CODPARC = CON.CODPARC)
    inner join sankhya.AD_TBACESSO L ON (L.NUM_CONTRATO = CON.NUMCONTRATO)
    INNER JOIN sankhya.TCSPSC PS ON (CON.NUMCONTRATO=PS.NUMCONTRATO)
    INNER JOIN sankhya.TGFPRO PD ON (PD.CODPROD=PS.CODPROD)
    WHERE L.ID_LOGIN = ${idlogin}
    AND PS.SITPROD IN ('A','B')
    AND PD.USOPROD='S'
    order by con.NUMCONTRATO, PS.CODPROD`);

    res.render('links/testes', {geral: links.recordset, cont: links2.recordset, prod: links3.recordset})
});

router.post('/teste', isLoggedIn, upload.single('file'), async (req, res) => {    

    const links = await pool.query('select top (1) NUMOS +1 as NUMOS from sankhya.TCSOSE order by numos desc');  
    const numos = Object.values(links.recordset[0])    

    const texto = req.body.texto;
    const filetoupload = req.file.filename
    const contrato = req.body.contrato; 
    const parceiro = req.body.codparc;
    const produto = req.body.codprod; 
    const contato = req.body.atualiza; 
    const slccont = req.body.sla;
    const cart = req.body.carteira;

    await pool.query(`INSERT INTO sankhya.TCSOSE (NUMOS,NUMCONTRATO,DHCHAMADA,DTPREVISTA,CODPARC,CODCONTATO,CODATEND,CODUSURESP,DESCRICAO,SITUACAO,CODCOS,CODCENCUS,CODOAT,POSSUISLA) VALUES 
    ('${numos}','${contrato}',GETDATE(),(SELECT DATEADD(MI,${slccont},GETDATE())),'${parceiro}','${contato}',110,110,'${texto}','P','',30101,1000000,'S');
    INSERT INTO SANKHYA.TCSITE (NUMOS,NUMITEM,CODSERV,CODPROD,CODUSU,CODOCOROS,CODUSUREM,DHENTRADA,DHPREVISTA,CODSIT,COBRAR,RETRABALHO) VALUES 
    ('${numos}',1,4381,'${produto}',104,'${cart}',569,GETDATE(),(SELECT DATEADD(MI,${slccont},GETDATE())),15,'N','N');
    INSERT INTO sankhya.TSIATA (CODATA,DESCRICAO,ARQUIVO,CONTEUDO,CODUSU,DTALTER,TIPO) VALUES ('${numos}','ANEXO','${filetoupload}','${filetoupload}',1006,GETDATE(),'W')
`);   
    
    console.log('anexo')   
    console.log(filetoupload)
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
    FORMAT(CAST(O.DHCHAMADA AS DATETIME), 'dd/MM/yyyy hh:mm') AS ABERTURA,
    FORMAT(CAST(O.DTPREVISTA AS DATETIME), 'dd/MM/yyyy hh:mm') AS PREVISAO,    
    CONVERT(NVARCHAR(MAX),O.DESCRICAO)AS DEFEITO,
    CONVERT(NVARCHAR(MAX),I.SOLUCAO) AS SOLUCAO,
    CID.NOMECID AS CIDADE,
    UFS.UF,
    SLA.DESCRICAO AS DESCRICAO_SLA,
    O.AD_MOTIVO_OI AS MOTIVO,
    O.AD_SOLICITANTE_OI AS SOLICITANTE,
    AD_TIPO_OI AS TIPO,
    ITS.DESCRICAO

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
    AND O.DHCHAMADA >= '01/01/2021'
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
    CONVERT(VARCHAR(10), O.DHCHAMADA, 120)  AS ABERTURA2,
    CONVERT(VARCHAR(30),O.DHCHAMADA,103)+' '+ CONVERT(VARCHAR(30),O.DHCHAMADA,108) AS ABERTURA,
    CONVERT(VARCHAR(30),O.DTFECHAMENTO,103)+' '+ CONVERT(VARCHAR(30),O.DTFECHAMENTO,108) AS DT_FECHAMENTO,
    CONVERT(VARCHAR(30),I.TERMEXEC,103)+' '+ CONVERT(VARCHAR(30),I.TERMEXEC,108) AS DT_EXECUCAO,  
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
    AND O.DHCHAMADA >= '01/01/2021'
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
    CONVERT(VARCHAR(10), O.DHCHAMADA, 120)  AS ABERTURA2,
    CONVERT(VARCHAR(30),O.DHCHAMADA,103)+' '+ CONVERT(VARCHAR(30),O.DHCHAMADA,108) AS ABERTURA,
    CONVERT(VARCHAR(30),O.DTFECHAMENTO,103)+' '+ CONVERT(VARCHAR(30),O.DTFECHAMENTO,108) AS DT_FECHAMENTO,
    CONVERT(VARCHAR(30),I.TERMEXEC,103)+' '+ CONVERT(VARCHAR(30),I.TERMEXEC,108) AS DT_EXECUCAO,  
    CONVERT(NVARCHAR(MAX),O.DESCRICAO)AS DEFEITO,
    
    (CASE  WHEN O.SITUACAO ='P' THEN  '' ELSE I.SOLUCAO END )  AS SOLUCAO,
    CONVERT(NVARCHAR(MAX),I.SOLUCAO) AS SOLUCAOA,
    U.NOMEUSU AS RESPONSAVEL,
    USU.NOMEUSU AS EXECUTANTE,
    TSIUSU.NOMEUSU AS FECHADA,

    CID.NOMECID AS CIDADE,
    UFS.UF,
    SLA.DESCRICAO AS DESCRICAO_SLA,
    O.AD_MOTIVO_OI AS MOTIVO,
    O.AD_SOLICITANTE_OI AS SOLICITANTE,
    AD_TIPO_OI AS TIPO,
    ITS.DESCRICAO

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
    AND O.SITUACAO in ('P','F')
    AND I.NUMITEM = (SELECT DISTINCT MAX (NUMITEM) FROM SANKHYA.TCSITE WHERE NUMOS = O.NUMOS)
    AND O.DHCHAMADA >= '01/01/2021'
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