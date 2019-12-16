const express = require('express');
const mysql = require('mysql');
var md5 = require('md5');
var cors = require('cors')
var jwt = require('jsonwebtoken');
const router = express.Router();

router.use(cors());
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'rahul',
    password : 'rahul',
    database : 'hackathon'
  });
   
  connection.connect();
  var privateKey = "Rahul123"
router.post('/',(req,res) => {
        var promise1 = new Promise(function(resolve,reject){connection.query('select * from users where email = ? and password = ?',[req.body.user.email,md5(req.body.user.password)],(err,result) =>{
            if(err)
            {
                reject(err);
            }
            else{
                resolve(result);
            }
        })
    });
    promise1.then(function(user)
        {
            if(user.length === 0)
            {
                res.send("failed");
            }
            else{
                // console.log(user[0].id);
                res.send({
                    "user" : {
                        "token" : jwt.sign({id: user[0].id}, privateKey ,
                        { expiresIn: 60 * 60 *60 *24 *30}),
                        "id" : user[0].id,
                        "category" : user[0].category
                    }
                });
            }
        },function(err){
            res.sendStatus(500);
        });
});



module.exports = router;