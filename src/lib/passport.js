const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const bcrypt = require('bcryptjs');

const pool = require('../database');
const helpers = require('./helpers');

passport.use('local.signin', new LocalStrategy({
  usernameField: 'nomeusu',
  passwordField: 'senha',
  passReqToCallback: true
}, async (req, nomeusu, senha, done) => {    
  const rows = await pool.query(`SELECT * FROM sankhya.AD_TBLOGIN WHERE NOMEUSU= '${nomeusu}'`);
  if (rows.recordset.length > 0) {
      const user = rows.recordset[0];      
     // const validPassword = await bcrypt.compare(senha, user.SENHA)
     // console.log(validPassword)
      if (senha == user.SENHA) {
        done(null, user, req.flash('success','Welcome ' + user.NOMEUSU));
      } else {
        done(null, false, req.flash('message', 'Incorrect Password'));
      } 
  } else {
    return done(null, false, req.flash('message', 'Usuário Não Existe!'));
  }
 
  
  /* const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if (rows.length > 0) {
    const user = rows[0];
    const validPassword = await helpers.matchPassword(password, user.password)
    if (validPassword) {
      done(null, user, req.flash('success', 'Welcome ' + user.username));
    } else {
      done(null, false, req.flash('message', 'Incorrect Password'));
    }
  } else {
    return done(null, false, req.flash('message', 'The Username does not exists.'));
  } */
}));



//CADASTRAR USUÁRIO/ OS (só adaptar a criação de OS)
passport.use('local.signup', new LocalStrategy({
  usernameField: 'nomeusu',
  passwordField: 'senha',
  passReqToCallback: true
  //recebe os dados 
}, async (req, nomeusu, senha, done) => {
  const { fullname } = req.body;
  const newUser = {
    nomeusu,
    senha,
    fullname
  };
  newUser.senha = await helpers.encryptPassword(senha);
  const result = await pool.query(`INSERT INTO sankhya.AD_TBLOGIN (NOMEUSU, SENHA, fullname) VALUES('${nomeusu}','${senha}','${fullname}')`);
  newUser.id = result.insertId;
  //console.log(result)
  return done(null, newUser);
}));

passport.serializeUser((user, done) => {  
  done(null, user.CODLOGIN);
});

passport.deserializeUser(async (id, done) => {
  
  const rows = await pool.query(`SELECT * FROM sankhya.AD_TBLOGIN WHERE CODLOGIN = ${id}`);
  //console.log(rows)
  done(null, rows.recordset[0]);
});


