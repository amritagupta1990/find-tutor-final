import React, { Component } from 'react';
import { Col, Row, Button} from "react-bootstrap";
import { Link } from 'react-router-dom';
import './UserRowComponent.css';
class UserRow extends Component{
    constructor(props){
        super(props);
        this.state = {
            userData: this.props.data
        };
        // console.log(this.props.data);
    }
    render() {
        var template = "";
        if(this.state.userData.user_role === "2" || this.state.userData.user_role === 2){
         template = this.renderTutor();
        } else if(this.state.userData.user_role === "3" || this.state.userData.user_role === 3){
         template = this.renderStudent();
        }else{
            template = "Loading...";//added for testing
        }
        return template;
    }
    selectUserToSendMessage = (to_user_id) => {
        this.props.parentCallback(to_user_id);
    }
    renderTutor() {
        return (
            <Row className="list-row">
            <Col md="10" className="user-block mr-4 p-0 mt-4">
                <Row className="py-4">
                    <Col md={4} className="imageHolder pr-0 pt-3">
                    <img src={ "http://localhost:5001/profile_images/" + this.state.userData.image} alt=""/>
                    </Col>
                    <Col md={8} className="pl-0">
                        <h3 className="user-name-holder"> {this.state.userData.first_name}&nbsp;{this.state.userData.last_name}</h3>
                        <div className="user-info-holder">
                            {/* <span><strong>Email: </strong>{this.state.userData.email}</span>
                            <span><strong>Address: </strong>{this.state.userData.address}</span> */}
                            <span><strong>Subjects I want to teach: </strong>{this.state.userData.specialization}</span>
                            <span><strong>Fees (Monthly): </strong>{this.state.userData.monthly_fees_min}-{this.state.userData.monthly_fees_max}(Min-Max)</span>
                        </div>
                        <div className="about-user pt-2">
                            {this.state.userData.bio} 
                        </div>
                        <div className="pt-3">
                        <Link to={`/user/${this.state.userData._id}`}>
                            <Button variant="primary" type="submit" className="read-more-btn">
                                View Profile &nbsp;&gt;
                            </Button>
                        </Link>
                        </div>
                    </Col>
                </Row>
            </Col>
        </Row>
        );
    }
    renderStudent(){
        return (
        <Row className="list-row">
            <Col md="10" className="user-block mr-4 p-0 mt-4">
                <Row className="py-4">
                    <Col md={4} className="imageHolder pr-0 pt-3">
                    <img src={ "http://localhost:5001/profile_images/" + this.state.userData.image} alt=""></img>
                    </Col>
                    <Col md={8} className="pl-0">
                        <h3 className="user-name-holder"> {this.state.userData.first_name}&nbsp;{this.state.userData.last_name}</h3>
                        <div className="user-info-holder">
                            <span><strong>Email: </strong>{this.state.userData.email}</span>
                            <span><strong>Address: </strong>{this.state.userData.address}</span>
                            <span><strong>School/College/University: </strong>{this.state.userData.education_institute}</span>
                            <span><strong>Standard: </strong>{this.state.userData.standard}</span>
                            <span><strong>Subjects I want to learn: </strong>{this.state.userData.subjects}</span>
                        </div>
                        {/* <div className="about-user pt-2">
                            {this.state.userData.bio} 
                        </div> */}
                        <div className="pt-3">
                            <Button variant="primary" type="submit" className="read-more-btn" onClick={() => this.selectUserToSendMessage(this.state.userData._id)}>
                                Send Message &nbsp;&gt;
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Col>
        </Row>
        );
    }
}
export default UserRow;