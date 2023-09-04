Progettare e implementare un’applicazione web per gestire il piano di studi di uno studente universitario.
L’applicazione deve soddisfare le seguenti specifiche.
L’università offre una serie di corsi. Ogni corso è caratterizzato da un codice univoco di 7 caratteri, un
nome, e un numero (intero) di crediti.
Il piano di studi di uno studente è un sottoinsieme dei corsi offerti dall’università. Il totale dei crediti dei
corsi inseriti nel piano di studi deve essere compreso tra 60 e 80 crediti (estremi inclusi) per l’opzione fulltime, o tra 20 e 40 (estremi inclusi) per l’opzione part-time.
Un corso può essere soggetto ad uno o più vincoli riguardo al suo inserimento nel piano degli studi:
- Un corso può essere incompatibile con uno o più altri corsi. Essi non possono essere selezionati
insieme.
- Un corso può avere un corso (uno solo) propedeutico obbligatorio, che deve già essere presente
nel piano di studi.
- Un corso può avere un numero massimo di studenti che possono inserirlo nel piano di studi.
Nella pagina iniziale (home-page) dell’applicazione tutti gli utenti, anche non autenticati (cioè anonimi),
possono vedere la lista completa dei corsi offerti dall’università. La lista dei corsi deve essere visualizzata
in ordine alfabetico di nome corso. Per ogni corso, la lista mostra la sua descrizione: il codice, il nome, il
numero di crediti, il numero di studenti che hanno già scelto il corso e, se presente, il numero massimo di
studenti che possono selezionarlo. Ogni descrizione di corso può essere espansa/richiusa dall’utente, per
mostrare il dettaglio dei corsi incompatibili e/o propedeutici (visualizzare almeno il codice corso). Più di
un corso può essere visualizzato in stato espanso allo stesso tempo.
Una volta autenticato, l’utente continua a vedere la stessa lista completa dei corsi (in una home-page
logged-in). In questa stessa pagina, se il piano di studi non è stato ancora creato, l’utente può crearne uno
vuoto, specificando l’opzione full-time o part-time; questa lista vuota può essere editata secondo le
istruzioni nel seguito. Se un piano di studi è già stato creato e salvato in modo persistente, esso dovrà
essere immediatamente mostrato (nella stessa pagina) e può essere editato come nel seguito.
L’editing del piano di studi avviene sempre nella stessa pagina (home-page logged-in) dove sono
visualizzate contemporaneamente sia la lista dei corsi sia il piano di studi. L’editing
• Mostra sempre il numero di crediti che corrispondono al totale dei corsi nel piano di studi, e i
valori di minimo e massimo da rispettare.
• Consente di aggiungere un corso al piano di studi, preso dalla lista completa. Solo i corsi che
soddisfano tutti i vincoli possono essere aggiunti.
• Consente di rimuovere un corso dal piano di studi, se ciò non viola alcun vincolo di propedeuticità
(altrimenti, l’applicazione deve mostrare la ragione)
• Se un corso non può essere aggiunto, deve essere marcato in maniera differente nella lista
completa dei corsi, e l’applicazione deve indicare la ragione.
Durante la sessione di editing, l’utente può “Salvare” il piano di studi in modo persistente (questo
rimpiazzerà qualsiasi precedente versione). L’utente può “Annullare” le modifiche correnti e in tal caso la
copia persistente (se presente) non deve essere modificata.
Quando si salva, il piano di studi deve essere validato per verificare il rispetto di tutti i vincoli.
In aggiunta, l’utente può “Cancellare” l’intero piano di studi, inclusa la copia persistente.
Dopo ognuna di queste azioni, l’applicazione dovrà trovarsi nella home-page logged-in.
Requisiti del progetto
• L’architettura dell’applicazione e il codice sorgente devono essere sviluppati adottando le migliori
pratiche (best practice) di sviluppo del software, in particolare per le single-page application (SPA)
che usano React e HTTP API.
• Il progetto deve essere realizzato come applicazione React, che interagisce con un’API HTTP
implementata in Node+Express. Il database deve essere memorizzato in un file SQLite.
• La comunicazione tra il client ed il server deve seguire il pattern “two servers”, configurando
correttamente CORS, e React deve girare in modalità “development”.
• La directory radice del progetto deve contenere un file README.md e contenere due
subdirectories (client e server). Il progetto deve poter essere lanciato con i comandi: “cd
server; nodemon index.js” e “cd client; npm start”. Viene fornito uno scheletro
delle directory del progetto. Si può assumere che nodemon sia già installato a livello di sistema.
• L’intero progetto deve essere consegnato tramite GitHub, nel repository creato da GitHub
Classroom.
• Il progetto non deve includere le directory node_modules. Esse devono essere ricreabili tramite
il comando “npm install”, subito dopo “git clone”.
• Il progetto può usare librerie popolari e comunemente adottate (come per esempio day.js,
react-bootstrap, ecc.), se applicabili e utili. Tali librerie devono essere correttamente
dichiarate nei file package.json e package-lock.json cosicché il comando npm install
le possa scaricare ed installare tutte.
• L’autenticazione dell’utente (login) e l’accesso alle API devono essere realizzati tramite
passport.js e cookie di sessione, utilizzando il meccanismo visto a lezione. Non è richiesto
alcun ulteriore meccanismo di protezione. La registrazione di un nuovo utente non è richiesta.


# Project: Piano di Studi

## React Client Application Routes

- Route `/`: Home-page, Home-page Logged-In and Editing
- Route `/login`: Login
- Route `*` : Page Not Found

## API Server

- GET `/courses`
  - Request Body: None
  - Request Parameters: None
  - Response `200 OK` (success), `500` (internal server error)
  - Response body:
    ```
    [{
      "codice": '02GOLOV',
      "nome": 'Architetture dei sistemi di elaborazione',
      "crediti": "12",
      "studenti_partecipanti": "2",
      "max_studenti": '',
      "propedeutico": null
    },...
    ```

- GET `/courses/incompatibile/<codice>`
  - Request Body: None
  - Request Parameters: codice del corso
  - Response `200 OK` (success), `404` (Not Found), `500` (internal server error)
  - Response body:
    ```
    [{
      "codiceIncompatibile": '01SQJOV',
      "nomeIncompatibile": 'Data Science and Database Technology'
    },
    {
      "codiceIncompatibile": '01SQLOV',
      "nomeIncompatibile": 'Database systems'
    }]
    ```

- GET `/courses/propedeutico/<codice>`
  - Request Body: None
  - Request Parameters: codice del corso
  - Response `200 OK` (success), `404` (Not Found), `500` (internal server error)
  - Response body:
    ```
    "Web Applications I"
    ```
    

- GET `/PianoStudio`
  - Request Body: None
  - Request Parameters: None
  - Response `200 OK` (success), `500` (internal server error)
  - Response body:
    ```
    [{
      "codice": '01OUZPD',
      "nome": 'Model based software design',
      "crediti": "4",
      "studenti_partecipanti": "1",
      "max_studenti": null,
      "propedeuticità": null
    },...
    ```

- PUT `/PianoStudio`
  - Request Body: tipologia Piano Studio 
    ```
    {tip_str: "full-time"}
    ```
  - Request Parameters: None
  - Response: `200 OK` (success), `422` (the request body is not valid), `503` (Service Unavailable)
  - Response body: None

- PUT `/SavePianoStudio`
  - Request Body: array corsi da inserire nel Piano Studio, array corsi da eliminare dal piano studio 
    ```
    [{
      codice: '01UDFOV',
      nome: 'Applicazioni Web I ',
      crediti: 6,
      studenti_partecipanti: 4,
      max_studenti: null,
      propedeutico: null
    },...
    ```
    ```
    [{
      codice: '01OTWOV',
      nome: 'Computer network technologies and services',
      crediti: 6,
      studenti_partecipanti: 3,
      max_studenti: 3,
      propedeutico: null
    },...
    ```
  - Request Parameters: None
  - Response: `200 OK` (success), `503` (Service Unavailable)
  - Response body: None


- PUT `/DeletePianoStudio`
   - Request Body: piano studio 
      ```
      [{
        codice: '01UDFOV',
        nome: 'Applicazioni Web I ',
        crediti: 6,
        studenti_partecipanti: 4,
        max_studenti: null,
        propedeutico: null
      },...
      ```
  - Request Parameters: None
  - Response: `204 No Content` (success),`503` (Service Unavailable)
  - Response body: None


- GET `/user`
  - Request Body: None
  - Request Parameters: None
  - Response `200 OK` (success), `404` (Not Found), `500` (internal server error)
  - Response body:
    ```
    {
      "id":2,
      "username":"miriana@polito.it",
      "nomecompleto":"Miriana Martini",
      "tipologia_pianostudio":"part-time"
    }
    ```

- POST `/sessions`
  - Request Body: 
    ```
    {username: "test@polito.it", password: "password"}
    ```
  - Request Parameters: None
  - Response: `200 OK` (success), `401` (Unauthorized)
  - Response body: 
    ```
    {
      "id":1,
      "username":"test@polito.it",
      "nomecompleto":"Mario Rossi",
      "tipologia_pianostudio":"full-time"
    }
    ```

- DELETE `/sessions/current`
  - Request Body: None
  - Request Parameters: None
  - Response: `200 ` (success)
  - Response body: None

- GET `/sessions/current`
  - Request Body: None
  - Request Parameters: None
  - Response `200 OK` (success), `401` (Unauthorized)
  - Response body: None

## Database Tables

- Table `Utenti` - id, email, password, nomecompleto, salt, tipologia_pianostudio
- Table `Corsi` - codice, nome, crediti, studenti_partecipanti, max_studenti, propedeuticità
- Table `CorsiIncompatibili` - corsoID, corsoIncompatibile
- Table `PianoStudio` - userID, codiceCorso

## Main React Components

- `HomePage` (in `App.js`): Gestisce la visualizzazione della pagina Home-Page e se c'è un utente autenticato la visualizzazione della pagina Home-Page Logged-in
- `NavBar` (in `NavBar.js`): Permette di visualizzare, nella Home-Page il bottone per fare il LogIn e nella Home-Page Logged-In il nome dell'utente autenticato e il bottone per eseguire il LogOut
- `LoginForm` (in `LoginComponent.js`): Gestisce il LogIn di un utente
- `CoursesTable` (in `CoursesContent.js`): Gestisce la visualizzazione della tabella Corsi e della tabella Piano Studio
- `CourseRow` (in `CoursesContent.js`): Gestisce ogni singolo corso delle tabelle, permettendo di visualizzarne i dettagli e di aggiungerlo e/o eliminarlo dal Piano di Studio
- `StudyPlanArea` (in `StudyPlanArea.js`): Gestisce la visualizzazione del Piano di Studi se già esistente o la possibilità di crearne uno
- `FormComponent` (in `StudyPlanArea.js`): Gestisce la creazione di un Piano Studi
- `StudyPlanContent` (in `StudyPlanArea.js`): Gestisce la visualizzazione del Piano di Studi e il bottone per entrare in modalità "Editing". A sua volta in Editing potrà Salvare, Cancellare il Piano di Studio o Annullare le modifiche.

## Screenshot

![Screenshot](./client/img/screen_HomePageLoggedInEditing.JPG)

## Users Credentials

- email: test@polito.it , password: password ->  full-time
- email: miriana@polito.it , password: password -> part-time
- email: alessio@polito.it , password: password -> part-time
- email: silvia@polito.it , password: password -> part-time
- email: lucia@polito.it , password: password -> full-time
