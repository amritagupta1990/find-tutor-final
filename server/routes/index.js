const express = require('express');
const Router = express.Router();
const UserDetails = require('../modules/userDetails/userDetails');
const jwt =  require('jsonwebtoken');
const { ensureJWTAuthentication } = require('../config/auth');
var bcrypt = require('bcryptjs');
var multer  = require('multer');
var {sendTemplateEmail} = require('../config/emailSender');
let server = require('../bin/www');
var crypto = require('crypto');
var MongoClient = require('mongodb').MongoClient
//Image Upload Library
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/profile_images/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + "_" + file.originalname)
  }
});
var upload = multer({ storage: storage });

var ObjectId = require('mongodb').ObjectID;
var socket = require('socket.io');


//DB Connection
const uri = "mongodb+srv://amrita123:Amrita@123456@cluster0.nhkaa.mongodb.net/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri);
const dbClient = client;
const dbName = "find_tutor_db";
const dbURI = uri;
const mongo_client = MongoClient;



/* GET home page. */
Router.route('/users')
  .get((req, res) => {
    res.send('Hello world')
  })
  .post((req, res) => {});

// Fetch User Details after successfull login
Router.get('/userDetails', ensureJWTAuthentication, (req, res) => {
    var decodedUserData = req.decoded;
    console.log('decodedUserData', decodedUserData);
    const userResp = new UserDetails();
    const resp = userResp.getUserResponse(decodedUserData.email);
    let respObj = {
      status: 200,
      userDetails: []

    };
    if(resp.length > 0) respObj.userDetails = resp;
    res.json(respObj)
  });

// validate the user is present or not at the time of login
var jwtOptions = {};
jwtOptions.secretOrKey = "react-poc-secret-key";
Router.route('/login')
  .post((req, res) => {
    // const login = new Login();
    // const resp = login.isValidUser(req.body);
    // let respObj = {
    //   status: 200,
    //   isValidUser: false,
    //   token:''
    // };
    // console.log(resp);
    // if(resp.length > 0) {
    //   respObj.isValidUser = true;
    //   var userId = 1; // should be dynamic id of the user
    //   var payload = {id: userId, email: req.body.email};
    //   var token = jwt.sign(payload, jwtOptions.secretOrKey, {expiresIn: '10h'});
    //   respObj.token = token;
    //   respObj.userDetails = payload;
    // }
    // res.json(respObj);

    var obj = req.body;
    var msgObj = {};
    mongo_client.connect(dbURI, function(err, dbObj) {
        if (err) {
            console.log('Error in DB Connection', err);
            msgObj = { error: true, message: "Error in document find"};
            res.status(200).json(msgObj);
        }else{
            var db = dbObj.db(dbName);
            var collectionInstance = db.collection("auth_users");
            var userquery = { email: obj.email };
            collectionInstance.findOne(userquery, function(err, result) {
                if (err) {
                    dbObj.close();
                    console.log('Error occurred while finding user');
                    msgObj = { error: true, message: "Error in user find query", isValidUser: false};
                    res.status(200).json(msgObj);
                  }else{
                      if(result){
                        console.log(result);
                        bcrypt.compare(obj.password, result.password, function(err, isMatch) {
                            if (err) {
                                dbObj.close();
                                console.log('Error occurred while comparing password');
                                msgObj = { error: true, message: "Error in password checking", isValidUser: false};
                                res.status(200).json(msgObj);
                            } else if (!isMatch) {
                                console.log("Password doesn't match!")
                                dbObj.close();
                                msgObj = { error: true, message: "Password doesn't match! Try another.", isValidUser: false};
                                res.status(200).json(msgObj);
                            } else {
                                dbObj.close();
                                var payload = {id: result._id, email: result.email};
                                var token = jwt.sign(payload, jwtOptions.secretOrKey, {expiresIn: '10h'});
                                var userDetails = {id: result._id, email: result.email, user_role:result.user_role, first_name: result.first_name, last_name: result.last_name};;
                                msgObj = { error: false, message: "Successful login!", userDetails: userDetails, isValidUser: true, token: token, };
                                
                                res.status(200).json(msgObj);
                            }
                          })
                      }else{
                        dbObj.close();
                        console.log('Not a registered email');
                        msgObj = { error: true, message: "Email is not registered. Please Register.", isValidUser: false};
                        res.status(200).json(msgObj);
                      }
                  }
            });
        }
    });
  });

/***
 * Route For User Registration
 */
Router.route('/register_user').post((req,res) => {
  var obj = req.body;
  mongo_client.connect(dbURI, function(err, dbObj) {
    var msgObj = {
      error: false,
      message: ""
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{
        var db = dbObj.db(dbName);
        var role = obj.user_role; //Admin:1, Tutor: 2, Student:3
        // if(obj.user_role.toLowerCase() === 2){
        //     role = 2;//Admin:1, Tutor: 2, Student:3
        // }else if(obj.user_role.toLowerCase() === 'student'){
        //     role = 3;//Admin:1, Tutor: 2, Student:3
        // }commented as role code 2 or 3 is getting passed
        var doc = {
            email: obj.email,
            mobile: obj.mobile,
            first_name: obj.first_name,
            last_name: obj.last_name,
            password: obj.password,
            user_role: +role,
        };
        var collectionInstance = db.collection("auth_users");
        var userquery = { email: obj.email };
        collectionInstance.find(userquery).toArray(function(err, result) {
          if (err) {
            dbObj.close();
            console.log('Error occurred while finding user');
            msgObj = { error: true, message: "Error in document find"};
            res.status(200).json(msgObj);
          }else{
            if(result.length > 0){
              dbObj.close();
              console.log('Email already exists.');
              msgObj = { error: true, message: "Email already exists."};
              res.status(200).json(msgObj);
            }else{
              let saltRounds = 10;
              bcrypt.hash(doc.password, saltRounds, function(errHash, hash){
                if(errHash){
                  dbObj.close();
                  console.log('Error in password Encryption');
                  msgObj = { error: true, message: "Error in password Encryption."};
                  res.status(200).json(msgObj);
                }else{
                    doc.password = hash;
                    collectionInstance.insertOne(doc, function(err, res_db) {
                      dbObj.close();
                      if (err) {
                          console.log('Error occurred while inserting');
                          msgObj = { error: true, message: "Error in document insert"};
                          res.status(200).json(msgObj);
                      }else{
                          msgObj = { error: false, message: "Registered Successfully. Please Login."};
                          console.log('inserted record');
                          res.status(200).json(msgObj);
                      }
                  
                  });
                }
              });
            }
          }
        });


    }
    
  });
});

Router.route('/updateUserProfile').post(ensureJWTAuthentication, (req,res) => {
  var obj = req.body.userdetails;
  // console.log('req dets====',obj);
  mongo_client.connect(dbURI, function(err, dbObj) {
    var msgObj = {
      error: false,
      message: ""
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{
        var db = dbObj.db(dbName);
      
        var collectionInstance = db.collection("auth_users");
        var userquery = {"email" : obj.email};
        let newValues;
        if(+obj.user_role === 2){
          newValues = {$set: { mobile: obj.mobile,address:obj.address,professional_details:obj.professional_details,qualification:obj.qualification,specialization:obj.specialization,monthly_fees_min:+obj.monthly_fees_min,monthly_fees_max:+obj.monthly_fees_max, first_name: obj.first_name, last_name: obj.last_name, bio: obj.bio}};
        }
        if(+obj.user_role === 3){
          newValues = {$set: { mobile: obj.mobile,address:obj.address,first_name: obj.first_name, last_name: obj.last_name,education_institute:obj.education_institute,standard:obj.standard, subjects: obj.subjects}};
        }
        // console.log("newValues", newValues);

        
        
        // return false;
        
        collectionInstance.updateOne(userquery,newValues,function(err,resp){
          if (err) {
            dbObj.close();
            console.log('Error occurred while finding user');
            msgObj = { error: true, message: "Error in document find"};
            res.status(200).json(msgObj);
          }else{
            dbObj.close();            
            console.log("updated record");
            let msgObj = { error: false, message: "Updated Successfully"};            
            res.status(200).json(msgObj);
          }
        });


    }
    
  });
});
Router.route('/showUserProfile').post(ensureJWTAuthentication, (req,res) => {
  var obj = req.body.userdetails;
  console.log('userdetails====',obj);
  mongo_client.connect(dbURI, function(err, dbObj) {
    var msgObj = {
      error: false,
      message: ""
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{
        var db = dbObj.db(dbName);
    
        var collectionInstance = db.collection("auth_users");
        var userquery = {"email" : obj.email};
        
        collectionInstance.findOne(userquery,function(err,resp){
          if (err) {
            dbObj.close();
            console.log('Error occurred while finding user');
            msgObj = { error: true, message: "Error in document find"};
            res.status(200).json(msgObj);
          }else{
            dbObj.close();
            let respObj = {
              userdetails: []
        
            };
            if(resp) 
            respObj.userdetails = resp;
            res.status(200).json(respObj);
          }
        });


    }
    
  });
});
Router.post('/profileImageUpload', upload.single('image_file'), ensureJWTAuthentication, (req, res) => {
// Router.route('/profileImageUpload', upload.single('avatar')).post(ensureJWTAuthentication, (req,res) => {
  // console.log(req.file);
  // console.log(req.body.old_image_name);
  const filename = req.file.filename;
  const email = req.body.email;
  mongo_client.connect(dbURI, function(err, dbObj) {
    var msgObj = {
      error: false,
      message: ""
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{

      var db = dbObj.db(dbName);
      var collectionInstance = db.collection("auth_users");
      var userquery = {"email" : email};
      let newValues = {$set: { image: filename}};
      collectionInstance.updateOne(userquery,newValues,function(err,resp){
        if (err) {
          dbObj.close();
          console.log('Error occurred while finding user');
          msgObj = { error: true, message: "Error in updating document"};
          res.status(200).json(msgObj);
        }else{
          dbObj.close();            
          // console.log("updated record");
          let msgObj = { error: false, message: "Image Saved Successfully", image: filename};
          console.log('req.body.old_image_name', req.body.old_image_name);
          if(req.body.old_image_name !=='' && req.body.old_image_name !=='undefined'){
            let fs = require('fs');
            var filePath = 'public/profile_images/' + req.body.old_image_name; 
            fs.unlinkSync(filePath); 
          }    
          res.status(200).json(msgObj);
        }
      });
    }
  });
});

Router.post('/getDashboardData', ensureJWTAuthentication, (req, res) => {
  mongo_client.connect(dbURI, function(err, dbObj) {
    var msgObj = {
      error: false,
      message: ""
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{
      var db = dbObj.db(dbName);
      var collectionInstance = db.collection("auth_users");
      console.log(+req.body.user_role);
      var userquery;
      var requestQuery;
      if(+req.body.user_role === 2){
        userquery = { user_role: 3 };
        requestQuery = {receiver_id: req.body.user_id, $or: [ { status: 'accepted' }, { status: "rejected" } ]}
      }
      if(+req.body.user_role === 3){
        userquery = { user_role: 2 };
        requestQuery = {sender_id: req.body.user_id, $or: [ { status: 'accepted' }, { status: "rejected" } ]}
      }
      let requestCollection = db.collection("requests");
      requestCollection.find(requestQuery).toArray(function(err, requests) {
        if (err) {
              dbObj.close();
              console.log('Error occurred while finding users');
              msgObj = { error: true, message: "Error in user find query", isValidUser: false};
              res.status(200).json(msgObj);
        }else{
          let accepted_list = [];
          let rejected_list = [];
          if(+req.body.user_role === 2){
            accepted_list = requests.reduce((acc, request) => { 
              if(request.status === 'accepted'){
                acc.push(ObjectId(request.sender_id));
              }
              return acc;
            }, []); 
            rejected_list = requests.reduce((acc, request) => { 
              if(request.status === 'rejected'){
                acc.push(ObjectId(request.sender_id));
              }
              return acc;
            }, []);
          }
          if(+req.body.user_role === 3){
            accepted_list = requests.reduce((acc, request) => { 
              if(request.status === 'accepted'){
                acc.push(ObjectId(request.receiver_id));
              }
              return acc;
            }, []); 
            rejected_list = requests.reduce((acc, request) => { 
              if(request.status === 'rejected'){
                acc.push(ObjectId(request.receiver_id));
              }
              return acc;
            }, []);
          }    
          collectionInstance.aggregate([
            { $match : userquery },
            {
              $addFields: {
                "accepted": { "$in": [
                  "$_id",
                  accepted_list
                ]},
                "rejected": { "$in": [
                  "$_id",
                  rejected_list
                ]},
            }
          }
          ]).toArray(function(err, result) {
            if (err) {
                  dbObj.close();
                  console.log('Error occurred while finding users');
                  msgObj = { error: true, message: "Error in user find query", isValidUser: false};
                  res.status(200).json(msgObj);
                }else{
                  collectionInstance.find().sort({monthly_fees_max:-1}).limit(1).toArray(function(err, resultMax) {
                    if (err) {
                      dbObj.close();
                      console.log('Error occurred while finding users');
                      msgObj = { error: true, message: "Error in user find query", isValidUser: false};
                      res.status(200).json(msgObj);
                    }else{
                      collectionInstance.find({ "monthly_fees_min": { $gte: 0 }}).sort({monthly_fees_min:+1}).limit(1).toArray(function(err, resultMin) {
                        if (err) {
                          dbObj.close();
                          console.log('Error occurred while finding users');
                          msgObj = { error: true, message: "Error in user find query", isValidUser: false};
                          res.status(200).json(msgObj);
                        }else{
                          // dbObj.close();
                          // console.log('resultMax', resultMin);
                          let minResult = 0;
                          if(resultMin[0].monthly_fees_min){
                            minResult = resultMin[0].monthly_fees_min;
                          }
        
                          const requestCollection = db.collection("requests");
                          requestCollection.aggregate([
                            { $match : { receiver_id : req.body.user_id, status: 'pending' } },
                            {
                              "$addFields": {
                                "senderId": {
                                  "$toObjectId": "$sender_id"
                                }
                              }
                            },
                            {
                              "$lookup": {
                                "from": "auth_users",
                                "localField": "senderId",
                                "foreignField": "_id",
                                "as": "senderDetails"
                              }
                            }
                          ]).toArray(function(err, res_request) {
                            if (err) {
                              console.log(err);
                              console.log('Error occurred while inserting message');
                              msgObj = { error: true, message: "Request Sent but couldn't deliver message", isSent: true};
                              res.status(200).json(msgObj);
                            }else{
                              dbObj.close();
                              // if(res_request && res_request!== null){
                              //   respObj.isSent = true;
                              //   respObj.requestDetails = res_request;
                              // }
                              
                              // res.status(200).json(respObj);
        
                              // console.log('res_request===>', res_request);
        
                              msgObj = { error: false, message: "", userList: result , maxFees: resultMax[0].monthly_fees_max, minFees: minResult, requestList: res_request};
                              // console.log('resultMin', resultMin);
                              res.status(200).json(msgObj);
                            }
                          });
                          
                          
                        }
                      });
                     
                    }
                  })
                }
          });
        }

      });

      // ---------
      // collectionInstance.find(userquery).toArray(function(err, result) {
      //   if (err) {
      //     dbObj.close();
      //     console.log('Error occurred while finding users');
      //     msgObj = { error: true, message: "Error in user find query", isValidUser: false};
      //     res.status(200).json(msgObj);
      //   }else{
      //     collectionInstance.find().sort({monthly_fees_max:-1}).limit(1).toArray(function(err, resultMax) {
      //       if (err) {
      //         dbObj.close();
      //         console.log('Error occurred while finding users');
      //         msgObj = { error: true, message: "Error in user find query", isValidUser: false};
      //         res.status(200).json(msgObj);
      //       }else{
      //         collectionInstance.find({ "monthly_fees_min": { $gte: 0 }}).sort({monthly_fees_min:+1}).limit(1).toArray(function(err, resultMin) {
      //           if (err) {
      //             dbObj.close();
      //             console.log('Error occurred while finding users');
      //             msgObj = { error: true, message: "Error in user find query", isValidUser: false};
      //             res.status(200).json(msgObj);
      //           }else{
      //             // dbObj.close();
      //             // console.log('resultMax', resultMin);
      //             let minResult = 0;
      //             if(resultMin[0].monthly_fees_min){
      //               minResult = resultMin[0].monthly_fees_min;
      //             }

      //             const requestCollection = db.collection("requests");
      //             requestCollection.aggregate([
      //               { $match : { receiver_id : req.body.user_id, status: 'pending' } },
      //               {
      //                 "$addFields": {
      //                   "senderId": {
      //                     "$toObjectId": "$sender_id"
      //                   }
      //                 }
      //               },
      //               {
      //                 "$lookup": {
      //                   "from": "auth_users",
      //                   "localField": "senderId",
      //                   "foreignField": "_id",
      //                   "as": "senderDetails"
      //                 }
      //               }
      //             ]).toArray(function(err, res_request) {
      //               if (err) {
      //                 console.log(err);
      //                 console.log('Error occurred while inserting message');
      //                 msgObj = { error: true, message: "Request Sent but couldn't deliver message", isSent: true};
      //                 res.status(200).json(msgObj);
      //               }else{
      //                 dbObj.close();
      //                 // if(res_request && res_request!== null){
      //                 //   respObj.isSent = true;
      //                 //   respObj.requestDetails = res_request;
      //                 // }
                      
      //                 // res.status(200).json(respObj);

      //                 console.log('res_request===>', res_request);

      //                 msgObj = { error: false, message: "", userList: result , maxFees: resultMax[0].monthly_fees_max, minFees: minResult, requestList: res_request};
      //                 // console.log('resultMin', resultMin);
      //                 res.status(200).json(msgObj);
      //               }
      //             });
                  
                  
      //           }
      //         });
             
      //       }
      //     })
      //   }
      // });
    }
});
});

Router.route('/getUserDetails').post(ensureJWTAuthentication, (req,res) => {
  var userId = req.body.userId;
  var loggedInUserId = req.body.logged_in_userId;
  // console.log('userId========>', typeof(userId));
  mongo_client.connect(dbURI, function(err, dbObj) {
    var msgObj = {
      error: false,
      message: ""
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{
        var db = dbObj.db(dbName);
    
        var collectionInstance = db.collection("auth_users");
        var userquery = {_id : ObjectId(userId)};
        // {"_id": ObjectId("568c28fffc4be30d44d0398e")}
        collectionInstance.findOne(userquery,{ projection: { password: 0, resetPasswordExpires: 0, resetPasswordToken: 0} }, function(err,resp){
          if (err) {
            dbObj.close();
            console.log('Error occurred while finding user');
            msgObj = { error: true, message: "Error in document find"};
            res.status(200).json(msgObj);
          }else{
            // dbObj.close();
            let respObj = {
              userdetails: {},
              isSent: false,
              requestDetails: {}
            };
            if(resp){
              respObj.userdetails = resp;
            }
            const requestCollection = db.collection("requests");
              // let requestQuery = {
              //   sender_id: senderId,
              //   receiver_id: receiverId,
              //   message: message,
              //   isSeen: false,
              //   datetime: new Date()
              // };
              requestCollection.findOne({sender_id: loggedInUserId, receiver_id: userId}, function(err, res_request) {
                if (err) {
                  console.log('Error occurred while inserting message');
                  msgObj = { error: true, message: "Request Sent but couldn't deliver message", isSent: true};
                  res.status(200).json(msgObj);
                }else{
                  if(res_request && res_request!== null){
                    respObj.isSent = true;
                    respObj.requestDetails = res_request;
                  }
                  
                  res.status(200).json(respObj);
                }
              });
              
            // res.status(200).json(respObj);
          }
        });


    }
    
  });
});

Router.route('/sendRequest').post(ensureJWTAuthentication, (req,res) => {
  let senderId = req.body.senderId;
  let receiverId = req.body.receiverId;
  let message = req.body.message;
  mongo_client.connect(dbURI, function(err, dbObj) {
    let msgObj = {
      error: false,
      message: ""
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{
      let db = dbObj.db(dbName);
        const collectionInstance = db.collection("requests");
        let doc = {
          sender_id: senderId,
          receiver_id: receiverId,
          status: 'pending',
          datetime: new Date()
        };
        collectionInstance.insertOne(doc, function(err, res_db) {
          // dbObj.close();
          if (err) {
              console.log('Error occurred while inserting');
              msgObj = { error: true, message: "Error in document insert", isSent: false};
              res.status(200).json(msgObj);
          }else{
              //insert into message collection
              const messageCollection = db.collection("messages");
              let messageDoc = {
                sender_id: senderId,
                receiver_id: receiverId,
                message: message,
                isSeen: false,
                datetime: new Date()
              };
              messageCollection.insertOne(messageDoc, function(err, res_msg) {
                if (err) {
                  console.log('Error occurred while inserting message');
                  msgObj = { error: true, message: "Request Sent but couldn't deliver message", isSent: true};
                  res.status(200).json(msgObj);
                }else{
                  var io = req.app.get('socketio');
                  io.emit(receiverId + '_RECEIVE_MESSAGE', messageDoc);
                  msgObj = { error: false, message: "Request Sent Successfully!", isSent: true};
                  res.status(200).json(msgObj);
                }
              });
          }
      });
      }
    });
  
});

Router.route('/manageRequest').post(ensureJWTAuthentication, (req,res) => {
  let request_id = req.body.request_id;
  let status = req.body.status;
  let loggedINUserId= req.body.loggedINUserId;
  mongo_client.connect(dbURI, function(err, dbObj) {
    var msgObj = {
      error: false,
      message: "",
      requestList:[]
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{
      const db = dbObj.db(dbName);
    
        let collectionInstance = db.collection("requests");
        let userquery = {_id : ObjectId(request_id)};
        let newValues = {$set: { status: status}};
        collectionInstance.updateOne(userquery,newValues,function(err,resp){
          if (err) {
            dbObj.close();
            msgObj = { error: true, message: "Error in updating document"};
            res.status(200).json(msgObj);
          }else{
            collectionInstance.aggregate([
              { $match : { receiver_id : loggedINUserId, status: 'pending' } },
              {
                "$addFields": {
                  "senderId": {
                    "$toObjectId": "$sender_id"
                  }
                }
              },
              {
                "$lookup": {
                  "from": "auth_users",
                  "localField": "senderId",
                  "foreignField": "_id",
                  "as": "senderDetails"
                }
              }
            ]).toArray(function(err, res_request) {  
              msgObj = {
                error: false,
                message: "Request " + status + " successfully!",
                requestList: res_request
              }; 
              res.status(200).json(msgObj);  
            });
          }
        });
    }
  });
});


// console.log('server', server);
// var io = socket(server);

// io.on('connection', (socket) => {
//   // console.log('socket===>',socket);
//     console.log('socket id==>', socket.id);

//     socket.on('SEND_MESSAGE', function(data){
//       console.log('data', data.messageTo + '_RECEIVE_MESSAGE');
//         io.emit(data.messageTo + '_RECEIVE_MESSAGE', data);
//         // socket.join("test room");
//         // io.in('test room').emit('RECEIVE_MESSAGE', data);

//     });
// });
    

Router.route('/forgotPassword').post((req,res) => {
  var obj = req.body.email;
  // console.log('email====',obj);
  mongo_client.connect(dbURI, function(err, dbObj) {
    var msgObj = {
      error: false,
      message: ""
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{
      
        var db = dbObj.db(dbName);
    
        var collectionInstance = db.collection("auth_users");
        var userquery = {"email" : obj};
       
        collectionInstance.findOne(userquery,function(err,resp){
          if (err) {
            dbObj.close();
            console.log('Error occurred while finding user');
            msgObj = { error: true, message: "Not a Registered Email.Please Register"};
            res.status(200).json(msgObj);
          }else{
            if(resp !=null){
            let payload = {userDetails:resp};
            const token = crypto.randomBytes(20).toString('hex');
            let userquery = {"email" : obj};
            let newValues;
            let resetPasswordToken = token;
            let resetPasswordExpires =  Date.now() + 3600000;
            newValues = {$set: { resetPasswordToken: resetPasswordToken , resetPasswordExpires : resetPasswordExpires }};
            collectionInstance.updateOne(userquery,newValues,function(err,resp){
              if (err) {
                dbObj.close();
                console.log('Error occurred while finding user');
                msgObj = { error: true, message: "Error in document find"};
                res.status(200).json(msgObj);
              }else{
                console.log("updated record");
                let msgObj = { error: false, message: "Reset Mail Sent Successfully"}; 
                let templateConfig = {
                  from: 'mySqlDemoEmail@gmail.com',
                  to: obj,
                  subject: 'Link To Reset Password',
                  text:
                      'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'
                      + 'Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n'
                      + `http://localhost:3000/reset/${token}\n\n`
                      + 'If you did not request this, please ignore this email and your password will remain unchanged.\n',
                      }       
                      sendTemplateEmail(templateConfig);   
                  dbObj.close();                                 
                res.status(200).json(msgObj);
              }
        });
      }else{
        dbObj.close();
        console.log('Error occurred while finding user');
        msgObj = { error: true, message: "Not a Registered Email.Please Register"};
        res.status(200).json(msgObj);
      }
      }
    });
  }
});
});

Router.route('/resetPassword').post((req,res) => {
  // var obj = req.body.email;
  // console.log('email====',obj);
  mongo_client.connect(dbURI, function(err, dbObj) {
    var msgObj = {
      error: false,
      message: ""
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{
        var db = dbObj.db(dbName);
        var resetPasswordToken =req.body.params.resetPasswordToken;
        // console.log("body",req.body.params.resetPasswordToken);
    
        var collectionInstance = db.collection("auth_users");
        var userquery = {"resetPasswordToken" : resetPasswordToken};
      //  console.log("userquery====",userquery);
        collectionInstance.findOne(userquery,function(err,resp){
          if (err) {
            dbObj.close();
            console.log('Error occurred while finding user');
            msgObj = { error: true, message: "Not a Registered Email.Please Register"};
            res.status(200).json(msgObj);
          }else{
            if (resp == null) {
              dbObj.close();
              console.error('password reset link is invalid or has expired');
              msgObj = { error: true, message: 'password reset link is invalid or has expired'};
              res.status(200).json(msgObj);
            } else {
              dbObj.close();              
              // res.status(200).send({
              //   username: resp.email,
              //   message: 'password reset link a-ok',
              // });
              // console.log("response===",resp);
              msgObj = { error: false, message: 'password reset link a-ok', email: resp.email};
              res.status(200).json(msgObj);
            }
      }
    });
  }
});
});

Router.route('/updatePasswordViaEmail').post((req,res) => {
  var obj = req.body;
  var email = req.body.email;
  var resetPasswordToken = req.body.resetPasswordToken;
  mongo_client.connect(dbURI, function(err, dbObj) {
    var msgObj = {
      error: false,
      message: ""
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{
        var db = dbObj.db(dbName);
        // var resetPasswordToken =req.body.params.resetPasswordToken;
        // console.log("body",req.body.params.resetPasswordToken);
        var collectionInstance = db.collection("auth_users");
        var userquery = {"email": email ,"resetPasswordToken" : resetPasswordToken};
        // console.log("userquery=====",userquery);
        collectionInstance.findOne(userquery,function(err,resp){
          if (err) {
            dbObj.close();
            console.log('Error occurred while finding user');
            msgObj = { error: true, message: "Not a Registered Email.Please Register"};
            res.status(200).json(msgObj);
          }else{
            if (resp == null) {
              dbObj.close();
              console.error('password reset link is invalid or has expired');
              msgObj = { error: true, message: 'password reset link is invalid or has expired'};
              res.status(200).json(msgObj);
            } else {
              // dbObj.close();              
              // res.status(200).send({
              //   username: resp.email,
              //   message: 'password reset link a-ok',
              // });
              let saltRounds = 10;
              let newPassword = obj.newPassword;
              let confirmPassword = obj.confirmPassword;
              bcrypt.hash(newPassword, saltRounds, function(errHash, hash){
                if(errHash){
                  dbObj.close();
                  console.log('Error in password Encryption');
                  msgObj = { error: true, message: "Error in password Encryption."};
                  res.status(200).json(msgObj);
                }else{
                  bcrypt.compare(confirmPassword,hash,function(errMatch,isMatch){
                    if(errMatch){
                    dbObj.close();
                    console.log('Error occurred while comparing password');
                    msgObj = { error: true, message: "Error in password checking"};
                    res.status(500).json(msgObj);
                } else if (!isMatch) {
                    console.log("Password doesn't match!")
                    dbObj.close();
                    msgObj = { error: true, message: "Password doesn't match! Try another."};
                    res.status(200).json(msgObj);
                } else{
                  let newValues;
                  newValues = {$set: { password: hash , resetPasswordExpires : null , resetPasswordToken: null }};
                  console.log("userquery==",userquery);
                  collectionInstance.updateOne(userquery,newValues,function(errorObj,resp){
                    if (errorObj) {
                      dbObj.close();
                      console.log('Error occurred while finding user',errorObj);
                      msgObj = { error: true, message: "Error in document find"};
                      res.status(200).json(msgObj);
                    }else{
                      console.log("updated password");
                      let msgObj = { error: false, message: "Reset Password Mail Sent Successfully"}; 
                      let templateConfig = {
                        from: 'mySqlDemoEmail@gmail.com',
                        to: email,
                        subject: 'Password Reset Successful',
                        text:
                            'You are receiving this because you (or someone else) have reset/changed password for your account.\n\n'
                            + 'If you did not request this, please login to the application and reset your password.\n',
                            }       
                            sendTemplateEmail(templateConfig);  
                        dbObj.close();                                        
                      res.status(200).json(msgObj);
                    }
              });
                }
              })
            }
              // msgObj = { error: false, message: 'password reset link a-ok', email: resp.email};
              // res.status(200).json(msgObj);
            });

      }
    }
  });
  }
});
});

Router.route('/getChatUserList').post(ensureJWTAuthentication, (req,res) => {
  const user_id = req.body.user_id;
  mongo_client.connect(dbURI, function(err, dbObj) {
    var msgObj = {
      error: false,
      message: ""
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{
        const db = dbObj.db(dbName);
        let collectionInstance = db.collection("messages");
        // collectionInstance.aggregate([
        //   { $match : { receiver_id : user_id } }
        // ]).toArray(function(err, res_request) {
        //   console.log('test res_request===>', res_request);
          
        // });

        collectionInstance.aggregate([
          { $match : { $or: [
            { receiver_id : user_id },
            {sender_id: user_id}
          ]} },
          {
            "$addFields": {
              "senderId": {
                "$toObjectId": "$sender_id"
              },
              "receiverId": {
                "$toObjectId": "$receiver_id"
              }
            }
          },
          {
            "$lookup": {
              "from": "auth_users",
              "localField": "senderId",
              "foreignField": "_id",
              "as": "senderDetails"
            }
          },
          {
            "$lookup": {
              "from": "auth_users",
              "localField": "receiverId",
              "foreignField": "_id",
              "as": "receiverDetails"
            }
          }
        ]).toArray(function(err, result){
          dbObj.close();
          if(err){
            msgObj = { error: true, message: "Something went wrong to fetch user list"};
            res.status(200).json(msgObj);
          }else{
            // console.log('result', result);
            msgObj = { error: false, message: '', result: result};
            res.json(msgObj);
          }
        });
        
      //   collectionInstance.aggregate([
      //     { $match : { $or: [
      //       { receiver_id : user_id },
      //       {sender_id: user_id}
      //     ]} },
      //     {
      //         $group: {
      //             _id: { sender: "$sender_id", isSeen: "$isSeen" },
      //             num: { $sum :1 }
      //         }
      //     },
      //     {
      //         $group: {
      //             _id: "$_id.sender",
      //             SeenCounts: { $push: { SeenStatus: "$_id.isSeen",count: "$num" } }
      //         }
      //     },
      //     {
      //       "$addFields": {
      //         "senderId": {
      //           "$toObjectId": "$_id"
      //         }
      //       }
      //     },
      //     {
      //       "$lookup": {
      //         "from": "auth_users",
      //         "localField": "senderId",
      //         "foreignField": "_id",
      //         "as": "senderDetails"
      //       }
      //     },
      //     {
      //       "$addFields": {
      //         "senderId": {
      //           "$toObjectId": "$_id"
      //         }
      //       }
      //     },
      //     {
      //       "$lookup": {
      //         "from": "auth_users",
      //         "localField": "senderId",
      //         "foreignField": "_id",
      //         "as": "senderDetails"
      //       }
      //     },
      //     {
      //         $project: {
      //             _id: 1,
      //             SeenCounts:1,
      //             senderDetails: 1
      //         }
      //     }
      
      // ]).toArray(function(err, result){
      //   dbObj.close();
      //   if(err){
      //     msgObj = { error: true, message: "Something went wrong to fetch user list"};
      //     res.status(200).json(msgObj);
      //   }else{
      //     msgObj = { error: false, message: '', result: result};
      //     res.json(msgObj);
      //   }
      // });
    }
  });

});

Router.route('/getChatList').post(ensureJWTAuthentication, (req,res) => {
  console.log('sender_id', req.body.sender_id);
  console.log('receiver_id', req.body.receiver_id);
  mongo_client.connect(dbURI, function(err, dbObj) {
    var msgObj = {
      error: false,
      message: ""
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{
        const db = dbObj.db(dbName);
        let collectionInstance = db.collection("messages");
        let updateCondition = {"sender_id": req.body.sender_id ,"receiver_id" : req.body.receiver_id, isSeen: false};
        let newValues = {$set: { isSeen: true}};
        collectionInstance.updateMany(updateCondition,newValues,function(errorObj,resp){
          if (errorObj) {
            dbObj.close();
            console.log('Error occurred while updating messages',errorObj);
            msgObj = { error: true, message: "Error in document update"};
            res.status(200).json(msgObj);
          }else{
            // console.log('resp==>', resp.modifiedCount);
            let query = {
              $or: [
                {sender_id: req.body.sender_id, receiver_id: req.body.receiver_id},
                {sender_id: req.body.receiver_id, receiver_id: req.body.sender_id}
              ]
            };
            collectionInstance.find(query, {"sort" : [['datetime', 'asc']]}).toArray( function (err, docs) {
              dbObj.close();
              if(err){
                msgObj = { error: true, message: "Something went wrong to fetch user list"};
                res.status(200).json(msgObj);
              }else{
                // console.log('docs', docs);
                msgObj = { error: false, message: '', messages: docs, modifiedCount: resp.modifiedCount};
                res.json(msgObj);
            }
            });
          }
        });
    }
  });
});

Router.route('/sendMessage').post(ensureJWTAuthentication, (req,res) => {

  let senderId = req.body.senderId;
  let receiverId = req.body.receiverId;
  let message = req.body.message;
  mongo_client.connect(dbURI, function(err, dbObj) {
    let msgObj = {
      error: false,
      message: ""
    };
    if (err) {
        console.log('Error in DB Connection', err);
        msgObj = { error: true, message: "Error in DB Conenction"};
        res.json(msgObj);
    }else{
              let db = dbObj.db(dbName);
              //insert into message collection
              const messageCollection = db.collection("messages");
              let messageDoc = {
                sender_id: senderId,
                receiver_id: receiverId,
                message: message,
                isSeen: false,
                datetime: new Date()
              };
              messageCollection.insertOne(messageDoc, function(err, res_msg) {
                if (err) {
                  console.log('Error occurred while inserting message');
                  msgObj = { error: true, message: "Error in saving message", isSent: true};
                  res.status(200).json(msgObj);
                }else{
                  // console.log('res_msg', res_msg.ops[0]);
                  sendChat(req, messageDoc);
                  msgObj = { error: false, message: "Message Sent Successfully!", isSent: true, insertedMsg: res_msg.ops[0]};
                  res.status(200).json(msgObj);
                }
              });
          }
      });
});

function sendChat(req, doc){
  var io = req.app.get('socketio');
  io.emit(doc.receiverId + '_RECEIVE_MESSAGE', doc);
  // io.emit(doc.receiverId + '_RECEIVE_MESSAGE', doc);
}



module.exports = Router;
