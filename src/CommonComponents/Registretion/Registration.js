import React, { Component } from 'react';
import ReactDOM from "react-dom";
import { Col, Row, Form, Button} from "react-bootstrap";
import './Registration.css';
import axios from 'axios';
import SharedModal from '../../sharedComponent/ModalComponent/ModalComponent';
import { validateEmail, nameValidation, validatePhoneNumber } from '../../helper';
import Loader from '../../sharedComponent/Loader/Loader';
class RegistrationComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            'fields': {},
            'response': '',
            'redirect': null,
            'formErrors': {},
            'errorClass': {},
            showLoader: false
        }
        this.doRegister = this.doRegister.bind(this);
    }
    
    doRegister (event){
        event.preventDefault();
        try {
            if(this.handleValidation()){
                console.log("Form submitted");
                const reqObj = {
                    email: this.state.fields.email,
                    mobile: this.state.fields.mobile,
                    first_name: this.state.fields.first_name,
                    last_name: this.state.fields.last_name,
                    password: this.state.fields.password,
                    user_role: this.state.fields.user_role
                }
                // console.log(reqObj);
                this.setState({showLoader: true});
                axios.post('http://localhost:5001/api/register_user', reqObj).then(resp => {
                    console.log('register', resp);
                    if(!resp.data.error){
                        this.setState({formErrors: {}, errorClass: {}, fields: {}, showLoader: false});
                        this.registrationFormRef.reset();
                        this.onResponse(resp.data.message, resp.data.error);
                    }else{
                        this.setState({showLoader: false});
                        this.onResponse(resp.data.message, resp.data.error);
                    }
                    
                }, (error) => {
                    console.log('error =>', error);
                    // this.onResponse(error.data.message);
                })
            } 
            else{
                console.log("Form has errors.")
            }
            }
            catch(e) {
                console.log(e);
            }

    }

    handleValidation = () => {
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
         if(!fields["mobile"]){
            formIsValid = false;
            errors["mobile"] = "Cannot be empty";
            errorClass["mobile"] = "custom-error-border";
         }else{
            if(!validatePhoneNumber(fields["mobile"])){
                formIsValid = false;
                errors["mobile"] = "Invalid Number";
                errorClass["mobile"] = "custom-error-border";
            }
         }
         if(!fields["first_name"]){
            formIsValid = false;
            errors["first_name"] = "Cannot be empty";
            errorClass["first_name"] = "custom-error-border";
         }else{
            if(!nameValidation(fields["first_name"])){
                formIsValid = false;
                errors["first_name"] = "Only alphabets are allowed!";
                errorClass["first_name"] = "custom-error-border";
            }
         }
         if(!fields["last_name"]){
            formIsValid = false;
            errors["last_name"] = "Cannot be empty";
            errorClass["last_name"] = "custom-error-border";
         }else{
            if(!nameValidation(fields["last_name"])){
                formIsValid = false;
                errors["last_name"] = "Only alphabets are allowed!";
                errorClass["last_name"] = "custom-error-border";
            }
         }
         if(!fields["password"]){
            formIsValid = false;
            errors["password"] = "Cannot be empty";
            errorClass["password"] = "custom-error-border";
         }else{
            if(fields["password"].length < 6 || fields["password"].length > 15){
                formIsValid = false;
                errors["password"] = "Min Length 6 and Max length 15";
                errorClass["password"] = "custom-error-border";
            }
         }
         if(!fields["confirm_password"]){
            formIsValid = false;
            errors["confirm_password"] = "Cannot be empty";
            errorClass["confirm_password"] = "custom-error-border";
         }else{
            if(fields["password"] !== fields["confirm_password"]){
                formIsValid = false;
                errors["confirm_password"] = "Passwords didn't match!";
                errorClass["confirm_password"] = "custom-error-border";
            }
         }
         if(!fields["user_role"]){
            formIsValid = false;
            errors["user_role"] = "Please select User Type";
            errorClass["user_role"] = "custom-error-border";
         }
        this.setState({formErrors: errors, errorClass: errorClass});
        return formIsValid;
    };

    fieldChangeHandler = (event) => {
        const name = event.target.name;
        const val = event.target.value;
        console.log("val", val);
        // this.setState({[name]: val});
        let fields = this.state.fields;
        fields[name] = val;        
        this.setState({fields}, function(){
            this.handleValidation();
        });
    }
    onResponse = (msg, error) => {
        console.log('displayModalComponent', this.displayModalComponent);
        this.displayModalComponent.showModal(msg, 'Registration Response', error);
      }
    
    render() {
        const changeEvent = () => {
            this.props.history.push("/");
        }
        return (
            <div className="registration-container">
                <div className="title-header">
                    <h5>Registration</h5>
                </div>
                <Form onSubmit={this.doRegister} ref={(el) => this.registrationFormRef = el}>
                    <Form.Group as={Row} controlId="formPlaintextEmail">

                        <Form.Label column sm="4">
                            Email:
                        </Form.Label>
                        <Col sm="8">
                            <Form.Control type="text" placeholder="Email"  name="email" onChange={this.fieldChangeHandler} className={this.state.errorClass['email']}/>
                            <span className="field-err">{this.state.formErrors["email"]}</span>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextMobile">
                        <Form.Label column sm="4">
                            Mobile:
                        </Form.Label>
                        <Col sm="8">
                            <Form.Control type="text" placeholder="Mobile" name="mobile" onChange={this.fieldChangeHandler} className={this.state.errorClass['mobile']}/>
                            <span className="field-err">{this.state.formErrors["mobile"]}</span>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextFirstName">
                        <Form.Label column sm="4">
                            First Name:
                        </Form.Label>
                        <Col sm="8">
                            <Form.Control type="text" placeholder="First Name" name="first_name" onChange={this.fieldChangeHandler} className={this.state.errorClass['first_name']}/>
                            <span className="field-err">{this.state.formErrors["first_name"]}</span>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextLastName">
                        <Form.Label column sm="4">
                            Last Name:
                        </Form.Label>
                        <Col sm="8">
                            <Form.Control type="text" placeholder="Last Name" name="last_name" onChange={this.fieldChangeHandler} className={this.state.errorClass['last_name']}/>
                            <span className="field-err">{this.state.formErrors["last_name"]}</span>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="4">
                            Password:
                        </Form.Label>
                        <Col sm="8">
                            <Form.Control type="password" placeholder="Password" name="password" onChange={this.fieldChangeHandler} className={this.state.errorClass['password']}/>
                            <span className="field-err">{this.state.formErrors["password"]}</span>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formPlaintextConfirmPassword">
                        <Form.Label column sm="4">
                            Confirm Password:
                        </Form.Label>
                        <Col sm="8">
                            <Form.Control type="password" placeholder="Confirm Password" name="confirm_password" onChange={this.fieldChangeHandler}className={this.state.errorClass['confirm_password']} />
                            <span className="field-err">{this.state.formErrors["confirm_password"]}</span>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formRole">
                        <Form.Label as="legend" column sm="4">
                          Role
                        </Form.Label>
                        <Col sm="8">
                            <Form.Control as="select" custom name="user_role" onChange={this.fieldChangeHandler} className={this.state.errorClass['user_role']}>
                              <option value=''>Select User Type</option>
                              <option value='3'>Student</option>
                              <option value='2'>Tutor</option>
                            </Form.Control>
                            <span className="field-err">{this.state.formErrors["user_role"]}</span>
                        </Col>
                    </Form.Group>

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

export default RegistrationComponent;