const express = require('express');
const mysql = require('mysql');
var jwt = require('jsonwebtoken');
var md5 = require('md5');
var cors = require('cors');
const router = express.Router();

router.use(cors());
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'rahul',
    password: 'rahul',
    database: 'web'
});
var privateKey = "Rahul123"
connection.connect();

router.get('/:blog_id/:comment_id', (req, res) => {
    var promise1 = new Promise(function (resolve, reject) {
        connection.query('select * from comments where id = ?', [req.params.comment_id], (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    });

    promise1.then(function (user){
        res.send(user);
    },function(err){
        res.sendStatus(500);
    })
});


router.delete('/:blog_id/:comment_id',(req,res)=>{
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
            connection.query('delete from comments where id = ? and userId = ?', [req.params.comment_id,userId], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            })
        });

        var promise2 = new Promise(function(resolve,reject){
            connection.query('update blogs set commentCount = commentCount - 1 where id = ?',[req.params.blog_id],(err,result)=>{
                if(err){
                    reject(err);
                }
                else{
                    resolve(result);
                }
            })
        })

        Promise.all([promise1,promise2]).then(function(comments){
            res.send("deleted");  
        },function(err){
            console.log(err);
            res.sendStatus(401);
        });
    }
    else {
        res.sendStatus(401);
    }
})

router.post('/:blog_id', (req, res) => {
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
        connection.query('insert into comments (blogId,description,userId) values (?,?,?)', [req.params.blog_id,req.body.comment.description, userId], (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    });

    var promise2 = new Promise(function(resolve,reject){
        connection.query('update blogs set commentCount = commentCount +1 where id = ?',[req.params.blog_id],(err,result)=>{
            if(err){
                reject(err);
            }
            else{
                resolve(result);
            }
        })
    })

    Promise.all([promise1,promise2]).then(function (comments) {
        res.sendStatus(200);
    }, function (err) {
        console.log(err);
        res.sendStatus(500);
    });}
    else {
        res.sendStatus(401);
    }
});

router.patch('/:blog_id/:comment_id',(req,res)=>{
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
            connection.query('update comments set description = ? where id = ? and userId = ?', [req.body.comment.description,req.params.comment_id,userId], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            })
        });

        promise1.then(function(comments){
            connection.query('select * from comments where id = ? and userId = ?',[req.params.comment_id,userId],(err,result)=>{
                if(err)
                {
                    res.sendStatus(401);
                }
                else{
                    res.send(result);
                }
            });
        },function(err){
            res.sendStatus(401);
        });

    }
    else {
        res.sendStatus(401);
    }
})

module.exports = router;
