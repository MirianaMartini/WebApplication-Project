import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "react-bootstrap";
import { useState } from "react";

function ErrorWindow(props) {
    const [show] = useState(true);

    return (
      <>
        <Modal show={show} onHide={() => props.setErrorMessage('')} animation={false}>
          <Modal.Header style={{background: '#990000', borderBlockColor: '#990000'}} closeButton>
            <Modal.Title >Error</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{background: '#990000'}} ><strong>{props.errorMessage}</strong></Modal.Body>
        </Modal>
      </>
    );
  }
  
  export {ErrorWindow};