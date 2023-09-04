'use strict';
/* Data Access Object (DAO) module for accessing courses and exams */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('ExamStudyPlan.db', (err) => {
  if(err) throw err;
});


/**Corsi ***************************************************************************************************************************************************/
// get all courses
exports.listCourses = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Corsi';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const courses = rows.map((c) => ({codice: c.codice, nome: c.nome, crediti: c.crediti, studenti_partecipanti: c.studenti_partecipanti, max_studenti: c.max_studenti, propedeutico: c.propedeuticità}));
      resolve(courses);
    });
  });
};

//get incompatibilità by course codice
exports.getCorsiIncompatibili = (codice) => {
	const query = "SELECT * FROM CorsiIncompatibili ci JOIN Corsi c ON ci.corsoIncompatibile = c.codice WHERE ci.corsoID=?"
	const params = codice;
	return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        const courses = rows.map((c) => ({codiceIncompatibile: c.corsoIncompatibile, nomeIncompatibile: c.nome }))
        resolve(courses)
      });
	});
}

//get info Propedeuticità
exports.getNomePropedeutico = (codice) => {
	const query = "SELECT nome FROM Corsi WHERE codice=?"
	const params = codice;
	return new Promise((resolve, reject) => {
				db.all(query, params, (err, rows) => {
					if (err) reject(err);
          const course = rows.map((c) => c.nome )
          resolve(course[0])
				});
	});
}


/**Piano Studio ***************************************************************************************************************************************************/
//get il PianoDiStudio dato l'utente Loggato
exports.getStudyPlan = (userID) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM PianoStudio p JOIN Corsi c ON p.codiceCorso=c.codice WHERE userID = ?';
    db.all(sql, [userID], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const courses = rows.map((c) => ({
          codice: c.codice,
          nome: c.nome,
          crediti: c.crediti,
          studenti_partecipanti: c.studenti_partecipanti,
          max_studenti: c.max_studenti,
          propedeuticità: c.propedeuticità
        }));
      resolve(courses);
    });
  });
};

const checkNumMax = (corso, userId, found) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM PianoStudio WHERE codiceCorso=? AND userID=?';
    db.all(sql, [corso.codice, userId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const exist = rows.map((c) => c.codiceCorso)
      if(exist[0] !== corso.codice){
        //da controllare 
        if(found.studenti_partecipanti>=corso.max_studenti){
          reject("error: Numero studenti partecipanti maggiore del numero massimo di studenti");
          return;
        }
      }
      else resolve(true)
    });
  });
}

const numStud = (codice) =>{
  return new Promise((resolve, reject) => {
    const sql = 'SELECT count(codiceCorso) as n_stud FROM PianoStudio WHERE codiceCorso=?';
    db.all(sql, [codice], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const num_stud = rows.map(c => c.n_stud)
      resolve(num_stud[0]);
    });
  });
}

const checkIfExist = (codice, userId) =>{
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM PianoStudio WHERE codiceCorso=? AND userID=?';
    db.all(sql, [codice, userId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const exist = rows.map((c) => c.codiceCorso)
      if(exist[0] === codice){
        //già esistente al piano studi non fare il controllo
        resolve(true)
      }
      else {
        //da controllare 
        resolve(false)
      }
    });
  });
}

// check di validazione vincoli
exports.checkValidation = (pianoStudio, userId) => {
  return new Promise((resolve, reject) => {
    let courses; //ho tutta la lista dei corsi con incompatibilità appena ottenuti dal DB

  const sql = 'SELECT * FROM Corsi c LEFT JOIN CorsiIncompatibili ci ON c.codice=ci.corsoID';
  db.all(sql, [], (err, rows) => {
    if (err) {
      reject(err);
      return;
    }
    courses = rows.map((c) => ({codice: c.codice, nome: c.nome, crediti: c.crediti, studenti_partecipanti: c.studenti_partecipanti, max_studenti: c.max_studenti, propedeutico: c.propedeuticità, incompatibile: c.corsoIncompatibile}));
    
    //VALIDAZIONI
    //su PIANO DI STUDIO -> incompatibilità, propedeuticità, num_studenti<=n_max, num_crediti<=max_creditiPerPianoStudio
  
    //CHECK INCOMPATIBILITA'
      //mi ricavo i corsi incompatibili dalla lista dei corsi per ogni corso presente nel piano studio
    let pianostudio_incompatibilità=[];
    pianoStudio.map((c) => {
      let found;
      found = courses.find((course) => course.codice === c.codice)
      if(found){
        pianostudio_incompatibilità.push(found)
      }
    })
      //controllo se ci sono incompatibilità
    let existIncompatibilità=[];
    pianostudio_incompatibilità.map((c) => {
        let coursefound;
        coursefound=pianoStudio.find((co) => co.codice === c.incompatibile)
        if(coursefound){
          existIncompatibilità.push(coursefound)
        }
      })
      //se ritorna un valore diverso da 0 vuol dire che ha trovato delle incompatibilità
    if(existIncompatibilità.length!==0){//vuol dire che ha trovato incompatibilità
        reject("error: ci sono incompatibilità");
        return;
    }

    //CHECK PROPEDEUTICITA'
    pianoStudio.map((c) => {
      if(c.propedeutico){
        let found;
        found = pianoStudio.find((course) => course.codice === c.propedeutico)
        if(!found){
          reject("error: Problemi propedeuticità");
          return;
        }
      }
    })
    
    //CHECK NUMERO CREDITI PIANO STUDIO
    const query ='SELECT tipologia_pianostudio FROM Utenti WHERE id=?';
    db.all(query, [userId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      let tipologia=rows.map((c) => c.tipologia_pianostudio);
      let max_value;
      if(tipologia==='full-time') max_value=80
      if(tipologia==='part-time') max_value=40

      const SommaCrediti = (key) => {
        let current = pianoStudio.reduce((a, b) => a + b[key], 0);
        return (current);
      }

      if(SommaCrediti('crediti')>max_value){
        reject("error: Il numero di crediti inseriti superano il numero massimo di crediti consentito per quella specifica tipologia del piano di studio");
        return;
      }
    
    });
    
    //CHECK NUMERO MASSIMO STUDENTI
    pianoStudio.map((c) => {
      if(c.max_studenti){
        let found;
        found = courses.find((course) => course.codice === c.codice)
        checkNumMax(c, userId, found)
          .then((res) =>{console.log(res)})
          .catch((err) => {
            console.log("catch")
            console.log(err); 
            reject(err); //non riesco a fare ritornare al checkValidation questo reject
            return;
          })
      }
    })
    
    resolve(true)
  });
});
}

// save StudyPlan
exports.SavePianoStudio = (pianoStudio, corsiToUpdate, userId) => {
  return new Promise((resolve, reject) => {
    corsiToUpdate.map((c) =>{
      numStud(c.codice)
        .then((n_stud) =>{
          const query= 'DELETE FROM PianoStudio WHERE codiceCorso = ? AND userID= ?';
          db.run(query, [c.codice , userId], (err) => {
            if (err) {
              reject(err);
              return;
            } 
          })

          let decremento = n_stud -1;
          if(decremento <= 0 ) decremento=null;
          const sql = 'UPDATE Corsi SET studenti_partecipanti=? WHERE codice = ?';
          db.run(sql, [decremento, c.codice], (err) => {
          //const sql = 'UPDATE Corsi SET studenti_partecipanti=studenti_partecipanti-1 WHERE codice = ?';
          //db.run(sql, [c.codice], (err) => {
            if (err) {
              reject(err);
              return;
            } 
          })
        })

    });

    pianoStudio.map((c) => {
      checkIfExist(c.codice, userId)
        .then((ifexist) =>{
          if(!ifexist){
            numStud(c.codice)
              .then((n_stud) => {
                const sql2 = 'INSERT INTO PianoStudio (userId, codiceCorso) VALUES (?, ?)';
                db.run(sql2, [userId , c.codice], (err) => {
                  if (err) {
                    reject(err);
                    return;
                  } 
                }) 

                const incremento = n_stud +1;
                //Aggiorno il numero studenti dei corsi che ho appena inserito
                const sql3 = 'UPDATE Corsi SET studenti_partecipanti=? WHERE codice = ?';
                db.run(sql3, [incremento , c.codice], (err) => {
                  if (err) {
                    reject(err);
                    return;
                  } 
                })
            });
          }
        });
    });
    resolve(null);
  })
}

// delete StudyPlan
exports.deleteStudyPlan = (pianoStudio, userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM PianoStudio WHERE userID = ?';
    db.run(sql, [userId], (err) => {
      if (err) {
        reject(err);
        return;
      } 
    });

    const sql2 = 'UPDATE Utenti SET tipologia_pianostudio=? WHERE id = ?';
    const tipologia=null;
    db.run(sql2, [tipologia ,userId], (err) => {
      if (err) {
        reject(err);
        return;
      } 
    });
    
    //aggiorno il numero di studenti per i corsi che sono stati eliminati insieme al piano studio
    pianoStudio.map((c)=>{
      console.log(c.nome)
      let n_stud= c.studenti_partecipanti-1;
      if(n_stud<0) n_stud=0;
      if(n_stud==0) n_stud=null;
      const sql3 = 'UPDATE Corsi SET studenti_partecipanti=? WHERE codice = ?';
      db.run(sql3, [n_stud , c.codice], (err) => {
        if (err) {
          reject(err);
          return;
        } 
      })
    })
        
    resolve(null);
  });
}

/** Modifica per l'utente della tipologia del piano di studio  ****************************************************************************************/
// update Utenti, aggiungendo il campo tipologia_pianostudio
exports.updateUser = (tipologia, userId) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE Utenti SET tipologia_pianostudio=? WHERE id = ?';
    db.run(sql, [tipologia, userId], function (err) {  // <-- NB: function, NOT arrow function so this.lastID works
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};
