import React, { Component } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import './NavComponent.css';
import { getLoggedInUserDetails , logout} from '../../helper';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


// const NavigationBar = (props) => (
//   <div>
//     <Navbar expand="lg">
//       <Navbar.Brand  className="white-col"><span className="bolder-font"> Welcome </span> Rupayan</Navbar.Brand>
//       <Navbar.Toggle aria-controls="basic-navbar-nav"/>
//       {/* <Form className="form-center">
//         <FormControl type="text" placeholder="Search" className="" />
//       </Form> */}
//       <Navbar.Collapse id="basic-navbar-nav">
//         <Nav className="ml-auto">
//           <Nav.Item><Nav.Link className="white-col" href="/">Home</Nav.Link></Nav.Item> 
//           <Nav.Item><Nav.Link  className="white-col" href="/about">Profile</Nav.Link></Nav.Item>
//         </Nav>
//       </Navbar.Collapse>
//     </Navbar>
//   </div>
// )

// export default NavigationBar;


class NavigationBar extends Component {
  constructor(props){
    super(props);
    this.state = {
      userdetails : {},
      userType: ""
      }
      library.add(fas);
    }
  componentDidMount(){
    var loggedInUserData = getLoggedInUserDetails();
    console.log('userData', loggedInUserData);
    this.setState({
      userdetails: JSON.parse(loggedInUserData)
    }, () => {
      if(+this.state.userdetails.user_role === 2)
        this.setState({ userType: 'Teacher'});
      
      if(+this.state.userdetails.user_role === 3)
        this.setState({ userType: 'Student'});

    });
    
  }
  logout = (e) => {
    logout(this.props);
  }
  
  render() {
    return (
      <div>
        <Navbar expand="lg" fixed="top" >
          <Navbar.Brand  className="white-col"><span className="bolder-font"> Welcome </span> {this.state.userdetails.first_name}&nbsp;{this.state.userdetails.last_name}&nbsp;-&nbsp;{this.state.userType}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav"/>
          <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Item><Nav.Link className="white-col" href="/dashboard" title="Home"><FontAwesomeIcon className="mr-1" icon="home" /></Nav.Link></Nav.Item> 
            <Nav.Item><Nav.Link  className="white-col" href="/profile" title="My Profile"><FontAwesomeIcon className="mr-1" icon="user" /></Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link  className="white-col" onClick={this.logout} title="Logout"><FontAwesomeIcon className="mr-1" icon="sign-out-alt" /></Nav.Link></Nav.Item>
          </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>

    );
  }
}

export default NavigationBar;
