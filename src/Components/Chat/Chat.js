
import React from "react";
import io from "socket.io-client";
import { getLoggedInUserDetails } from '../../helper';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
class Chat extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            username: "",
            message: '',
            messages: [],
            messageTo:'',
            socket: io('localhost:5001')
        };
        library.add(fas);

        // this.socket = io('localhost:5001');

        // this.socket.on('RECEIVE_MESSAGE', function(data){
        //     addMessage(data);
        // });

        // const addMessage = data => {
        //     console.log(data);
        //     this.setState({messages: [...this.state.messages, data]});
        //     console.log(this.state.messages);
        // };

        // this.sendMessage = ev => {
        //     ev.preventDefault();
        //     this.socket.emit('SEND_MESSAGE', {
        //         author: this.state.username,
        //         message: this.state.message,
        //         messageTo: this.state.messageTo
        //     })
        //     this.setState({message: ''});

        // }
        
    }
    componentDidMount(){
        var loggedInUserData = getLoggedInUserDetails();
        const userdetails = JSON.parse(loggedInUserData);
        // console.log('loggedInUserData', JSON.parse(loggedInUserData));
        console.log('this.state.username', userdetails.email);
        this.state.socket.on('RECEIVE_MESSAGE', (data) => {
            this.addMessage(data);
        });

        
    }
    addMessage = data => {
        console.log(data);
        this.setState({messages: [...this.state.messages, data]});
        console.log(this.state.messages);
    };
    sendMessage = ev => {
        ev.preventDefault();
        this.state.socket.emit('SEND_MESSAGE', {
            author: this.state.username,
            message: this.state.message,
            messageTo: this.state.messageTo
        })
        this.setState({message: ''});

    }
    // componentDidMount() {
    //     var loggedInUserData = getLoggedInUserDetails();
    //     this.setState({socket: io('localhost:5001'), username: loggedInUserData.email},function(){
    //         this.state.socket.on('RECEIVE_MESSAGE', function(data){
    //             console.log('receive message====>', data);
    //             // this.addMessage(data);
    //             // this.setState({messages: [...this.state.messages, data]});
    //         });
    //     });
    //     // this.socket = io('localhost:5001');

    //     // this.socket.on('RECEIVE_MESSAGE', function(data){
    //     //     console.log('receive message====>', data);
    //     //     addMessage(data);
    //     // });

    //     this.sendMessage = ev => {
    //         ev.preventDefault();
    //         // this.state.socket.emit('SEND_MESSAGE', {
    //         //     author: this.state.username,
    //         //     message: this.state.message,
    //         //     messageTo: this.state.messageTo
    //         // })
    //         this.state.socket.emit('join', {
    //             author: this.state.username,
    //             message: this.state.message,
    //             messageTo: this.state.messageTo
    //         });
    //         this.setState({message: ''});

    //     }
    // }
    // addMessage = data => {
    //     console.log(data);
    //     this.setState({messages: [...this.state.messages, data]});
    //     console.log(this.state.messages);
    // };
    render(){
        return (
            <div className="container">
                <div className="row">
                    <div className="col-4">
                        <div className="card">
                            <div className="card-body">
                                <div className="card-title">Global Chat</div>
                                <hr/>
                                <div className="messages">
                                    {this.state.messages.map(message => {
                                        return (
                                            <div>{message.messageTo}: {message.message}</div>
                                        )
                                    })}
                                </div>

                            </div>
                            <div className="card-footer">
                                <input type="text" placeholder="Message To" value={this.state.messageTo} onChange={ev => this.setState({messageTo: ev.target.value})} className="form-control"/>
                                <br/>
                                {/* <input type="text" placeholder="Username" value={this.state.username} onChange={ev => this.setState({username: ev.target.value})} className="form-control"/> */}
                                {/* <br/> */}
                                <input type="text" placeholder="Message" className="form-control" value={this.state.message} onChange={ev => this.setState({message: ev.target.value})}/>
                                <br/>
                                <button onClick={this.sendMessage} className="btn btn-primary form-control">Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Chat;