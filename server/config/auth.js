var jwt = require('jsonwebtoken');
module.exports = {
    ensureJWTAuthentication: function(req, res, next){
        console.log('test');
        var token = req.header('Authorization');
        console.log('token', token);
        if(token){
            if(token.startsWith('Bearer ')){
                token = token.slice(7, token.length);
                // eslint-disable-next-line no-undef
                jwt.verify(token, jwtSecret, (err, decoded) => {
                    if(err){
                        res.status(200).send({error: true, message: "Invalid Token", errorCode: 401});
                    }else{
                        req.decoded = decoded;
                        next();
                    }

                });
            }
        }else{
            res.status(200).send({error: true, message: "No Token Provided"});
        }

    }
};