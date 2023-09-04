import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { BsEmojiFrown } from "react-icons/bs";
import API from "./API";
import NavBar from "./NavBar.js";
import {CoursesContent} from "./CoursesContent";
import StudyPlanArea from "./StudyPlanArea";
import { LoginForm } from "./LoginComponent";
import { ErrorWindow} from "./ErrorWindow";

function App() {
  return (
    <Router>
      <App2 />
    </Router>
  )
}

function App2() {
  const [initialLoading, setInitialLoading] = useState(true); 
  const [courses, setCourses] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState({}); //oggetto vuoto
  const [pianoStudio, setPianoStudio] = useState([]);
  const [editing, setEditing] = useState(false); //stato che mi dice se sono in modalità di editingPianoStudio
  const [coursesToUpdate, setCoursesToUpdate] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  useEffect(()=> { 
    //vede a caricamento applicazione se esiste una sessione
      const checkAuth = async() => {
        try {
          const user = await API.getUserInfo();
          setLoggedIn(true);
          setUser(user);
        } catch(err) {
          handleError(err);
        }
      };
      checkAuth();
    
    //caricamento in ordine Alfabetico dei corsi
      API.getAllCourses()
        .then( (courses) => setCourses(courses.sort(AlfabeticOrder)))
        .catch( err => handleError(err))
    }, []);  

  useEffect(() => {
    //Quando ha caricato tutti i corsi, visualizzo la HomePage
    if(courses.length){
      setInitialLoading(false);
    }
  }, [courses.length]);

  useEffect(() => {
    //creare uno useEffect di caricamento Piano di studi quando c'è un utente Autenticato e quando è stata apportata una modifica
    //metto la condizione nell'if modificaPianoStudio per evitare che la use effect venga richiamata, essendo che alla fine rimodifichiamo il valore 
    if( loggedIn ){
      //ogni volta che apporto modifiche al pian studi ricerco anche lo user in modo tale che se è stato creato il piano di studi, switcha visualizzazione idem se è stato cancellato
      API.getUser()
        .then((user) => {
          setUser(user)

          API.getAllCourses()
            .then( (courses) => {
              setCourses(courses.sort(AlfabeticOrder))

              API.getPianoStudio()
                .then((pianoStudio) => setPianoStudio(pianoStudio.sort(AlfabeticOrder)))
                .catch( err => handleError(err))
            })
            .catch( err => handleError(err))
        })
        .catch( err => handleError(err))

      setCoursesToUpdate([]);
    }
  }, [loggedIn, editing])

  function AlfabeticOrder(a, b) {
    const nameA = a.nome.toUpperCase(); // ignore upper and lowercase
    const nameB = b.nome.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    // names must be equal
    return 0;
  }

  function handleError(err) {
    console.log(err);
  }

  //LogIn
  const doLogIn = (credentials) => {
    API.logIn(credentials)
      .then( user => {
        setLoggedIn(true);
        setUser(user);
        setErrorMessage('');
        navigate('/');
      })
      .catch(err => {
        setErrorMessage(err);
      })
  }

  //LogOut 
  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser({});
    setPianoStudio([]);
    setCourses([]);
    setEditing(false);
    API.getAllCourses()
          .then( (courses) => setCourses(courses.sort(AlfabeticOrder)))
          .catch( err => handleError(err))
  }

  //Aggiungo Corso In modo provissorio
  const AddCourse=(corso)=>{
    //controllare che il corso non è già presente nel piano studio
    if(pianoStudio.find(c => c.codice === corso.codice) !== undefined){ 
      //se non è undefined vuol dire che lo ha trovato quindi esiste già il corso nel piano studi
      setErrorMessage("Corso già presente nel tuo Piano di Studi")
      return;
    }
    
    //controllare le incompatibilità
    if(pianoStudio.find(c => corso.incompatibili.find((c_i) => c_i === c.codice ))){
      //se non è undefined vuol dire che c'è un corso nel piano di studi incompatibile con il corso che si vorrebbe aggiungere
      setErrorMessage("Corso Incompatibile con uno presente nel tuo Piano di Studi")
      corso.status='error'
      setCourses(courses => courses.map( c => (c.codice === corso.codice) ? corso : c));
      return;
    }
    
    //controllare le propedeuticità
    if(corso.propedeutico && pianoStudio.find(c => c.codice === corso.propedeutico) === undefined){
      //se il corso ha un corso propedeutico ma non è stato trovato nel piano di studi non lo può inserire
      setErrorMessage("Il corso che vuoi inserire ha un Corso Propedeutico che non è presente nel tuo Piano di Studi")
      corso.status='error'
      setCourses(courses => courses.map( c => (c.codice === corso.codice) ? corso : c));
      return;
    }
    
    //controllare che non si supera il numero massimo di studenti
    if(corso.max_studenti){   
      if(corso.max_studenti<corso.studenti_partecipanti+1){
        //se il numero massimo di studenti è minore del numero di partecipanti + 1 allora non può aggiungerlo al suo piano studi
        setErrorMessage("Il corso ha raggiunto il numero massimo di partecipanti")
        corso.status='error'
        setCourses(courses => courses.map( c => (c.codice === corso.codice) ? corso : c));
        return;
      }
    }

    //controllare che non si supera il numero massimo di crediti consentiti dal piano studio
    let max_value;
    if(user.tipologia_pianostudio==='full-time') max_value=80
    if(user.tipologia_pianostudio==='part-time') max_value=40

    const SommaCrediti = (key) => {
      let current = pianoStudio.reduce((a, b) => a + b[key], 0);
      return (current + corso[key]);
    }

    if(SommaCrediti('crediti')>max_value){
        setErrorMessage("Il tuo Piano di Studio non può aggiungere il corso selezionato in quanto supererebbe il numero massimo di crediti consentito")
        corso.status='error'
        setCourses(courses => courses.map( c => (c.codice === corso.codice) ? corso : c));
        return;
    }

    //se tutto va bene aggiungere così alla lista 
    corso.studenti_partecipanti=corso.studenti_partecipanti+1; 
    corso.status=''
    setPianoStudio(oldList => [...oldList, corso])

    //devo controllare che se esiste nella lista da cancellare un corso che ha lo stesso codice che ho inserito lo devo eliminare dalla mia lista di corsi da cancellare
    if(coursesToUpdate.find((c) => c.codice === corso.codice))
      setCoursesToUpdate( oldList => { return oldList.filter((c) => c.codice !== corso.codice)})
  }

  //Cancella corso in modo provvisorio
  const DeleteCourse =(corso) => {
     //controllare le propedeuticità
     if(pianoStudio.find(c => c.propedeutico === corso.codice)){
      //se il corso ha un corso propedeutico è lo trovo nel piano studio non lo posso eliminare 
      setErrorMessage("Il corso che vuoi eliminare è propedeutico per un corso presente nel tuo Piano di Studi")
      //corso.status='error'
      //setCourses(courses => courses.map( c => (c.codice === corso.codice) ? corso : c));
      return;
    }
    
    corso.studenti_partecipanti=corso.studenti_partecipanti-1; 
    if(corso.studenti_partecipanti<0) corso.studenti_partecipanti=0;
    if(corso.studenti_partecipanti===0) corso.studenti_partecipanti=null;
    //cancella il corso dal piano studio
    setPianoStudio( oldList => { return oldList.filter((c) => c.codice !== corso.codice)})
    setCourses(courses => courses.map( c => (c.codice === corso.codice) ? corso : c));
    //mi salvo in courseToUpdate i corsi che ho cancellato e di cui devo andare a decrementare di 1 il numero di studenti partecipanti
    setCoursesToUpdate(oldList => [...oldList, corso])
  }
  
  return (
    <>
        <Routes>
          <Route
            path="/"
            element={
              initialLoading ? <Loading /> : <HomePage loggedIn={loggedIn} user={user} courses={courses} pianoStudio={pianoStudio} doLogout={doLogOut} editing={editing} setEditing={setEditing} AddCourse={AddCourse} DeleteCourse={DeleteCourse} coursesToUpdate={coursesToUpdate} errorMessage={errorMessage} setErrorMessage={setErrorMessage}/> 
            }
          />
          <Route
            path="/login"
            element={
              !loggedIn ? <LoginPage login={doLogIn} errorMessage={errorMessage} setErrorMessage={setErrorMessage}/> : <Navigate to='/'/>
            }
          />
          <Route path="*" element={<PageNotFound />} />
        </Routes>

    </>
  );
}

function Loading() {
  return (
    <Container className="App-header">
      <h2>Loading Data...</h2>
    </Container>
  );
}

function HomePage(props) {
  return (
    <>
      {!props.loggedIn ? 
      (  //se non sono LoggedIn, visualizzo solo elenco Corsi
        <>
          <NavBar loggedIn={props.loggedIn} user={props.user} doLogout={props.doLogout}/>
          <CoursesContent courses={props.courses}/>
        </>
      ) :
      ( //se sono LoggedIn
      <>
        { props.user ?
        <>
          <NavBar loggedIn={props.loggedIn} user={props.user} doLogout={props.doLogout}/>{" "}
          <Container fluid>
            <Row>
              <Col xs={6} className="bg-light">
                <CoursesContent courses={props.courses} AddCourse={props.AddCourse} checkPianoStudio={props.pianoStudio} user={props.user} editing={props.editing}/>
              </Col>
              <Col xs={6}>
                <StudyPlanArea pianoStudio={props.pianoStudio} DeleteCourse={props.DeleteCourse} coursesToUpdate={props.coursesToUpdate} user={props.user} editing={props.editing} setEditing={props.setEditing} courses={props.courses} />
              </Col>
            </Row>
          </Container>
          {props.errorMessage ? 
            <ErrorWindow errorMessage={props.errorMessage} setErrorMessage={props.setErrorMessage}/>
          : (
            false
          )}
        </>
        :
        <Navigate to='/login'/>
          }
        </>
      )
      }
    </>
  );
}

function LoginPage(props) {
  return (
    <>
      <NavBar flag={true}/>{/* Il flag lo uso per cambiare il contenuto del bottone sulla navbar */} 
      <LoginForm login={props.login} errorMessage={props.errorMessage} setErrorMessage={props.setErrorMessage}/>
    </>
  );
}

function PageNotFound() {
	const navigate = useNavigate();

	const handleBack = () => {
		navigate("/");
	};

	return (
		<>
			<Container className="App-header">
				<h1>Page not found</h1>
				<BsEmojiFrown size={50} />
				<Button
					onClick={handleBack}
					style={{ marginTop: "20px" }}
					variant="primary"
				>
					{"Ritorna alla HomePage"}
				</Button>
			</Container>
		</>
	);
}

export default App;
