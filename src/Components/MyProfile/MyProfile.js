import React, { Component, PropTypes } from 'react';
import axios from 'axios';
import Sidebar from '../../sharedComponent/NavComponent/NavComponent';
import { getToken } from '../../helper';
import './MyProfile.css';
import { Col, Row, Form, Button, Spinner } from "react-bootstrap";
import { getLoggedInUserDetails,validateEmail, nameValidation, validatePhoneNumber, validateDigitsOnly, validateImageType, validateImageSize } from '../../helper';
import SharedModal from '../../sharedComponent/ModalComponent/ModalComponent';
import SpinnerBlock from '../../sharedComponent/SpinnerComponent/SpinnerComponent';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Loader from '../../sharedComponent/Loader/Loader';
import Chat from '../../sharedComponent/Chat/Chat';





class MyProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userdetails: {},
            selectedFile: null,
            profile_image:"",
            'formErrors': {},
            'errorClass': {},
            showLoader: false
        }
        this.renderStudent = this.renderStudent.bind(this);
        this.renderTutor = this.renderTutor.bind(this);
        this.submitUpdateForm = this.submitUpdateForm.bind(this);
        this.imageUploader = React.createRef();
        library.add(fas)
    }
    componentDidMount() {
        var loggedInUserData = getLoggedInUserDetails();
        // // console.log('userData', loggedInUserData);
        // this.setState({
        const userdetails = JSON.parse(loggedInUserData);
        // });    
        try {
            var authToken = getToken();
            const reqObj = {
                userdetails : userdetails
            }
            axios.post('http://localhost:5001/api/showUserProfile', reqObj, {
                headers: { 
                  'Authorization': `Bearer ${authToken}` 
                }}).then(resp => {
                console.log("respomse==",resp);
                if(resp.data.userdetails.image){
                    this.setState({
                        userdetails: resp.data.userdetails,
                        profile_image: `http://localhost:5001/profile_images/${resp.data.userdetails.image}`
                        });
                }else{
                    this.setState({
                        userdetails: resp.data.userdetails,
                        profile_image: ''
                        });
                }
                
                
                
            }, (error) => {
                console.log('error =>', error);
            })
        } catch(e) {
            console.log(e);
        }  
    }
    submitUpdateForm(event) {
        event.preventDefault();
        console.log("update form===>", this.state.userdetails);
        this.doUpdate();
    }
    doUpdate(){
        try {
            if(this.handleValidation()){
            var authToken = getToken();
            const reqObj = {
                userdetails : this.state.userdetails
            }
            this.setState({showLoader: true});
            axios.post('http://localhost:5001/api/updateUserProfile', reqObj, {
                headers: { 
                  'Authorization': `Bearer ${authToken}` 
                }}).then(resp => {
                this.setState({showLoader: false});
                console.log("update response",resp);
                this.onResponse(resp.data.message, 'Profile Update Status', resp.data.error);

            }, (error) => {
                console.log('error =>', error);
            });
        }
        } catch(e) {
            console.log(e);
        }
    }
    handleChangeFor = (propertyName) => (event) => {
        const { userdetails } = this.state;
        const newDetails = {
            ...userdetails,
            [propertyName] : event.target.value
        };
       
        this.setState({userdetails:newDetails});
        
        this.setState({newDetails}, function(){
            this.handleValidation();
        });
    }
    onResponse = (msg, heading, error) => {
        // console.log('displayModalComponent', this.displayModalComponent);
        this.displayModalComponent.showModal(msg, heading, error);
      }
    handleImageUpload = (event) => {
        let formIsValid = true;
        let errors = {};
        console.log('file target', event.target.files[0]);
        if (event.target.files[0]) {
            // formIsValid = false;
            let imageSizeMsg = validateImageSize(event.target.files[0].size);            
            if(!validateImageType(event.target.files[0].name.toLowerCase())){
                formIsValid = false;
                let msg = "Please select a image type (png/jpg/jpeg)";
                this.onResponse(msg, 'Image Validation', true);
                // errorClass["email"] = "custom-error-border";
            }
            else if(!imageSizeMsg.check){
                formIsValid = false;
                let msg = imageSizeMsg.msg;
                this.onResponse(msg, 'Image Validation', true);
            } else{
                if(formIsValid){
                    this.setState({
                        selectedFile: event.target.files[0]
                      }, function(){
                          this.uploadImage();
                      });
                }
            }
        } 
        //     }else if()
        //     // return false;
        //   }
        
    }
    uploadImage = () => {
        try{
            console.log(this.state.selectedFile);
            var authToken = getToken();
            const data = new FormData();
            data.append('image_file', this.state.selectedFile);
            data.append('email', this.state.userdetails.email);
            var old_image_name = (this.state.profile_image) ? this.state.profile_image.split('/').pop() : "";
            data.append('old_image_name', old_image_name);
            axios.post("http://localhost:5001/api/profileImageUpload", data, {
                headers: { 
                'Authorization': `Bearer ${authToken}` 
                }})
            .then(resp => {
                    
                console.log("update image response",resp);
                this.setState({
                    profile_image: `http://localhost:5001/profile_images/${resp.data.image}`
                });
                this.onResponse(resp.data.message, 'Imager Upload Status', resp.data.error);
                
            }, (error) => {
                console.log('error =>', error);
            })
        }catch(err){
            console.log('Image Upload error', err);
        }
        
    }
    handleValidation = () => {
        const fields = this.state.userdetails;
        // console.log("i am inside this block");
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
             console.log("i am inside ",fields["first_name"]);
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
         if(!fields["address"]){
            formIsValid = false;
            errors["address"] = "Cannot be empty";
            errorClass["address"] = "custom-error-border";
         }
         if(this.state.userdetails.user_role === "2" || this.state.userdetails.user_role === 2){         
         if(!fields["monthly_fees_min"]){
            formIsValid = false;
            errors["monthly_fees_min"] = "Cannot be empty";
            errorClass["monthly_fees_min"] = "custom-error-border";
         }else{
            if(!validateDigitsOnly(fields["monthly_fees_min"])){
                formIsValid = false;
                errors["monthly_fees_min"] = "Only numbers are allowed!";
                errorClass["monthly_fees_min"] = "custom-error-border";
            }
         }
         if(!fields["monthly_fees_max"]){
            formIsValid = false;
            errors["monthly_fees_max"] = "Cannot be empty";
            errorClass["monthly_fees_max"] = "custom-error-border";
         }else{
            if(!validateDigitsOnly(fields["monthly_fees_max"])){
                formIsValid = false;
                errors["monthly_fees_max"] = "Only numbers are allowed!";
                errorClass["monthly_fees_max"] = "custom-error-border";
            }
         }
         if(fields["monthly_fees_min"] && fields["monthly_fees_max"]) {
             if(parseFloat(fields["monthly_fees_min"]) > parseFloat(fields["monthly_fees_max"])){
                formIsValid = false;
                errors["monthly_fees_max"] = "Cannot be lesser than Monthly Min Fees";
                errors["monthly_fees_min"] = "Cannot be higher than Monthly Max Fees"; 
                errorClass["monthly_fees_min"] = "custom-error-border";                               
                errorClass["monthly_fees_max"] = "custom-error-border";
             }
         }

         if(!fields["professional_details"]){
            formIsValid = false;
            errors["professional_details"] = "Cannot be empty";
            errorClass["professional_details"] = "custom-error-border";
         }
         if(!fields["qualification"]){
            formIsValid = false;
            errors["qualification"] = "Cannot be empty";
            errorClass["qualification"] = "custom-error-border";
         }
         if(!fields["specialization"]){
            formIsValid = false;
            errors["specialization"] = "Cannot be empty";
            errorClass["specialization"] = "custom-error-border";
         }
         if(!fields["bio"]){
            formIsValid = false;
            errors["bio"] = "Cannot be empty";
            errorClass["bio"] = "custom-error-border";
         }
        }else if(this.state.userdetails.user_role === "3" || this.state.userdetails.user_role === 3){
         if(!fields["education_institute"]){
            formIsValid = false;
            errors["education_institute"] = "Cannot be empty";
            errorClass["education_institute"] = "custom-error-border";
         }
         if(!fields["standard"]){
            formIsValid = false;
            errors["standard"] = "Cannot be empty";
            errorClass["standard"] = "custom-error-border";
         }
         if(!fields["subjects"]){
            formIsValid = false;
            errors["subjects"] = "Cannot be empty";
            errorClass["subjects"] = "custom-error-border";
         }
        }
        this.setState({formErrors: errors, errorClass: errorClass});
        return formIsValid;
    };
    render() {
        var template = "";
        if(this.state.userdetails.user_role === "2" || this.state.userdetails.user_role === 2){
         template = this.renderTutor();
        } else if(this.state.userdetails.user_role === "3" || this.state.userdetails.user_role === 3){
         template = this.renderStudent();
        }else{
            template = this.renderSpinner();
        }
        return template;
    }

    renderSpinner = () => {
        return(
            <div>
                <SpinnerBlock />
                <Sidebar history={this.props.history}/>
            </div>
        );
    }
    renderTutor(){
        const navigateToHome = () => {
            this.props.history.push("/dashboard");
        }
        return(
        <div>
                <Sidebar history={this.props.history}/>
                <div className="container rounded bg-white mt-5 top-defined-profile">
                <div className="row">
                    <div className="col-md-4 border-right">
                        <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                            <img className="mt-5 imgHolder" src={this.state.profile_image} width="95" height="95" alt="ProfileImage"/>
                            <input type="file" accept="image/*" onChange={this.handleImageUpload} ref={this.imageUploader} style={{display: "none"}}/>
                            <FontAwesomeIcon className="mt-1 mb-1 user-image-upload" icon="upload" onClick={() => this.imageUploader.current.click()} title="Change Profile Image"/>
                            <span className="field-err">{this.state.formErrors["profile_image"]}</span>                            
                            <span className="font-weight-bold text-black-80">Profile: Tutor</span>
                            <span className="font-weight-bold text-black-50">{this.state.userdetails.first_name}&nbsp;{this.state.userdetails.last_name}</span>
                            <span className="text-black-50">{this.state.userdetails.email}</span>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div className="p-3 py-5">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex flex-row align-items-center back" onClick={() => navigateToHome()}>
                                    <FontAwesomeIcon className="mr-1 mb-1" icon="long-arrow-alt-left" />
                                    <h6>Back to home</h6>
                                </div>
                                <h6 className="text-right">Edit Profile</h6>
                            </div>
                            <Form className="p-2" onSubmit={this.submitUpdateForm}>
                            <Form.Row>
                                <Form.Group as={Col} controlId="first_name">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('first_name')} className={this.state.errorClass['first_name']} value={this.state.userdetails.first_name || ""}placeholder="First Name"/>
                                    <span className="field-err">{this.state.formErrors["first_name"]}</span>
                                </Form.Group>

                                <Form.Group as={Col} controlId="last_name">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('last_name')} value={this.state.userdetails.last_name || ""} className={this.state.errorClass['last_name']}placeholder="Last Name"/>
                                    <span className="field-err">{this.state.formErrors["last_name"]}</span>
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} controlId="mobile">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('mobile')} value={this.state.userdetails.mobile || ""} className={this.state.errorClass['mobile']} placeholder="Phone"/>
                                    <span className="field-err">{this.state.formErrors["mobile"]}</span>                                    
                                </Form.Group>

                                <Form.Group as={Col} controlId="address">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('address')} value={this.state.userdetails.address || ""} placeholder="Address" className={this.state.errorClass['address']}/>
                                    <span className="field-err">{this.state.formErrors["address"]}</span>  
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} controlId="monthly_fees_min">
                                    <Form.Label>Monthly Fees Min</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('monthly_fees_min')} value={this.state.userdetails.monthly_fees_min || ""} className={this.state.errorClass['monthly_fees_min']} placeholder="Monthly Fees Min"/>
                                    <span className="field-err">{this.state.formErrors["monthly_fees_min"]}</span>                                      
                                </Form.Group>
                                <Form.Group as={Col} controlId="monthly_fees_max">
                                    <Form.Label>Monthly Fees Max</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('monthly_fees_max')} value={this.state.userdetails.monthly_fees_max || ""} className={this.state.errorClass['monthly_fees_max']} placeholder="Monthly Fees Max"/>
                                    <span className="field-err">{this.state.formErrors["monthly_fees_max"]}</span>  
                                    
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} controlId="qualification">
                                    <Form.Label>Educational Qualification</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('qualification')} value={this.state.userdetails.qualification || ""} className={this.state.errorClass['qualification']} placeholder="Educational Qualification"/>
                                    <span className="field-err">{this.state.formErrors["qualification"]}</span>
                                </Form.Group>

                                <Form.Group as={Col} controlId="specialization">
                                    <Form.Label>Subjects I want to teach</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('specialization')} value={this.state.userdetails.specialization || ""} className={this.state.errorClass['specialization']} placeholder="Specialization"/>
                                    <span className="field-err">{this.state.formErrors["specialization"]}</span>  
                                </Form.Group>
                            </Form.Row>

                            <Form.Row>
                                <Form.Group as={Col} controlId="professional_details">
                                    <Form.Label>Professional Details</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('professional_details')} value={this.state.userdetails.professional_details || ""} className={this.state.errorClass['professional_details']} placeholder="Professional Details"/>
                                    <span className="field-err">{this.state.formErrors["professional_details"]}</span>  
                                </Form.Group>
                            </Form.Row>
                            
                            <Form.Row>
                                <Form.Group as={Col} controlId="bio">
                                    <Form.Label>Something About Yourself</Form.Label>
                                    <Form.Control as="textarea" onChange={this.handleChangeFor('bio')} value={this.state.userdetails.bio || ""} className={this.state.errorClass['bio']} placeholder="Something About Yourself"/>
                                    <span className="field-err">{this.state.formErrors["bio"]}</span>  
                                    
                                </Form.Group>
                            </Form.Row>
                            
                            <div className="mt-5 text-right">
                                <Button variant="primary" type="submit" className="profile-button">
                                    Save Profile
                                </Button>
                            </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
            <SharedModal ref={(showModal) => this.displayModalComponent = showModal}></SharedModal>
            {this.state.showLoader ? (
                <Loader/>
                ) : (<></>)}
            <Chat/>
        </div>
        )
    }
    renderStudent(){
        const navigateToHome = () => {
            this.props.history.push("/dashboard");
        }
        return(
            <div>
                <Sidebar history={this.props.history}/>
                <div className="container rounded bg-white mt-5 top-defined-profile">
                <div className="row">
                    <div className="col-md-4 border-right">
                        <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                            <img className="mt-5 imgHolder" src={this.state.profile_image} width="95" height="95" alt="ProfileImage"/>
                            <input type="file" accept="image/*" onChange={this.handleImageUpload} ref={this.imageUploader} style={{display: "none"}}/>
                            <FontAwesomeIcon className="mt-1 mb-1 user-image-upload" icon="upload" onClick={() => this.imageUploader.current.click()} title="Change Profile Image" />
                            <span className="field-err">{this.state.formErrors["profile_image"]}</span>
                            <span className="font-weight-bold text-black-80">Profile: Student</span>
                            <span className="font-weight-bold text-black-50">{this.state.userdetails.first_name}&nbsp;{this.state.userdetails.last_name}</span>
                            <span className="text-black-50">{this.state.userdetails.email}</span>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div className="p-3 py-5">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex flex-row align-items-center back" onClick={() => navigateToHome()}>
                                    <FontAwesomeIcon className="mr-1 mb-1" icon="long-arrow-alt-left"/>
                                    <h6>Back to home</h6>
                                </div>
                                <h6 className="text-right">Edit Profile</h6>
                            </div>
                            <Form className="p-2" onSubmit={this.submitUpdateForm}>
                            <Form.Row>
                                <Form.Group as={Col} controlId="first_name">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('first_name')} value={this.state.userdetails.first_name || ""} className={this.state.errorClass['first_name']} placeholder="First Name"/>
                                    <span className="field-err">{this.state.formErrors["first_name"]}</span>
                                </Form.Group>

                                <Form.Group as={Col} controlId="last_name">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('last_name')} value={this.state.userdetails.last_name || ""} className={this.state.errorClass['last_name']}placeholder="Last Name"/>
                                    <span className="field-err">{this.state.formErrors["last_name"]}</span>
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} controlId="mobile">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('mobile')} value={this.state.userdetails.mobile || ""} className={this.state.errorClass['mobile']} placeholder="Phone"/>
                                    <span className="field-err">{this.state.formErrors["mobile"]}</span>
                                </Form.Group>

                                <Form.Group as={Col} controlId="address">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('address')} value={this.state.userdetails.address || ""} placeholder="Address" className={this.state.errorClass['address']}/>
                                    <span className="field-err">{this.state.formErrors["address"]}</span>
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} controlId="education_institute">
                                    <Form.Label>School/College/University</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('education_institute')} value={this.state.userdetails.education_institute || ""} className={this.state.errorClass['education_institute']} placeholder="School/College/University"/>
                                    <span className="field-err">{this.state.formErrors["education_institute"]}</span>                           
                                </Form.Group>
                                <Form.Group as={Col} controlId="standard">
                                    <Form.Label>Standard</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('standard')} value={this.state.userdetails.standard || ""} className={this.state.errorClass['standard']} placeholder="Standard"/>
                                    <span className="field-err">{this.state.formErrors["standard"]}</span>
                                </Form.Group>
                            </Form.Row>
                            <Form.Row>
                                <Form.Group as={Col} controlId="subjects">
                                    <Form.Label>Subjects</Form.Label>
                                    <Form.Control onChange={this.handleChangeFor('subjects')} value={this.state.userdetails.subjects || ""} className={this.state.errorClass['subjects']} placeholder="Subjects I want to learn"/>
                                    <span className="field-err">{this.state.formErrors["subjects"]}</span>                                   
                                </Form.Group>
                            </Form.Row>
                            
                            <div className="mt-5 text-right">
                                <Button variant="primary" type="submit" className="profile-button">
                                    Save Profile
                                </Button>
                            </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
            <SharedModal ref={(showModal) => this.displayModalComponent = showModal}></SharedModal>
            {this.state.showLoader ? (
                <Loader/>
                ) : (<></>)}
            <Chat/>
        </div>
        
        )
    }
}

export default MyProfile;
