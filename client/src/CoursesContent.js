import { Table, Button, Container, Row, Col, Card } from "react-bootstrap";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import {GoPlus} from "react-icons/go";
import { useState } from "react";
import API from "./API";

function CoursesContent(props) {
  return (
    <Container style={{ marginTop: "80px"}}>
      <Row style={{ marginBottom: "5px" }}>
        <Col>
          <h1>Corsi</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <CourseTable courses={props.courses} checkPianoStudio={props.checkPianoStudio} AddCourse={props.AddCourse} user={props.user} editing={props.editing}/>
        </Col>
      </Row>
    </Container>
  );
}

function CourseTable(props) {
  return (
    <>
      <Table hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Codice</th>
            <th>Crediti</th>
            <th>N. Studenti</th>
            <th>N. max Studenti</th>
          </tr>
        </thead>
        <tbody>
          { props.renderPlan ? //lo passo da StudyPlanArea, come props.editing
          props.pianoStudio.map((c) => (<CourseRow course={c} key={c.codice} DeleteCourse={props.DeleteCourse} renderPlan={props.renderPlan} editing={props.editing} courses={props.courses} />)) //idea creare un altro componente per le righe del piano studio, in modo che posso abilitare nei corsi quando sono in editing il pulsante Add e
          :
          props.courses.map((c) => (<CourseRow course={c} key={c.codice} AddCourse={props.AddCourse} renderPlan={props.renderPlan} checkPianoStudio={props.checkPianoStudio} user={props.user} editing={props.editing} />)) //in modo che posso abilitare nei corsi quando sono in editing la possibilità di click
          } 
        </tbody>
      </Table>
    </>
  );
}

function CourseRow(props) {
  const [showDetails, setShowDetails] = useState(false);
  const [incompatibleCourses, setincompatibleCourses] = useState([]);
  const [propedeuticoName, setPropedeuticoName] = useState([]);

  //evidenzia la riga del corso che è estato espanso
  let statusClass=null;
  if(showDetails)
	  statusClass='table-active'

  //funzione che carica, nel momento del click a espandi, i corsi incompatibili con il corso corrente
  function LoadincompatibleCourse (course) {
    API.getCorsiIncompatibili(course.codice)
        .then( (incompatibleCourses) => setincompatibleCourses(incompatibleCourses))
        .catch( err => console.log(err))

    API.getNomePropedeutico(course.propedeutico)
      .then( (propedeuticoName) => setPropedeuticoName(propedeuticoName))
      .catch( err => console.log(err))


    setShowDetails(true);
  }
  
  //evidenzia le linee dei corsi che sono stati inseriti nel piano studio o che non possono essere inseriti nel piano studi
  //se stiamo visualizzando la tabella corsi, se c'è un utente autenticato e se siamo in editing
  if(!props.renderPlan && props.user && props.editing){ 
    const added = props.checkPianoStudio.find( c => c.codice === props.course.codice );
    if(added)
      statusClass='table-success'
    
    if(props.course.status==='error')
      statusClass='table-danger'
  }

  function handleAdd (corso) {
    //funzione che mi prende i corsi incompatibili dall'API e li inserisce nel corso e poi lo mando alla funzione che gestisce i vari vincoli
    API.getCorsiIncompatibili(corso.codice)
        .then( (incompatibleCourses) => {
          setincompatibleCourses(incompatibleCourses)
          corso.incompatibili= incompatibleCourses.map((c) => c.codiceIncompatibile)
          props.AddCourse(corso)
        })
        .catch( err => console.log(err))
  }

  function handleDelete (corso) {
    props.DeleteCourse(corso)    
  }

  return (
    <>
    { props.course.codice ? //se il codice corso è NULL non visualizzare
    <>
      <tr className={statusClass}>
        <th>{props.course.nome}</th>
        <td>{props.course.codice}</td>
        <td>{props.course.crediti}</td>
        <td>{props.course.studenti_partecipanti}</td>
        <td>{props.course.max_studenti}</td>
        <td>
          {!showDetails ? (
            <Button variant="light" onClick={() => LoadincompatibleCourse(props.course)}>
              <MdExpandMore className="navBar-icon" />
            </Button>
          ) : (
            <Button variant="light" onClick={() => setShowDetails(false)}>
              <MdExpandLess className="navBar-icon" />
            </Button>
          )}
        </td>
        <td>
        { (props.renderPlan && props.editing) ? <Button variant='danger' onClick={() => {handleDelete(props.course)}}><FaTrashAlt className="navBar-icon"/></Button>  : false } 
        { (!props.renderPlan && props.editing) ?  <Button onClick={() => handleAdd(props.course)}><GoPlus className="navBar-icon"/></Button>  : false }
        </td>
      </tr>
      <CourseDetails course={props.course} showDetails={showDetails} incompatibleCourses={incompatibleCourses} propedeuticoName={propedeuticoName}/>
    </>
      :
    false
    }
    </>
  );
}

function CourseDetails(props) {

  return (
    <>
      {props.showDetails ? (
			<>
			<tr className="table-active">
				<td style={{fontStyle: 'italic'}}>Corsi Propedeutici:</td>
				<td> {props.course.propedeutico == null
                      ? "Nessun corso propedeutico"
                      : <ShowCorsoPropedeutico course={props.course} propedeuticoName={props.propedeuticoName}/> }
				</td>
				<td></td>
				<td></td>
        <td></td>
			</tr>
			<tr className="table-active">
				<td style={{fontStyle: 'italic'}}>Corsi Incompatibili:</td>
				<td> {props.incompatibleCourses.length === 0 ? 
					"Nessun corso incompatibile" : props.incompatibleCourses.map((c) => <ShowCorsiIncompatibili c={c} key={c.codiceIncompatibile}/>)}
				</td>
				<td> </td>
				<td></td>
        <td></td>
			</tr>
			</>
      ) 
	  : 
	  (<tr></tr>)}
    </>
  );
}

function ShowCorsoPropedeutico(props){
  return(
		<Card.Text style={{fontStyle: 'italic'}}>
      {props.course.propedeutico}: {props.propedeuticoName}
		</Card.Text>
	);
}

function ShowCorsiIncompatibili(props){
	return(
		<Card.Text style={{fontStyle: 'italic'}}>
      {props.c.codiceIncompatibile}:  {props.c.nomeIncompatibile}
		</Card.Text>
	);
}


export {CoursesContent, CourseTable};
