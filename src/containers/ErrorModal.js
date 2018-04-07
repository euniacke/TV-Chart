import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class ErrorModal extends Component{
   constructor(props) {
    super(props);
  }

  render(){
    return(
        <Modal isOpen={this.props.open} toggle={this.props.toggle} centered={true}>
          <ModalBody>
            {this.props.errorMsg}
          </ModalBody>
          <ModalFooter>
            <Button color="info" onClick={this.props.toggle}>Okay</Button>{' '}
          </ModalFooter>
        </Modal>
      );
  }
}

export default ErrorModal;