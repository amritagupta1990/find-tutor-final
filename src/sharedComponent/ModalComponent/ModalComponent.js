import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import Parser from 'html-react-parser';
import './ModalComponent.css';
class SharedModal extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            displayModal: false,
            messageBody : '',
            heading_msg: '',
            btn_text: "",
            isMessageEvent: false,
            messageAdded: '',
            errorClass: 'error-span d-none',
            btnClass: '',
            headerClass: '',
            isRequestEvent: false
        };
        this.showModal = this.showModal.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.commentHandler = this.commentHandler.bind(this);
        this.handleCloseAlongwithOther = this.handleCloseAlongwithOther.bind(this);
    }
    showModal(msg, heading_msg="Modal Heading", error=false, btn_text="Ok", isMessageEvent= false, isRequestEvent = false) {
        // console.log("Open modal called ", this.state.displayModal);
        // const modalVisible = !this.state.displayModal;
        if(error){
          this.setState({btnClass: 'errorBtn', headerClass: 'errorHeader'});
        }else{
          this.setState({btnClass: 'successBtn', headerClass: 'successHeader'});
        }
        this.setState({
            displayModal: true,
            messageBody: msg,
            heading_msg: heading_msg,
            btn_text: btn_text,
            isMessageEvent: isMessageEvent,
            isRequestEvent: isRequestEvent
        }, ()=>{
          // this.messageText = React.createRef();
          console.log('this.state.messageBody', this.state.messageBody);
        });
      }
    handleClose(){
      this.setState({ displayModal: false });
    }
    handleCloseAlongwithOther(){
      if(this.state.isMessageEvent){
        if(this.state.messageAdded === ''){
          this.setState({ errorClass: "error-span" });
        }else{
          if(this.state.isRequestEvent)
            this.props.parentCallback(this.state.messageAdded, 'request');
          else{
            this.props.parentCallback(this.state.messageAdded, 'message');
          }
          this.setState({ displayModal: false });
        }
      }else{
        this.setState({ displayModal: false });
      }
    }
    commentHandler = (ev)  => {
      ev.preventDefault();
      this.setState({ messageAdded: ev.target.value });
    }
    render(){
        return (
            <>
            <Modal show={this.state.displayModal} onHide={this.handleClose}>
              <Modal.Header closeButton className={this.state.headerClass}>
                <Modal.Title>{Parser(this.state.heading_msg)}</Modal.Title>
              </Modal.Header>
                <Modal.Body>
                  {Parser(this.state.messageBody, {
                      replace: domNode => {
                        if (domNode.attribs && domNode.attribs.id === 'messageText') {
                          return <><textarea className="form-control" onChange={this.commentHandler}></textarea><span className={this.state.errorClass}>*Please enter comment.</span></>;
                        }
                      }
                    })}
                </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={this.handleCloseAlongwithOther} className={this.state.btnClass}>
                  {this.state.btn_text}
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        );
    }

}

export default SharedModal;