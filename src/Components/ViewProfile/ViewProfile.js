import React , { useState, useEffect, useRef }from 'react';
import './ViewProfile.css';
import Sidebar from '../../sharedComponent/NavComponent/NavComponent';
import { Container, Row, Col } from 'react-bootstrap';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getToken, getLoggedInUserDetails } from '../../helper';
import axios from 'axios';
import SharedModal from '../../sharedComponent/ModalComponent/ModalComponent';
import Spinner from '../../sharedComponent/SpinnerComponent/SpinnerComponent';

const ViewProfile = (props) => {
    library.add(fas);
    const [userDetails, setuserDetails] = useState({});
    const [userImage, setuserImage] = useState("");
    const [requestBtnClass, setrequestBtnClass] = useState("btn profile-button mr-2 request-btn");
    const [statusText, setStatusText] = useState("Send Request");
    const [emailMask, setemailMask] = useState("text-black-50");
    // const [addressMask, setaddressMask] = useState("");
    const [mobileMask, setmobileMask] = useState("");
    const [profileText, setprofileText] = useState("");
    const [showSpinner, setshowSpinner] = useState(true);
    const [masking, setMasking] = useState(false);
    const navigateToHome = () => {
        props.history.push("/dashboard");
    }
    const childRef = useRef();
    const onRequest = () => {
        // console.log('displayModalComponent', this.displayModalComponent);
        // this.displayModalComponent.showModal("<h1>Amrita</h1>");
        // var loggedInUserData = getLoggedInUserDetails();
        let modalBody = "<label> Add Comment </label><textarea class='form-control' id='messageText'></textarea>";
        childRef.current.showModal(modalBody, 'Send Request', false, "SEND", true, true);
      }
    const sendMessage = () => {
        let modalBody = "<label> Message </label><textarea class='form-control' id='messageText'></textarea>";
        childRef.current.showModal(modalBody, 'Send Message', false, "SEND", true, false);
    }
      const onResponse = (msg, error) => {
        let modalBody = msg;
        childRef.current.showModal(modalBody, 'Request Status', error);
      }
    const callback = (msg, type) => {
        const userdetails = JSON.parse(getLoggedInUserDetails());
        let senderId = userdetails.id;
        let authToken = getToken();
        let receiverId = props.match.params.userId;
            let reqObj = {
                senderId: senderId,
                receiverId: receiverId,
                message: msg
            };
            // console.log('type', type);
        if(type === 'request'){
            axios.post('http://localhost:5001/api/sendRequest', reqObj, {
                headers: { 
                    'Authorization': `Bearer ${authToken}` 
                    }
            }).then(resp => {
                console.log("Response ===> ",resp);
                if(resp.data.isSent){
                    setStatusText('Request Sent');
                    setrequestBtnClass('btn profile-button mr-2 request-sent-btn');
                }
                onResponse(resp.data.message, resp.data.error);
            }, (error) => {
                console.log('error=>', error);
            });
        }else{
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
                onResponse(resp.data.message, resp.data.error);
            }, (error) => {
                console.log('error=>', error);
            });
        }
        
    };
    useEffect(() => {
        async function fetchData() {

            let userId = props.match.params.userId;
            const loogedInUserDetails = JSON.parse(getLoggedInUserDetails());
            try {
                var authToken = getToken();
                const reqObj = {
                    userId : userId,
                    logged_in_userId : loogedInUserDetails.id
                }
                await axios.post('http://localhost:5001/api/getUserDetails', reqObj, {
                    headers: { 
                    'Authorization': `Bearer ${authToken}` 
                    }}).then(resp => {
                    console.log("user Result==",resp);
                    setuserDetails(resp.data.userdetails);
                    if(resp.data.isSent && resp.data.requestDetails.status === "pending"){
                        setStatusText('Request Sent');
                        setrequestBtnClass('btn profile-button mr-2 request-sent-btn');
                        setemailMask('text-black-50 spec-stat');
                        // setaddressMask('spec-stat');
                        setmobileMask('spec-stat');
                        setMasking(true);
                        setprofileText("Request status is pending!");
                    }else if(resp.data.isSent && resp.data.requestDetails.status === "accepted"){
                        setStatusText('Request Accepted');
                        setrequestBtnClass('btn profile-button mr-2 request-accepted-btn');
                        setprofileText("Request Accepted!");
                    }
                    else if(resp.data.isSent && resp.data.requestDetails.status === "rejected"){
                        setStatusText('Request Rejected');
                        setrequestBtnClass('btn  profile-button mr-2 request-rejected-btn');
                        setemailMask('text-black-50 spec-stat');
                        // setaddressMask('spec-stat');
                        setmobileMask('spec-stat');
                        setMasking(true);
                        setprofileText("Request Rejected!");
                    }
                    if(!resp.data.isSent){
                        setStatusText('Send Request');
                        setrequestBtnClass('btn  profile-button mr-2 request-btn');
                        setemailMask('text-black-50 spec-stat');
                        // setaddressMask('spec-stat');
                        setmobileMask('spec-stat');
                        setMasking(true);
                        setprofileText("You can have contact details after your request is accepted!");
                    }
                    if(resp.data.userdetails.image){
                        setuserImage(`http://localhost:5001/profile_images/${resp.data.userdetails.image}`)
                    }else{
                        //place holder image set
                    }
                    
                    setshowSpinner(false);
                    
                }, (error) => {
                    console.log('error =>', error);
                    setshowSpinner(false);
                })
            } catch(e) {
                console.log(e);
            }  
        }
        fetchData();
      }, []); // Or [] if effect doesn't need props or state
      
    return (
            <div>
                {showSpinner ? (
                <Spinner/>
                ) : (<></>)}
                <Sidebar history={props.history}/>
                <Container className="rounded bg-white mt-5 top-defined-profile">
                    <Row>
                    <Col md={4} className="border-right">
                       <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                           <img className="mt-5 imgHolder" src={userImage} width="95" alt="userImage"/>
                              <span className="font-weight-bold mt-2">{userDetails.first_name} {userDetails.last_name}</span>
                              <span className={emailMask}>{!masking ? userDetails.email: "Not Permitted"}</span>
                              <span className="font-weight-bold">{profileText}</span>
                        </div>
                    </Col>
                    <Col md={8}>
                        <div className="p-3 py-5 profile-det">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex flex-row align-items-center back" onClick={navigateToHome}>
                                <FontAwesomeIcon className="mr-1 mb-1" icon="long-arrow-alt-left" />
                                    <h6>Back to home</h6>
                                </div>
                                <h6 className="text-right">Teacher Profile</h6>
                            </div>
                            <Row className="mt-2 py-2">
                                <Col md={6}>
                                    <FontAwesomeIcon className="mr-1" icon="home" /> <strong>Address :</strong> {userDetails.address}
                                </Col>
                                <Col md={6} className={mobileMask}>
                                    <FontAwesomeIcon className="mr-1" icon="mobile" /> <strong>Mobile Number : </strong>{!masking ? userDetails.mobile : 'Not Permitted'}
                                </Col>
                            </Row>
                            <Row className="mt-2 py-2">
                                <Col md={6}>
                                    <FontAwesomeIcon className="mr-1" icon="university" /> <strong>Qualification :</strong> {userDetails.qualification}
                                </Col>
                                <Col md={6}>
                                    <FontAwesomeIcon className="mr-1" icon="suitcase" /> <strong>Professional Details :</strong> {userDetails.professional_details}
                                </Col>
                            </Row>
                            <Row className="mt-2 py-2">
                                <Col md={6}>
                                    <FontAwesomeIcon className="mr-1" icon="book" /> <strong>Subjects to Teach :</strong> {userDetails.specialization}
                                </Col>
                                <Col md={6}>
                                    <FontAwesomeIcon className="mr-1" icon="stamp" /> <strong>Fees(Min-Max) :</strong> ({userDetails.monthly_fees_min} - {userDetails.monthly_fees_max})
                                </Col>
                            </Row>
                            <Row className="mt-2 py-2">
                                <Col md={12}>
                                    <FontAwesomeIcon className="mr-1" icon="user-tie" /> <strong>About {userDetails.first_name} :</strong> {userDetails.bio}
                                </Col>
                            </Row>
                            <div className="mt-5 text-right">
                                <button className={requestBtnClass} type="button" onClick={onRequest} disabled={!(statusText === 'Send Request')}>{statusText}</button>
                                <button className="btn btn-primary profile-button message-btn" onClick={sendMessage} type="button"><FontAwesomeIcon icon="paper-plane" className="mr-1"/> Message</button>
                            </div>
                        </div>
                    </Col>
                    </Row>
                    <SharedModal ref={childRef} parentCallback={callback}></SharedModal>
                </Container>
            </div>
    )
}

export default ViewProfile;