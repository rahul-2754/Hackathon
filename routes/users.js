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
    database: 'hackathon'
});
var privateKey = "Rahul123"
connection.connect();

router.post('/', (req, res) => {

    var images = [
        "https://cdn1.iconfinder.com/data/icons/avatars-55/100/avatar_profile_user_music_headphones_shirt_cool-512.png",
        "http://cdn3.iconfinder.com/data/icons/avatars-15/64/_Bearded_Man-17-512.png",
        "https://cdn1.iconfinder.com/data/icons/avatars-55/100/avatar_profile_user_cop_police_mustache_shades-512.png",
        "https://icon-library.net/images/flat-user-icon/flat-user-icon-4.jpg",
        "https://www.stickpng.com/assets/images/585e4bcdcb11b227491c3396.png",
        "http://files.softicons.com/download/business-icons/dragon-soft-icons-by-artua.com/png/512/User.png",
        "https://www.codetechnology.in/wp-content/uploads/2017/05/user-icon-6.png"
    ]
    var index = Math.floor(Math.random() * Math.floor(7));

    var promise1 = new Promise(function (resolve, reject) {
        connection.query('insert into users (name,username,email,password,profileImg,phone,plate,category) values (?,?,?,?,?,?,?,?)', [req.body.user.name,req.body.user.username, req.body.user.email, md5(req.body.user.password), images[index],req.body.user.phone,req.body.user.plate,req.body.user.category], (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    });
    promise1.then(function (user) {
        console.log("PROMISE");
        connection.query('select * from users where email = ?', [ req.body.user.email ] , (err, result) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            }
            else {
                res.send(result);
            }
        })
    }, function (err) {
        console.log(err);
        res.sendStatus(500);
    });
})

router.get('/', (req, res) => {
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
        // console.log(decoded.id);
        var promise1 = new Promise(function (resolve, reject) {
            connection.query('select * from users where id = ?', [userId], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            })
        });
        promise1.then(function(user){
            res.send(user)
        },function(err){
            console.log(err);
            res.sendStatus(500);
        })
    }
    else {
        res.sendStatus(401);
    }
});

router.patch('/',(req,res)=>{
    if (req.headers.authorization) {
        var authorization = req.headers.authorization;
        var decoded;
        if (authorization.startsWith('Bearer ')) {
            authorization = authorization.slice(7, authorization.length);
        }
        console.log(authorization)
        try {
            decoded = jwt.verify(authorization, privateKey);
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
        var userId = decoded.id;

        if(req.body.user.password != undefined)
        {
            var promise1 = new Promise(function (resolve, reject) {
                connection.query('update users set password = ? where id = ?', [md5(req.body.user.password),userId], (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                })
            }).then(function(student){
                connection.query('select * from users where id = ?',[userId], (err, result) => {
                    if (err) {
                        res.sendStatus(500);
                    }
                    else {
                        res.send(result);
                    }
                })
            },function(err){
                res.sendStatus(500);
            });
        }
        else
        {
            res.send("nothing to update");
        }
    }
    else {
        res.sendStatus(401);
    }
});

module.exports = router;
