var express = require('express');
var loginRespJson = require('../../response/login.json');

// Post request to find valid user or not
class Login {
    constructor() {}

    isValidUser(obj)  {
        const loginCredens = loginRespJson.loginCredentials;
        const resp = loginCredens.filter(res => {
            console.log('obj---> login',obj);
            return ((res.email === obj.email) && (res.password === obj.password))
        });
        return resp;
    }
}


module.exports = Login;