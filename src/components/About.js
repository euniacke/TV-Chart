import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

class About extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  render() {
    return (
      <div id="about" onClick={this.toggle}>
        <a className="clickable">About</a>
        <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>About TV Chart</ModalHeader>
          <ModalBody>
            TV Chart lets you view a chart of any TV show's rating, by episode.<br/><br/>
            Made by Benjamin M. Contact me: benmiz96@gmail.com<br/><br/>
            Data is taken from <a href="http://www.omdbapi.com">OMDb API</a>.<br/>
            Chart is powered by <a href="http://recharts.org">Recharts</a>.<br/>
            Inspired by (the now inoperational) <a href="http://graphtv.kevinformatics.com/">Graph-TV</a>.

            </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default About;