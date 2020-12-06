import React, { Component, PropTypes } from 'react';
import axios from 'axios';
import Sidebar from '../../sharedComponent/NavComponent/NavComponent';
import Chat from '../../sharedComponent/Chat/Chat';
import { getToken, getLoggedInUserDetails } from '../../helper';
import './Dashboard.css';
import { Col, Row, Button, InputGroup, FormControl, Form, Container} from "react-bootstrap";
import UserRow from '../../sharedComponent/UserRowComponent/UserRowComponent';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SharedModal from '../../sharedComponent/ModalComponent/ModalComponent';
import Spinner from '../../sharedComponent/SpinnerComponent/SpinnerComponent';


class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // users : [],
            rangeValue: 0,
            rangeFilter: false,
            defaultResponse: [],
            searchKey:'',
            maxFees: 0,
            minFees: 0,
            userdetails: JSON.parse(getLoggedInUserDetails()),
            requestList: [],
            loggedINUserId: '',
            radioValue: "all",
            showSpinner: true,
            messge_to_id : null
            };
            
        library.add(fas);
        
    }

    fetchData = () => {
        try {
            var loggedInUserData = getLoggedInUserDetails();
            const userdetails = JSON.parse(loggedInUserData);
            var reqObj = {
                user_role : userdetails.user_role,
                user_id: userdetails.id
            }
            var authToken = getToken();
            axios.post('http://localhost:5001/api/getDashboardData', reqObj, {
                headers: { 
                  'Authorization': `Bearer ${authToken}` 
                }}).then(resp => {
                    this.setState({
                        // users: resp.data.userList,
                        defaultResponse: resp.data.userList,
                        maxFees: resp.data.maxFees,
                        minFees: resp.data.minFees,
                        rangeValue: resp.data.maxFees,
                        requestList: resp.data.requestList,
                        loggedINUserId: userdetails.id,
                        showSpinner: false
                    });
                    console.log('resp', resp);
                }, (error) => {
                    this.setState({
                        showSpinner: false
                    });
                });
            
            // console.log('authToken', authToken);
            // axios.get('http://localhost:5001/api/userDetails', {
            //     headers: { 
            //       'Authorization': `Bearer ${authToken}` 
            //     }}).then(resp => {
            //         console.log(resp);
            //     if(resp.data.error == true){
            //         this.props.history.push("/");
            //     }else{
            //         const { status, userDetails } = resp.data;
            //         if(userDetails.length > 0){
            //             this.setState({
            //                 response: userDetails[0],
            //                 userDeatilsText: userDetails[0].userName + "(" + userDetails[0].role +")"
            //             });
            //             console.log(this.state);
            //         }
                
            //     }
                
            // }, (error) => {
            //     console.log('error =>', error);
            // })
        } catch(e) {
            console.log(e);
        }
    }

    componentDidMount() {
       this.fetchData();
    }
    onResponse = (msg, error) => {
        // console.log('displayModalComponent', this.displayModalComponent);
        this.displayModalComponent.showModal(msg, "Status", error);
      }

    filterChangeHandler = (event) => {
        this.setState({
            rangeValue: event.target.value,
            rangeFilter: true
            
        });
    }

    callback = (to_user_id) => {
        this.setState({
            messge_to_id: to_user_id
        });
        // this.displayModalComponent.showModal(msg, "Status", error);
        let modalBody = "<label> Message </label><textarea class='form-control' id='messageText'></textarea>";
        this.displayModalComponent.showModal(modalBody, 'Send Message', false, "SEND", true, false);
    }
    messageCallback = (msg, type) => {
        console.log('message===>', msg);
        console.log('type==>', type);
        let senderId = this.state.loggedINUserId;
        let authToken = getToken();
        let receiverId = this.state.messge_to_id;
        let reqObj = {
            senderId: senderId,
            receiverId: receiverId,
            message: msg
        };
        axios.post('http://localhost:5001/api/sendMessage', reqObj, {
                headers: { 
                    'Authorization': `Bearer ${authToken}` 
                    }
            }).then(resp => {
                console.log("Response ===> ",resp);
                // if(resp.data.isSent){
                //     setStatusText('Request Sent');
                //     setrequestBtnClass('btn profile-button mr-2 request-sent-btn');
                // }
                this.onResponse(resp.data.message, resp.data.error);
            }, (error) => {
                console.log('error=>', error);
            });
    }

    searchHandler = (event) => {
        console.log('fired');
        
        
        this.setState({
            searchKey: event.target.value
            
        }, function(){
            console.log('called', this.state.users);
        });
    }

    manageRequest = (event) =>{
        let reqObj = {
            request_id : event.target.parentNode.getAttribute('data-id'),
            status : event.target.parentNode.getAttribute('data-status'),
            loggedINUserId: this.state.loggedINUserId
        }
        var authToken = getToken();
        axios.post('http://localhost:5001/api/manageRequest', reqObj, {
            headers: { 
              'Authorization': `Bearer ${authToken}` 
            }}).then(resp => {
                console.log('resp==>', resp);
                this.onResponse(resp.data.message, resp.data.error);
                this.fetchData();
                this.setState({
                    requestList: resp.data.requestList,
                });
            }, (error) => {
                this.onResponse("Something went wrong!", true);
            });
    }
    filterByRadio = (e) => {
        this.setState({radioValue: e.currentTarget.value});
    }

    render() {
        let template = "";
        console.log('this.state.userdetails', this.state.userdetails);
        if(this.state.userdetails.user_role === "2" || this.state.userdetails.user_role === 2){
         template = this.renderTutor();
        } else if(this.state.userdetails.user_role === "3" || this.state.userdetails.user_role === 3){
         template = this.renderStudent();
        }else{
            template = "Loading...";//added for testing
        }
        return template;
    }

    renderTutor() {
        const radios = [
            { name: "All", value: "all" },
            { name: "My Student", value: "accepted" },
            { name: "Rejected Student", value: "rejected" },
          ];
        let filteredUser = [];
        var baseFilteredList = [];
        if(this.state.radioValue === 'all'){
            baseFilteredList = this.state.defaultResponse;
        }
        else if(this.state.radioValue === 'accepted'){
            baseFilteredList = this.state.defaultResponse.filter((user) => {
                if(user.accepted && !user.rejected) return user;
            });
            console.log('accepted', baseFilteredList);
        }
        else if(this.state.radioValue === 'rejected'){
            baseFilteredList = this.state.defaultResponse.filter((user) => {
                if(!user.accepted && user.rejected) return user;
            });
            console.log('rejected', baseFilteredList);
        }
        if(this.state.searchKey!==''){
            filteredUser= baseFilteredList.filter((user) => {
                const first_name = (user.first_name)? user.first_name : "";
                const last_name = (user.last_name)? user.last_name : "";
                const email = (user.email)? user.email : "";
                const address = (user.address)? user.address : "";
                const education_institute = (user.education_institute)? user.education_institute : "";
                const subjects = (user.subjects)? user.subjects : 0;
                if(first_name.toLowerCase().includes(this.state.searchKey.toLowerCase()) || last_name.toLowerCase().includes(this.state.searchKey.toLowerCase()) || email.toLowerCase().includes(this.state.searchKey.toLowerCase()) || address.toLowerCase().includes(this.state.searchKey.toLowerCase()) || education_institute.toLowerCase().includes(this.state.searchKey.toLowerCase()) || subjects.toLowerCase().includes(this.state.searchKey.toLowerCase())){
                    // console.log(user.first_name.includes(searchKey));
                    return user;
                }
            });
        }else{
            if(baseFilteredList){
                if(this.state.rangeFilter){
                    filteredUser= baseFilteredList.filter((user) => {
                        const monthly_fees_min = (user.monthly_fees_min)? user.monthly_fees_min : 0;
                        const monthly_fees_max = (user.monthly_fees_max)? user.monthly_fees_max : 0;
                        if((+this.state.rangeValue >= +monthly_fees_min && +this.state.rangeValue <= +monthly_fees_max)){
                            return user;
                        }
                    });
                }else{
                    filteredUser = baseFilteredList;
                }
                
            }
        }
        console.log('filteredUser', filteredUser);
        return (
            <div>
                {this.state.showSpinner ? (
                <Spinner/>
                ) : (<></>)}
                <Sidebar history={this.props.history}/>
                <Container fluid className="top-defined">
                    <Row>
                    <Col md="8" className="pr-0">
                        {filteredUser.map((user) => (
                        <UserRow data={user} key={user.email} parentCallback={this.callback}/>
                        ))}
                       
                    </Col>
                    <Col md="4" className="pl-0 right-fixed-panel">
                        <Row className="mt-4">
                            <Col md="10" className="">
                                <InputGroup className="mb-2">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text><FontAwesomeIcon icon="search"/></InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl id="inlineFormInputGroup" placeholder="Search By Name/Email/Address/Subject" onInput={this.searchHandler}/>
                                </InputGroup>
                            </Col>
                            <Col md="10" className="pt-2">
                                <Form.Group controlId="formRadioBtn" className="radioGroup">
                                {radios.map((radio, index) => (
                                <Form.Check 
                                    key={index}
                                    type="radio"
                                    name="radio"
                                    value={radio.value}
                                    label={radio.name}
                                    checked={this.state.radioValue === radio.value}
                                    onChange={this.filterByRadio}
                                    className="mr-3"
                                />
                                ))}
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mt-4">
                        <Col md="10" className="notification-block p-2">
                                <span className="p-2 pb-3">Requests</span>
                                {this.state.requestList.map((request) => (
                                <Row className="chat-row mx-1 mt-1" key={request._id}>
                                    <Col md="2">
                                        <div className="image-container mt-2">
                                        <img src={ "http://localhost:5001/profile_images/" + request.senderDetails[0].image} alt=""/>
                                        </div>
                                    </Col>
                                    <Col md="6"><div className="name-container mt-3">{request.senderDetails[0].first_name}&nbsp;{request.senderDetails[0].last_name}</div></Col>
                                    <Col md="4">
                                        <div className="icon-container mt-2">
                                            <FontAwesomeIcon className="mr-2 accept-icon" icon="user-check" data-status="accepted" data-id={request._id} onClick={this.manageRequest}/>
                                            <FontAwesomeIcon className="reject-icon" icon="user-times" data-status="rejected" data-id={request._id} onClick={this.manageRequest}/>
                                        </div>
                                    </Col>
                                </Row>
                                ))}
                            </Col>
                        </Row>
                    </Col>
                    </Row>
                    <SharedModal ref={(showModal) => this.displayModalComponent = showModal} parentCallback={this.messageCallback}></SharedModal>
                </Container>
                <Chat/>
            </div>
        );
    }
    renderStudent() {
        const radios = [
            { name: "All", value: "all" },
            { name: "My Teachers", value: "accepted" },
            { name: "Rejected List", value: "rejected" },
          ];
        let filteredUser = [];
        var baseFilteredList = [];
        if(this.state.radioValue === 'all'){
            baseFilteredList = this.state.defaultResponse;
        }
        else if(this.state.radioValue === 'accepted'){
            baseFilteredList = this.state.defaultResponse.filter((user) => {
                if(user.accepted && !user.rejected) return user;
            });
            console.log('accepted', baseFilteredList);
        }
        else if(this.state.radioValue === 'rejected'){
            baseFilteredList = this.state.defaultResponse.filter((user) => {
                if(!user.accepted && user.rejected) return user;
            });
            console.log('rejected', baseFilteredList);
        }
        if(this.state.searchKey!==''){
            filteredUser= baseFilteredList.filter((user) => {
                const first_name = (user.first_name)? user.first_name : "";
                const last_name = (user.last_name)? user.last_name : "";
                const email = (user.email)? user.email : "";
                const address = (user.address)? user.address : "";
                const specialization = (user.specialization)? user.specialization : "";
                const monthly_fees_min = (user.monthly_fees_min)? user.monthly_fees_min : 0;
                const monthly_fees_max = (user.monthly_fees_max)? user.monthly_fees_max : 0;
                if(this.state.rangeFilter){
                    if((first_name.toLowerCase().includes(this.state.searchKey.toLowerCase()) || last_name.toLowerCase().includes(this.state.searchKey.toLowerCase()) || email.toLowerCase().includes(this.state.searchKey.toLowerCase()) || address.toLowerCase().includes(this.state.searchKey.toLowerCase()) || specialization.toLowerCase().includes(this.state.searchKey.toLowerCase())) && (+this.state.rangeValue >= +monthly_fees_min && +this.state.rangeValue <= +monthly_fees_max)){
                        // console.log(user.first_name.includes(searchKey));
                        return user;
                    }
                }else{
                    if(first_name.toLowerCase().includes(this.state.searchKey.toLowerCase()) || last_name.toLowerCase().includes(this.state.searchKey.toLowerCase()) || email.toLowerCase().includes(this.state.searchKey.toLowerCase()) || address.toLowerCase().includes(this.state.searchKey.toLowerCase()) || specialization.toLowerCase().includes(this.state.searchKey.toLowerCase())){
                        // console.log(user.first_name.includes(searchKey));
                        return user;
                    }
                }
            });
        }else{
            if(baseFilteredList){
                if(this.state.rangeFilter){
                    filteredUser= baseFilteredList.filter((user) => {
                        const monthly_fees_min = (user.monthly_fees_min)? user.monthly_fees_min : 0;
                        const monthly_fees_max = (user.monthly_fees_max)? user.monthly_fees_max : 0;
                        if((+this.state.rangeValue >= +monthly_fees_min && +this.state.rangeValue <= +monthly_fees_max)){
                            return user;
                        }
                    });
                }else{
                    filteredUser = baseFilteredList;
                }
                
            }
        }
        console.log('filteredUser', filteredUser);
        return (
            <div>
                {this.state.showSpinner ? (
                <Spinner/>
                ) : (<></>)}
                <Sidebar history={this.props.history}/>
                <Container fluid className="top-defined">
                    <Row>
                    <Col md="8" className="pr-0">
                        {filteredUser.map((user) => (
                        <UserRow data={user} key={user.email}/>
                        ))}
                       
                    </Col>
                    <Col md="4" className="pl-0 right-fixed-panel">
                        <Row className="mt-4">
                            <Col md="10" className="">
                                <InputGroup className="mb-2">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text><FontAwesomeIcon icon="search"/></InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl id="inlineFormInputGroup" placeholder="Search By Name/Email/Address/Subject" onInput={this.searchHandler}/>
                                </InputGroup>
                            </Col>
                            <Col md="10" className="">
                                <Form.Group controlId="formBasicRangeCustom">
                                    <Form.Label>Filter By Fees Range</Form.Label>
                                    <Form.Control type="range" custom min={this.state.minFees} max={this.state.maxFees} value={this.state.rangeValue} onChange={this.filterChangeHandler}/>
                                    <Form.Label>{this.state.rangeValue}</Form.Label>
                                </Form.Group>
                            </Col>
                            <Col md="10" className="pt-2">
                                <Form.Group controlId="formRadioBtn" className="radioGroup">
                                {radios.map((radio, index) => (
                                <Form.Check 
                                    key={index}
                                    type="radio"
                                    name="radio"
                                    value={radio.value}
                                    label={radio.name}
                                    checked={this.state.radioValue === radio.value}
                                    onChange={this.filterByRadio}
                                    className="mr-3"
                                />
                                ))}
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mt-4">
                            {/* <Col md="10" className="notification-block p-2">
                                <span className="p-2 pb-3">Requests</span>
                                {this.state.requestList.forEach((request) => (
                                <Row className="chat-row mx-1 mt-1" key={request._id}>
                                    <Col md="2">
                                        <div className="image-container mt-2">
                                            <img src="http://localhost:5001/profile_images/1602057338844_850633771_29388933_1311613458939483_6032921856661520384_n.jpg" alt="UserImage"/>
                                        </div>
                                    </Col>
                                    <Col md="6"><div className="name-container mt-3">Amrita Gupta</div></Col>
                                    <Col md="4">
                                        <div className="icon-container mt-2">
                                            <FontAwesomeIcon className="mr-2 accept-icon" icon="user-check"/>
                                            <FontAwesomeIcon className="reject-icon" icon="user-times"/>
                                        </div>
                                    </Col>
                                </Row>
                                ))}
                            </Col> */}
                        </Row>
                    </Col>
                    </Row>
                </Container>
                <Chat/>
            </div>
        );
    }
}


export default Dashboard;