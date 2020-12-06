import React, {Component} from 'react';
import NavBar from '../../sharedComponent/NavComponent/NavComponent';

class HomeComponent extends Component {

    constructor(props) {
        super(props);
    }
    changeEvent = () => {
        this.props.history.push("/login");
    }
    render() {
        return (
            <div>
                <NavBar/>
                <button onClick={this.changeEvent.bind(this)}>Switch User</button>
             
            </div>
        );
    }
}

export default HomeComponent;