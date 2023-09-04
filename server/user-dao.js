'use strict';
/* Data Access Object (DAO) module for accessing users */

const sqlite = require('sqlite3');
const crypto = require('crypto');

// open the database
//dovrò modificare il database da exams.sqlite al mio
const db = new sqlite.Database('ExamStudyPlan.db', (err) => {
    if(err) throw err;
  });

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    //modifica la tabella
    const sql = 'SELECT * FROM Utenti WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) 
          reject(err);
        else if (row === undefined)
          resolve({error: 'User not found.'});
        else {
          const user = {id: row.id, username: row.email, nomecompleto: row.nomecompleto , tipologia_pianostudio: row.tipologia_pianostudio}
          resolve(user);
        }
    });
  });
};

exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Utenti WHERE email = ?';
      db.get(sql, [email], (err, row) => {
        if (err) { reject(err); }
        else if (row === undefined) { resolve(false); }
        else {
          const user = {id: row.id, username: row.email, nomecompleto: row.nomecompleto, tipologia_pianostudio: row.tipologia_pianostudio};
          const salt = row.salt;
          //fa l'hash della password
          crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
            if (err) reject(err);

            const passwordHex = Buffer.from(row.password, 'hex');

            if(!crypto.timingSafeEqual(passwordHex, hashedPassword))
              resolve(false);
            else resolve(user); 
          });
        }
      });
    });
  };
  
