const express = require('express');
const mysql = require('mysql');
var jwt = require('jsonwebtoken');
var md5 = require('md5');
var cors = require('cors');
const bodyParser = require('body-parser')
const router = express.Router();
const jsonParser = bodyParser.json();

router.use(jsonParser);

router.use(cors());
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'rahul',
    password: 'rahul',
    database: 'web'
});
var privateKey = "Rahul123"
connection.connect();




router.post('/:blog_id', (req, res) => {
    console.log(req.headers);
    if (req.headers.authorization) {
        var authorization = req.headers.authorization;
        var decoded;
        if (authorization.startsWith('Bearer ')) {
            authorization = authorization.slice(7, authorization.length);
        }
        // console.log(authorization)
        try {
            decoded = jwt.verify(authorization, privateKey);
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
        var userId = decoded.id;
        var promise1 = new Promise(function (resolve, reject) {
            connection.query('delete from likes where blogId = ? and userId = ?', [req.params.blog_id,userId], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            })
        });
        var promise2 = new Promise(function(resolve,reject){
            connection.query('update blogs set likeCount = likeCount - 1 where id = ?',[req.params.blog_id],(err,result)=>{
                if(err){
                    reject(err);
                }
                else{
                    resolve(result);
                }
            })
        })
        Promise.all([promise1,promise2]).then(function(blogs){
            res.send("deleted");    //need work here...!!
        },function(err){
            res.sendStatus(401);
        });
    }
    else {
        res.sendStatus(401);
    }
})

router.delete('/:blog_id', (req, res) => {
    console.log(req.headers);
    if (req.headers.authorization) {
        var authorization = req.headers.authorization;
        var decoded;
        if (authorization.startsWith('Bearer ')) {
            authorization = authorization.slice(7, authorization.length);
        }
        // console.log(authorization)
        try {
            decoded = jwt.verify(authorization, privateKey);
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
        var userId = decoded.id;
        var promise1 = new Promise(function (resolve, reject) {
            connection.query('insert into likes (blogId,userId) values( ? , ?)', [req.params.blog_id,userId], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            })
        });
        var promise2 = new Promise(function(resolve,reject){
            connection.query('update blogs set likeCount = likeCount + 1 where id = ?',[req.params.blog_id],(err,result)=>{
                if(err){
                    reject(err);
                }
                else{
                    resolve(result);
                }
            })
        })
        Promise.all([promise1,promise2]).then(function(blogs){
            res.send("done");    //need work here...!!
        },function(err){
            res.sendStatus(401);
        });
    }
    else {
        res.sendStatus(401);
    }
})

module.exports = router;
