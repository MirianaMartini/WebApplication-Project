/*
 * All the API calls
 */

const URL = 'http://localhost:3001'

/* API Courses ******************************************************************************************************************************************************/
async function getAllCourses() {
  const response = await fetch(URL+'/courses');
  const coursesJson = await response.json();
  if (response.ok) {
    return coursesJson.map((c) => ({codice: c.codice, nome: c.nome, crediti: c.crediti, studenti_partecipanti: c.studenti_partecipanti, max_studenti: c.max_studenti, propedeutico: c.propedeutico}));
  } else {
    throw coursesJson;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
  }
}

async function getCorsiIncompatibili(codice) {
  const response = await fetch(URL+`/courses/incompatibile/${codice}`);
  const IncompatibleCourses = await response.json();
  if (response.ok) {
    return IncompatibleCourses.map((c) => ({codiceIncompatibile: c.codiceIncompatibile, nomeIncompatibile: c.nomeIncompatibile }));
  }
  else {
    throw IncompatibleCourses;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
  }
}

async function getNomePropedeutico(codice) {
  if(codice){
  const response = await fetch(URL+`/courses/propedeutico/${codice}`);
  const NomePropedeuticoCourse = await response.json();
  if (response.ok) {
    return NomePropedeuticoCourse;
  }
  else {
    throw NomePropedeuticoCourse;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
  }
}
}

/* API Piano Studio ***************************************************************************************************************************************************************/
async function getPianoStudio() {
  const response = await fetch((URL+'/PianoStudio'), {credentials: 'include'});
  const coursesJson = await response.json();
  if (response.ok) {
    return coursesJson.map((c) => ({ 
      codice: c.codice,
      nome: c.nome,
      crediti: c.crediti,
      studenti_partecipanti: c.studenti_partecipanti,
      max_studenti: c.max_studenti,
      propedeutico: c.propedeuticità 
    }));
  } else {
    throw coursesJson;  // an object with the error coming from the server
  }
}

//creo il piano di studio per l'utente loggato
function CreateStudyPlan(tipologia){
    return new Promise((resolve, reject) => {
      fetch((URL+`/PianoStudio`), {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            //"Access-Control-Allow-Headers" : "Content-Type",
            //"Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({tip_str: tipologia}),
      }).then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          response.json()
            .then((obj) => { reject(obj); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
      }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
}

function SaveStudyPlan(pianoStudi, corsiToUpdate){
    return new Promise((resolve, reject) => {
      fetch((URL+`/SavePianoStudio`), {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({pianoStudi, corsiToUpdate}),
      })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } 
        else {
          response.json()
            .then((obj) => { resolve(obj); }) // error message in the response body
            .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
        }
       })
      .catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
    });
}

function deleteStudyPlan(pianoStudio){
  return new Promise((resolve, reject) => {
    fetch((URL+`/DeletePianoStudio`), {
      method: 'PUT',
      credentials: 'include',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({pianoStudio}),
    }).then((response) => {
      if (response.ok) {
        resolve(null);
      } else {
        response.json()
          .then((obj) => { reject(obj); }) // error message in the response body
          .catch(() => { reject({ error: "Cannot parse server response." }) }); // something else
      }
    }).catch(() => { reject({ error: "Cannot communicate with the server." }) }); // connection errors
  });
}

/* API User *********************************************************************************************************************************************************************************/
async function getUser() {
  const response = await fetch((URL+`/user`), {credentials: 'include'});
  const user = await response.json();
  if (response.ok) 
    return user;
  else {
    throw user;  // mi aspetto che sia un oggetto json fornito dal server che contiene l'errore
  }
}

async function logIn(credentials) {
  let response = await fetch((URL+'/sessions'), {
    method: 'POST',
    credentials: 'include', //aggiungere a tutte le API che non sono get 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetail = await response.json();
    throw errDetail.message;
  }
}

async function logOut() {
  await fetch((URL+'/sessions/current'), { method: 'DELETE', credentials: 'include' });
}

async function getUserInfo() {
  const response = await fetch((URL+'/sessions/current'), {credentials: 'include'});
  const userInfo = await response.json();
  if (response.ok) {
    return userInfo;
  } else {
    throw userInfo;  
  }
}

const API = { getAllCourses, getCorsiIncompatibili, getNomePropedeutico, logIn, logOut, getUserInfo, getPianoStudio, CreateStudyPlan, getUser, deleteStudyPlan, SaveStudyPlan };
export default API;