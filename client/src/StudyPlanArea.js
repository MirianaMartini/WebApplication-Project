import {Button,Container,Row,Col,Form,Alert} from "react-bootstrap";
import "./App.css";
import { TiDelete } from "react-icons/ti";
import { FiEdit3 } from "react-icons/fi";
import { useState } from "react";
import { CourseTable } from "./CoursesContent";
import API from "./API";

function StudyPlanArea(props) {
  const [showForm, setShowForm] = useState(false);
  const [flag, setFlag] = useState(false);
  const [tipologia, setTipologia] = useState(false);

  return (
    <>
      { ((!props.user.tipologia_pianostudio && !flag) || (props.user.tipologia_pianostudio && flag)) ? ( //nel caso in cui NON è stato ancora creato un piano di studio per quell'user
        <Container className="App-header">
          {!showForm ? ( //se showForm è false, appare il bottone
            <Button variant="success" onClick={() => setShowForm(true)}>
              {"Crea il tuo Piano di Studio"}
            </Button>
          ) : ( //se showForm è false, appare il form di creazione Piano Studi
            <FormComponent setShowForm={setShowForm} CreateStudyPlan={props.CreateStudyPlan} setFlag={setFlag} setTipologia={setTipologia}/>
          )}
        </Container>
      ) : (
        //nel caso in cui è stato creato un piano di studio
        <Container>
          <StudyPlanContent pianoStudio={props.pianoStudio} DeleteCourse={props.DeleteCourse} coursesToUpdate={props.coursesToUpdate} user={props.user} editing={props.editing} setEditing={props.setEditing} tipologia={tipologia} flag={flag} setFlag={setFlag} courses={props.courses}/>
        </Container>
      )}
    </>
  );
}

function FormComponent(props) {
  const [tipologia, setTipologia] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!tipologia) {
      setErrorMessage("Selezionare una delle due alternative");
    } 
    else {
        props.setFlag(true)
        props.setTipologia(tipologia)
    }
  };

  return (
    <>
      <Form>
        <Form.Group>
          <Form.Label>Che Piano di Studi intendi creare: </Form.Label>
          <Form.Control
            as="select"
            value={tipologia}
            onChange={(ev) => setTipologia(ev.target.value)}
          >
            <option hidden value="">
              Scegli tra...
            </option>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
          </Form.Control>
        </Form.Group>
        <Row>
          <Col>
            <Button style={{ marginTop: "40px" }} onClick={handleSubmit}>
              Crea il tuo Piano Studi
            </Button>
          </Col>
          <Col>
            <Button
              style={{ marginTop: "40px" }}
              variant="secondary"
              onClick={() => props.setShowForm(false)}
            >
              {"Annulla"}
            </Button>
          </Col>
        </Row>
      </Form>
      {/**Errori sul Form */}
      {errorMessage ? (
        <Alert
          style={{ marginTop: "30px", fontSize: "20px" }}
          variant="danger"
          onClose={() => setErrorMessage("")}
          dismissible
        >
          {errorMessage}
        </Alert>
      ) : (
        ""
      )}{" "}
    </>
  );
}

function StudyPlanContent(props) {
  const [errorMsg, setErrorMsg] = useState('')

  const handleEditing = () => {
    if(props.editing){
        props.setEditing(false);
    }
    else{
      props.setEditing(true);
    }
  }

  //cancella piano di studio in modo permanente
  const deletePianoStudio= () => {
    if(props.user.tipologia_pianostudio){
      API.deleteStudyPlan(props.pianoStudio)
        .then((res) => {
          if(res) setErrorMsg(res.error)
          else{
            props.setEditing(false);
            props.setFlag(false);
          }
        });
    }
    else {
      props.setEditing(false);
      props.setFlag(false);
    }
  }

  //salva piano studio in modo permanente
  const SavePianoStudio=()=>{
    let min_value;
    let max_value;
    if(props.user.tipologia_pianostudio){ //se già esiste un piano di studio per quell'utente
      if(props.user.tipologia_pianostudio==='full-time') {min_value=60; max_value=80}
      if(props.user.tipologia_pianostudio==='part-time') {min_value=20; max_value=40}
    }
    else{
      if(props.tipologia==='full-time') {min_value=60; max_value=80;}
      if(props.tipologia==='part-time') {min_value=20; max_value=40;}
    }
    
    let somma_crediti=SommaCrediti('crediti')

    if(somma_crediti >= min_value && somma_crediti <= max_value){
      if(!props.user.tipologia_pianostudio)
        API.CreateStudyPlan(props.tipologia);

      API.SaveStudyPlan(props.pianoStudio, props.coursesToUpdate)
        .then((res) => {if(res) {
            //se c'è un errore, Resto in Editing
            setErrorMsg(res.error);
            props.setEditing(true);
            props.setFlag(false);
          }
          else {
            //se NON c'è un errore, esco dall'Editing
            props.setEditing(false);
            props.setFlag(false);
          }
        })
    }
    else setErrorMsg(`Il piano studi non può essere salvato in quanto deve avere un numero di crediti Totali compreso tra ${min_value} - ${max_value}`)
  }

  const SommaCrediti = (key) => {
    return props.pianoStudio.reduce((a, b) => a + b[key], 0);
  }

  return (
    <Container fluid style={{ marginTop: "80px" }}>
      <Row style={{ marginBottom: "5px" }}>
        <Col>
          <h1>Piano di Studio</h1>
        </Col>
        <Col>
        {!props.editing ?
        <Button variant='secondary' onClick={() => {handleEditing()}}> Modifica il Tuo Piano Studio <FiEdit3 className="navBar-icon"/></Button> 
          :
        false
        }
        </Col>
      </Row>
        {props.editing ?
        <>
        <Row style={{marginBottom: '20px'}}>
        <Col xs={2}><Button variant='success' onClick={() => {SavePianoStudio()}}> Salva </Button></Col>
        <Col xs={6}><Button variant='danger' onClick={() => {deletePianoStudio()}}> Cancella Piano Studi <TiDelete className="navBar-icon"/></Button></Col>
        <Col xs={2}><Button variant='secondary' onClick={() => {handleEditing()}}> Annulla </Button></Col>
        </Row>
        </>
        : false
        }
      <Row>
     
         { (props.user.tipologia_pianostudio) ?
          <Col xs={4}>Tipologia: <strong>{props.user.tipologia_pianostudio}</strong></Col>
          : 
          <Col xs={4}>Tipologia: <strong>{props.tipologia}</strong></Col>
        }

        {props.editing ?
        <>
  
          Totale Crediti consentito: {" "}
          { (props.user.tipologia_pianostudio) ?
          <Col xs={2}>{props.user.tipologia_pianostudio==='full-time' ? <strong>60 - 80</strong> : <strong>20 -40</strong>}</Col>
          : 
          <Col xs={2}>{props.tipologia==='full-time' ? <strong>60 - 80</strong> : <strong>20 -40</strong>}</Col>
          }
          

        <Col>
          Crediti Attuali: {" "}
          <strong>{SommaCrediti('crediti')}</strong>
        </Col>
        </>
        : false
        }
      </Row>
      <Row style={{marginTop: '20px'}}>
        <Col>
          {errorMsg ? 
           <Alert variant='danger' onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> 
          : false}
          <CourseTable pianoStudio={props.pianoStudio} DeleteCourse={props.DeleteCourse} renderPlan={true} editing={props.editing} courses={props.courses}/>
        </Col>
      </Row>
    </Container>
  );
}


export default StudyPlanArea;
