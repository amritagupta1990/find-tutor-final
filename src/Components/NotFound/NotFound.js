import React from "react";
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './NotFound.css';
import { Col, Row, Container} from "react-bootstrap";
class NotFound extends React.Component{
    constructor(props){
        super(props);
        this.state = {
        
        };
        library.add(fas);
    }
    render(){
        return (
            <Container>
                <Row>
                    <Col md="12">
                        <div className="error-template">
                            <h1>
                                Oops!</h1>
                            <h2>
                                404 Not Found</h2>
                            <div className="error-details">
                                Sorry, an error has occured, Requested page not found!
                            </div>
                            <div className="error-actions">
                                <a href="/" className="btn btn-primary btn-lg custom-color">
                                    <FontAwesomeIcon icon="home"/>
                                    Take Me Home 
                                </a>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}
export default NotFound;