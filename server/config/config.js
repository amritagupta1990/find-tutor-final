var MongoClient = require('mongodb').MongoClient
//JWT SECRET
global.jwtSecret = "react-poc-secret-key";

//DB Connection
const uri = "mongodb+srv://amrita123:Amrita@123456@cluster0.nhkaa.mongodb.net/<dbname>?retryWrites=true&w=majority";
const client = new MongoClient(uri);
global.dbClient = client;
global.dbName = "find_tutor_db";
global.dbURI = uri;
global.mongo_client = MongoClient;