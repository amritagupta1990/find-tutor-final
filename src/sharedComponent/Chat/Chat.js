
import React from "react";
import io from "socket.io-client";
import { getLoggedInUserDetails, getToken, logout } from '../../helper';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Chat.css';
import { Col, Row} from "react-bootstrap";
import axios from 'axios';
class Chat extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            username: "",
            message: '',
            messages: [],
            messageTo:'',
            socket: io('localhost:5001'),
            chatBoxClass: "chat-box-container d-none",
            isChatOpen: false,
            chatListClass: "chat-list-container p-1 d-none",
            userListClass: "user-list-container",
            chatUserList : [],
            selectedSenderDetails: [],
            selectedUserId: null,
            chatList: [],
            loggedInUserData: JSON.parse(getLoggedInUserDetails()),
            unseenCountChange: 0,
            messageText : ""
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
        // console.log('this.state.username', userdetails.email);
        let authToken = getToken();
        let reqObj = {
            user_id: userdetails.id
        }
        axios.post('http://localhost:5001/api/getChatUserList', reqObj, {
            headers: { 
              'Authorization': `Bearer ${authToken}` 
            }}).then(resp => {
                // console.log('resp==>', resp.data.result);
                if(resp.data.error && resp.data.errorCode && resp.data.errorCode === 401){
                    logout(this.props);
                }
                if(!resp.data.error){
                    this.setState({
                        chatUserList: resp.data.result
                    });
                }
                
                // this.onResponse(resp.data.message, resp.data.error);
                // this.fetchData();
                
            }, (error) => {
                // this.onResponse("Something went wrong!", true);
            });
        this.state.socket.on(userdetails.id + '_RECEIVE_MESSAGE', (data) => {
            console.log('message data', data);
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
    openCloseChatPanel = ev => {
        ev.preventDefault();
        this.setState({isChatOpen: !this.state.isChatOpen}, ()=>{
            this.setState({ chatBoxClass: (this.state.isChatOpen) ? "chat-box-container" : "chat-box-container d-none"});
        });
    }
    showChatList = (sender_id, index) => {
        // ev.preventDefault();
        console.log('sender_id', sender_id);
        const userdetails = JSON.parse(getLoggedInUserDetails());
        let reqObj = {
            sender_id,
            receiver_id: userdetails.id
        };
        let authToken = getToken();
        axios.post('http://localhost:5001/api/getChatList', reqObj, {
            headers: { 
              'Authorization': `Bearer ${authToken}` 
            }}).then(resp => {
                // console.log('resp==>', resp);
                this.setState({ userListClass: "user-list-container d-none", chatListClass: "chat-list-container p-1", selectedSenderDetails: this.state.chatUserList[index].senderDetails, chatList: resp.data.messages, unseenCountChange: resp.data.modifiedCount, selectedUserId: sender_id});
                // this.onResponse(resp.data.message, resp.data.error);
                // this.fetchData();
                // this.setState({
                //     chatUserList: resp.data.result,
                // });
            }, (error) => {
                // this.onResponse("Something went wrong!", true);
            });
        
    }
    hideChatList = ev => {
        ev.preventDefault();
        this.setState({ userListClass: "user-list-container", chatListClass: "chat-list-container p-1 d-none"});
    }
    messageChangeHandler = (ev) => {
        this.setState({messageText : ev.target.value})
    }
    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
      }
    sendMessageToUser = (ev) => {
        
        let messageText = this.state.messageText;
        const userdetails = JSON.parse(getLoggedInUserDetails());
        if(messageText === ''){
            alert("message can't be blank");
        }else{
            let senderId = userdetails.id;
            let authToken = getToken();
            let receiverId = this.state.selectedUserId;
            let reqObj = {
                senderId: senderId,
                receiverId: receiverId,
                message: messageText
            };
            // console.log('reqObj', reqObj);

            axios.post('http://localhost:5001/api/sendMessage', reqObj, {
                    headers: { 
                        'Authorization': `Bearer ${authToken}` 
                        }
                }).then(resp => {
                    console.log("Response ===> ",resp);
                    if(!resp.data.error){
                        this.setState({ chatList: [...this.state.chatList, resp.data.insertedMsg], messageText: "" }, () => {
                            // console.log('checking state', this.state.chatList);
                        });
                        this.scrollToBottom();
                        // this.state.chatList.push(resp.data.insertedMsg);
                    }
                    
                    // if(resp.data.isSent){
                    //     setStatusText('Request Sent');
                    //     setrequestBtnClass('btn profile-button mr-2 request-sent-btn');
                    // }
                    // this.onResponse(resp.data.message, resp.data.error);
                }, (error) => {
                    console.log('error=>', error);
                });
        }
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
        let userList = [];
        let totalUnseenCount = 0;
        let loggedInUserId = this.state.loggedInUserData.id;
        userList = this.state.chatUserList.map((user) => {
            // console.log('user', user);
            let userDetails = [];
            if(loggedInUserId == user.receiver_id){
                userDetails = user.senderDetails;
                if(!user.isSeen)
                    totalUnseenCount += 1;
            }
            if(loggedInUserId == user.sender_id){
                userDetails = user.receiverDetails;
            }
            // console.log('user.seenCounts', user.SeenCounts);
            // var count = user.SeenCounts.map((el) => {
            //     let obj = {'unseenCount': 0}
            //     if(!el.seenstatus){
            //         obj.unseenCount = el.count;
            //         totalUnseenCount+=el.count
            //     } 
            //     return obj;
            // });
            // let modified = {
            //     userDetails: userDetails,
            //     // messageDetails: count
            // }
            return userDetails[0];
        });
        totalUnseenCount = totalUnseenCount-this.state.unseenCountChange;
        const key = '_id';

        const userListUnique = [...new Map(userList.map(item =>
                [item[key], item])).values()];
        // console.log('userList', userListUnique);
        return (
            <div className="chat-block-container">
                <div className={this.state.chatBoxClass} id="chat-box-container">
                    <div className={this.state.userListClass}>
                    {userListUnique.map((user, index) => (
                        <Row className="chat-row mx-1 mt-1" key={index}>
                            <Col md="2">
                                <div className="image-container mt-2">
                                    <img src={ "http://localhost:5001/profile_images/" + user.image} alt="UserImage"/>
                                </div>
                            </Col>
                            <Col md="6"><div className="name-container mt-3">{user.first_name} {user.last_name}</div></Col>
                            {/* <Col md="2"><div class="unseen_count">0</div></Col> */}
                            <Col md="2">&nbsp;</Col>
                            <Col md="2">
                                <div className="icon-container mt-2" onClick={() => this.showChatList(user._id, index)}>
                                    <FontAwesomeIcon className="" icon="angle-right"/>
                                </div>
                            </Col>
                        </Row>
                    ))}
                    </div>
                    <div className={this.state.chatListClass}>
                    <span class="chat-list-close-btn" onClick={this.hideChatList}><FontAwesomeIcon icon="times"/></span>
                    <div class="mesgs p-3 pt-4">
                        <div class="msg_history">
                        {this.state.chatList.map((chat, index) => {
                            // console.log('this.state.loggedInUserData.id',this.state.loggedInUserData.id);
                            // console.log('chat.sender_id',chat.sender_id);
                            // const today = Date.now();
                            let dateTime = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit'}).format(new Date(chat.datetime));
                            return (this.state.loggedInUserData.id === chat.sender_id) ? (
                                <div className="outgoing_msg" key={index}>
                                    <div className="sent_msg">
                                    <p>{chat.message}</p>
                                    <span className="time_date"> {dateTime}</span> 
                                    </div>
                                </div>
                                ) : (
                                <div className="incoming_msg" key={index}>
                                    <div className="incoming_msg_img"> <img src={ "http://localhost:5001/profile_images/" + this.state.selectedSenderDetails[0].image} alt="test" /> </div>
                                    <div className="received_msg">
                                        <div className="received_withd_msg">
                                        <p>{chat.message}</p>
                                <span className="time_date"> {dateTime}</span>
                                        </div>
                                    </div>
                                </div>
                                )
                            }
                            )}
                            <div ref={(el) => { this.messagesEnd = el; }}></div>
                        </div>
                        <div className="type_msg">
                            <div className="input_msg_write">
                            <input type="text" className="write_msg pl-3" placeholder="Type a message" onChange ={this.messageChangeHandler} value={this.state.messageText || ""}/>
                            <button className="msg_send_btn" type="button" onClick={this.sendMessageToUser}><FontAwesomeIcon icon="paper-plane"/></button>
                            </div>
                        </div>
                    </div>

                    </div>
                </div>
                <div className="chat-icon-container">
                    <FontAwesomeIcon className="mr-1 mb-1 chat-icon" icon="comments" onClick={this.openCloseChatPanel}/>
                    {(totalUnseenCount > 0) ? (<span class="badge">{totalUnseenCount}</span>) : <></>}
                </div>
            </div>
            // <div className="container">
            //     <div className="row">
            //         <div className="col-4">
            //             <div className="card">
            //                 <div className="card-body">
            //                     <div className="card-title">Global Chat</div>
            //                     <hr/>
            //                     <div className="messages">
            //                         {this.state.messages.map(message => {
            //                             return (
            //                                 <div>{message.messageTo}: {message.message}</div>
            //                             )
            //                         })}
            //                     </div>

            //                 </div>
            //                 <div className="card-footer">
            //                     <input type="text" placeholder="Message To" value={this.state.messageTo} onChange={ev => this.setState({messageTo: ev.target.value})} className="form-control"/>
            //                     <br/>
            //                     {/* <input type="text" placeholder="Username" value={this.state.username} onChange={ev => this.setState({username: ev.target.value})} className="form-control"/> */}
            //                     {/* <br/> */}
            //                     <input type="text" placeholder="Message" className="form-control" value={this.state.message} onChange={ev => this.setState({message: ev.target.value})}/>
            //                     <br/>
            //                     <button onClick={this.sendMessage} className="btn btn-primary form-control">Send</button>
            //                 </div>
            //             </div>
            //         </div>
            //     </div>
            // </div>
        );
    }
}

export default Chat;