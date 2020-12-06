import React, { Component } from 'react';
// import ReactDOM from "react-dom";
import { Col, Row, Form, Button} from "react-bootstrap";
import axios from 'axios';
import './Login.css';
import { validateEmail } from '../../helper';
import SharedModal from '../../sharedComponent/ModalComponent/ModalComponent';
import Loader from '../../sharedComponent/Loader/Loader';
// import { Redirect } from "react-router-dom";

class LoginComponent extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            'response': '',
            'redirect': null,
            'fields': {},
            'formErrors': {},
            'errorClass': {},
            showLoader: false
        }
        // this.submitLoginForm = this.submitLoginForm.bind(this);
        this.doLogin = this.doLogin.bind(this);
    }
    componentDidMount() {
        this._isMounted = true;
    }
    componentWillUnmount() {
        this._isMounted = false;
      }

    // submitLoginForm(event){ 
    //     event.preventDefault();
    //     // code you want to do
    //     console.log('email', this.refs.email.value);
    //     this.setState({
    //         'email': this.refs.email.value,
    //         'password': this.refs.password.value

    //     }, () => {
    //         console.log('this.state', this.state); // This.setState is asynchronous function, so we needed to add callback function to get the updated state
    //         this.doLogin();
    //     });
       
        
        
    //   }
    
      doLogin(event){
          event.preventDefault();
        //   console.log(this.state);
          try {
              if(this.handleLoginValidation()){
                const reqObj = {
                    email: this.state.fields.email,
                    password: this.state.fields.password
                }
                this.setState({showLoader: true});
                axios.post('http://localhost:5001/api/login', reqObj).then(resp => {
                    // const { status, userDetails } = resp.data;
                    // this.setState({
                    //     response: userDetails[0]
                    // });
                    // console.log(this.state)
                    // console.log('login Result ===>', resp);
                    if(resp.data.isValidUser){
                        localStorage.setItem('auth-data',resp.data.token);
                        localStorage.setItem('user-details',JSON.stringify(resp.data.userDetails));
                        if (this._isMounted) {
                            this.setState({
                                redirect: '/dashboard',
                                showLoader: false
                    
                            }, () => {
                                console.log('this.state', this.state); // This.setState is asynchronous function, so we needed to add callback function to get the updated state
                                this.props.history.push("/dashboard");
                            });
                        }
                        
                        
                    }else{
                        this.setState({
                            showLoader: false
                        });
                        this.onResponse(resp.data.message, resp.data.error);
                    }
                    
                }, (error) => {
                    console.log('error =>', error);
                });
              }

        } catch(e) {
            console.log(e);
        }
      }
      handleLoginValidation = (event) => {
        const fields = this.state.fields;
        let errors = {};
        let errorClass = {};
        let formIsValid = true;
        if(!fields["email"]){// Need to Rectify this code
            formIsValid = false;
            errors["email"] = "Cannot be empty";
            errorClass["email"] = "custom-error-border";
        }else{
        if(!validateEmail(fields["email"])){
            formIsValid = false;
            errors["email"] = "Invalid email ID";
            errorClass["email"] = "custom-error-border";
        }
        }

        if(!fields["password"]){
        formIsValid = false;
        errors["password"] = "Cannot be empty";
        errorClass["password"] = "custom-error-border";
        }
        this.setState({formErrors: errors, errorClass: errorClass});
        return formIsValid;
      };
      

      changeHandler = (event) => {
        var name = event.target.name;
        var val = event.target.value;
        let fields = this.state.fields;
        fields[name] = val;
        this.setState({fields}, function(){
            this.handleLoginValidation();
        });
      }
      onResponse = (msg, error) => {
        console.log('displayModalComponent', this.displayModalComponent);
        this.displayModalComponent.showModal(msg, 'Login Response', error);
      }
   
    render() {
        const changeEvent = (url) => {
            this.props.history.push(`/${url}`);
        }
        return (
            <div className="login-container">
                <div className="title-header">
                    <h5>Log In</h5>
                </div>
                <Form onSubmit={this.doLogin}>
                    <Form.Group as={Row} controlId="formPlaintextEmail">

                        <Form.Label column sm="4">
                            User Name:
                        </Form.Label>
                        <Col sm="8">
                            <Form.Control type="text" placeholder="Email"  name="email" onChange ={this.changeHandler} className={this.state.errorClass['email']}/>
                            <span className="field-err">{this.state.formErrors["email"]}</span>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="4">
                            Password:
                        </Form.Label>
                        <Col sm="8">
                            <Form.Control type="password" placeholder="Password" name="password" onChange ={this.changeHandler} className={this.state.errorClass['password']}/>
                            <span className="field-err">{this.state.formErrors["password"]}</span>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Col sm="12" className="text-center pt-3">
                            <Button variant="primary" type="submit" className="btn-app-primary">
                                Submit
                            </Button>
                            <span className="forgot-password">
                                <a onClick={() => changeEvent('forgot-password')}>Forgot Password?</a>
                            </span>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                            <Col sm="12" className="font-13">
                                <span className="registration">
                                   <a onClick={() => changeEvent('registration')}>New User ? Registration</a>
                                </span>
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

export default LoginComponent;