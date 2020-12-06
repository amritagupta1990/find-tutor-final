import React, { Component } from 'react';
import './SpinnerComponent.css';

class SpinnerComponent extends Component {
    constructor(props){
        super();
    }
    render() {
        return(
            <>
            <div className="overlay">
                <div className="text"><div className="pb-2">Please wait. Loading...</div>
                <div class="lds-ripple"><div></div><div></div></div></div>
            </div> 
            </>
        );
    }
}

export default SpinnerComponent;