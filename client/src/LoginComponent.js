import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useState } from 'react';

function LoginForm(props) {
  const [username, setUsername] = useState('test@polito.it');
  const [password, setPassword] = useState('password');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleSubmit = (event) => {
      event.preventDefault();
      setErrorMessage('');
      const credentials = { username, password };
      
      let valid = true;
      if(username === '' || username.trim().length === 0 || !username.includes('@') || password === '' || password.trim().length === 0)
          valid = false;
      
      if(valid)
      {
        props.login(credentials);
      }
      else {
        let msg='';
        if(username===''){
            msg="Il campo Email deve essere riempito!";
        }
        if(username.trim().length===0){
            msg="Il campo Email non può essere composto da solo spazi!";
        }
        if(!username.includes('@')){
            msg="Email non valida, non è presente la @";
        }
        if(password===''){
            msg="La password non può essere vuota!";
        }
        if(password.trim().length===0){
            msg="La password non può essere composto da solo spazi!";
        }
        setErrorMessage(msg)
      }
  };

  return (
      <Container style={{ marginTop: "80px"}}>
          <Row>
              <Col>
                  <h2>Login</h2>
                  <Form>
                      {/**Errori sul Form */}
                      {errorMessage ? <Alert variant='danger' onClose={() => setErrorMessage('')} dismissible>{errorMessage}</Alert> : ''}
                      {/**Errori dal DB */}
                      {props.errorMessage ? <Alert variant='danger' onClose={() => props.setErrorMessage('')} dismissible>{props.errorMessage}</Alert> : false}
                      <Form.Group style={{marginTop: '15px'}} controlId='username'>
                          <Form.Label>Email</Form.Label>
                          <Form.Control type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
                      </Form.Group>
                      <Form.Group style={{marginTop: '8px'}} controlId='password'>
                          <Form.Label>Password</Form.Label>
                          <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
                      </Form.Group>
                      <Button style={{marginTop: '15px'}} onClick={handleSubmit}>Login</Button>
                  </Form>
              </Col>
          </Row>
      </Container>
    )
}


export { LoginForm };