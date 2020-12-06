import React, { Component, PropTypes } from 'react';
import axios from 'axios';
import './ResetPassword.css';
import Sidebar from '../../sharedComponent/NavComponent/NavComponent';
import { validateEmail } from '../../helper';
import { Col, Row, Form, Button } from "react-bootstrap";
import SharedModal from '../../sharedComponent/ModalComponent/ModalComponent';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class ResetPassword extends Component {
    constructor() {
        super();
        this.state = {
            newPassword: '',
            confirmPassword: '',
            updated: false,
            isLoading: true,
            error: false,
            'formErrors': {},
            'errorClass': {}
          };      
    }
    onResponse = (msg,error) => {
        this.displayModalComponent.showModal(msg, 'Reset Password Response', error);
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
        let newPassword = this.state.newPassword;
        let confirmPassword = this.state.confirmPassword;
        
        if(!newPassword){
            formIsValid = false;
            errors["newPassword"] = "Cannot be empty";
            errorClass["newPassword"] = "custom-error-border";
         }
         if(!confirmPassword){
          formIsValid = false;
          errors["confirmPassword"] = "Cannot be empty";
          errorClass["confirmPassword"] = "custom-error-border";
        }
        //  if(newPassword && confirmPassword){ //validation done in backend
        //   if((newPassword !== confirmPassword)){
        //     formIsValid = false;
        //     errors["newPassword"] = "Password Not Matching";
        //     errorClass["newPassword"] = "custom-error-border";
        //     errors["confirmPassword"] = "Password Not Matching";
        //     errorClass["confirmPassword"] = "custom-error-border";
        //    }
        //  }
         this.setState({formErrors: errors, errorClass: errorClass});
         return formIsValid;
    }
    async componentDidMount() {

        /**** GET The Token***/
        let tokenId = this.props.match.params.tokenId;

        try {
          const response = await axios.post('http://localhost:5001/api/resetPassword', {
            params: {
              resetPasswordToken: tokenId,
            },
          });
          console.log(response);
          if (response.data.message === 'password reset link a-ok') {
          console.log('response',response);
            
            this.setState({
              email: response.data.email,
              updated: false,
              isLoading: false,
              error: false,
            });
          }
        } catch (error) {
          console.log('error====',error);
          this.setState({
            updated: false,
            isLoading: false,
            error: true,
          });
        }
      }
    
      updatePassword = async (e) => {
        e.preventDefault();
        console.log("current state",this.state);
        const { email, confirmPassword, newPassword } = this.state;
        const tokenId = this.props.match.params.tokenId;

        try {
          const response = await axios.post(
            'http://localhost:5001/api/updatePasswordViaEmail',
            {
              email,
              confirmPassword,
              newPassword,
              resetPasswordToken: tokenId,
            },
          );
          console.log(response.data);
          if (response.data.message === 'password updated') {
            this.setState({
              updated: true,
              error: false,
            });
            this.onResponse(response.data.message);            
          } else {
            this.setState({
              updated: false,
              error: true,
            });
            this.onResponse(response.data.message);            
          }
        } catch (error) {
          console.log(error.response.data);
        }
      };
      
      render(){
        const changeEvent = () => {
          this.props.history.push("/");
      }
            return (
                <div className="login-container">
                    <div className="title-header">
                        <h5>Reset Password</h5>
                    </div>
                    <Form onSubmit={this.updatePassword}>
                        <Form.Group as={Row} controlId="newPassword">
                            <Form.Label column sm="4">
                                New Password:
                            </Form.Label>
                            <Col sm="8">
                                <Form.Control type="password" placeholder="Enter New Password"  name="newPassword"  onChange={this.handleChange('newPassword')} className={this.state.errorClass['newPassword']}/>
                                <span className="field-err">{this.state.formErrors["newPassword"]}</span>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="confirmPassword">
                        <Form.Label column sm="4">
                               Confirm Password:
                        </Form.Label>
                        <Col sm="8">
                            <Form.Control type="password" placeholder="Confirm Password" name="confirmPassword" onChange={this.handleChange('confirmPassword')} className={this.state.errorClass['confirmPassword']}/>
                            <span className="field-err">{this.state.formErrors["confirmPassword"]}</span>
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
                </div>
            );
      }
}

export default ResetPassword;

// ResetPassword.propTypes = {
//     // eslint-disable-next-line react/require-default-props
//     match: PropTypes.shape({
//       params: PropTypes.shape({
//         token: PropTypes.string.isRequired,
//       }),
//     }),
//   };