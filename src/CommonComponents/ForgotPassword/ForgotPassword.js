import React, { Component, PropTypes } from 'react';
import axios from 'axios';
import './ForgotPassword.css'
import { validateEmail } from '../../helper';
import { Col, Row, Form, Button } from "react-bootstrap";
import SharedModal from '../../sharedComponent/ModalComponent/ModalComponent';
import Loader from '../../sharedComponent/Loader/Loader';

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email : "",
            'formErrors': {},
            'errorClass': {},
            showLoader: false
        }
        this.sendEmail = this.sendEmail.bind(this);        
    }
    onResponse = (msg,error) => {
        this.displayModalComponent.showModal(msg, 'Forgot Password Response', error);
      }
    handleChange = name => (event) => {
        this.setState({
          [name]: event.target.value,
        });
        this.handleValidation();
      };
    handleValidation = () => {
        let errors = {};
        let errorClass = {};
        let formIsValid = true;
        let email = this.state.email;
        if(!email){// Need to Rectify this code
            formIsValid = false;
            errors["email"] = "Cannot be empty";
            errorClass["email"] = "custom-error-border";
         }else{
            if(!validateEmail(email)){
                formIsValid = false;
                errors["email"] = "Invalid email ID";
                errorClass["email"] = "custom-error-border";
            }
         }
         this.setState({formErrors: errors, errorClass: errorClass});
         return formIsValid;
    }
    sendEmail = (event) => {
        event.preventDefault();
        try{
            if(this.handleValidation()){
                const reqObj = {
                    email : this.state.email
                }
                this.setState({showLoader: true});
              axios.post('http://localhost:5001/api/forgotPassword', reqObj).then(resp => {
                this.setState({showLoader: false});
                console.log('forgot password', resp);
                if(!resp.data.error){
                    this.setState({formErrors: {}, errorClass: {}});
                    this.onResponse(resp.data.message,resp.data.error);
                }else{
                this.onResponse(resp.data.message,resp.data.error);
                }
                
            }, (error) => {
                console.log('error =>', error);
                // this.onResponse(resp.data.message,resp.data.error);                
            });
            }

        } catch(e) {
            console.log(e);
        }
    }
      render(){
        const changeEvent = () => {
            this.props.history.push("/");
        }
            return (
                <div className="login-container">
                    <div className="title-header">
                        <h5>Forgot Password</h5>
                    </div>
                    <Form onSubmit={this.sendEmail}>
                        <Form.Group as={Row} controlId="formPlaintextEmail">
    
                            <Form.Label column sm="4">
                                User Name:
                            </Form.Label>
                            <Col sm="8">
                                <Form.Control type="text" placeholder="Email"  name="email"  onChange={this.handleChange('email')} className={this.state.errorClass['email']}/>
                                <span className="field-err">{this.state.formErrors["email"]}</span>
                            </Col>
                        </Form.Group>
    
                        {/* <Form.Group as={Row}>
                            <Col sm="12" className="text-center pt-3">
                                <Button variant="primary" type="submit" className="btn-app-primary">
                                    Submit
                                </Button>
                            </Col>
                        </Form.Group> */}
                        <Form.Group as={Row}>
                        <Col sm="12" className="text-center pt-3">
                            <Button variant="primary" type="submit" className="btn-app-primary">
                                Submit
                            </Button>
                            <Button variant="primary" className="btn-app-outline ml-3" onClick={() => changeEvent()}>
                                Login
                            </Button>
                        </Col>
                    </Form.Group>
                    </Form>
                    <SharedModal ref={(showModal) => this.displayModalComponent = showModal}></SharedModal>
                    {this.state.showLoader ? (
                <Loader/>
                ) : (<></>)}
                </div>
            );
      }
}

export default ForgotPassword;