import React, { Component } from 'react';
import './Loader.css';

class Loader extends Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    render() {
        return(
            <>
            <div className="overlayLoader"><img src={require('../../Assets/loader.gif')} alt="loader" /></div>
            </>
        );
    }
}

export default Loader;

