var express = require('express');
var userRespJson = require('../../response/userDetails.json');

// Post request to find valid user or not
class UserDetails {
    constructor() {}

    getUserResponse(email) {
        const userCredens = userRespJson.userResp;
        const resp = userCredens.filter(e => {
            // console.log('obj',  obj);
            return (e.email === email)
        });
        // console.log('resp', resp);
        return resp;
    }
    
}


module.exports = UserDetails;