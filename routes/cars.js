const express = require('express');
const mysql = require('mysql');
var jwt = require('jsonwebtoken');
var md5 = require('md5');
var cors = require('cors');
const router = express.Router();

router.use(cors());

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rahul',
    database: 'hackathon'
});
var privateKey = "Rahul123"
connection.connect();

router.get('/',(req,res)=>{
    var promise1 = new Promise(function (resolve, reject) {
        connection.query('select blogs.id, title , description , category , blogs.created_at , likeCount , commentCount , viewCount , profileImg  from blogs , users where blogs.userId = users.id order by blogs.created_at desc', (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    });
    promise1.then(function (blogs) {
        res.send(blogs);
    }, function (err) {
        console.log(err);
        res.sendStatus(500);
    });
})

router.post('/entry', (req, res) => {
    var promise1 = new Promise(function (resolve, reject) {
        connection.query('insert into carEntry (plate,carImg,category,color,brand,year,makeModel)values (?,?,?,?,?,?,?)', [req.body.car.plate,req.body.car.carImg, req.body.car.category,req.body.car.color,req.body.car.brand,req.body.car.year,req.body.car.makeModel], (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    });
    var promise2 = new Promise(function (resolve, reject) {
        connection.query('insert into carInside (plate,carImg,category,color,brand,year,makeModel)values (?,?,?,?,?,?,?)', [req.body.car.plate,req.body.car.carImg, req.body.car.category,req.body.car.color,req.body.car.brand,req.body.car.year,req.body.car.makeModel], (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    });

    Promise.all([promise1, promise2]).then(function(values) {
        console.log("PROMISE");
        connection.query('select * from carEntry where plate = ?', [ req.body.car.plate ] , (err, result) => {
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
});

router.post('/exit', (req, res) => {
    var promise1 = new Promise(function (resolve, reject) {
        connection.query('insert into carExit (plate,carImg,category,color,brand,year,makeModel)values (?,?,?,?,?,?,?)', [req.body.car.plate,req.body.car.carImg, req.body.car.category,,req.body.car.color,req.body.car.brand,req.body.car.year,req.body.car.makeModel], (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    });
    var promise2 = new Promise(function (resolve, reject) {
        connection.query('delete from carInside where plate = ?', [req.body.car.plate], (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    });

    Promise.all([promise1, promise2]).then(function(values) {
        console.log("PROMISE");
        connection.query('select * from carExit where plate = ?', [ req.body.car.plate ] , (err, result) => {
            if (err) {
                console.log(err);
                res.sendStatus(500);
            }
            else {
                res.send("result");
            }
        })
    }, function (err) {
        console.log(err);
        res.sendStatus(500);
    });
      });

router.get('/carsInsideResidence', (req, res) => {
    var promise1 = new Promise(function (resolve, reject) {
        connection.query('select plate from carInside where category = "residence"', (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    }).then(function(result){
        res.send([
                {
                  "car_no": "AP25TR4237",
                  "position": "Still Inside",
                  "car_belonging": "Resident's",
                  "time": "15/12/19 | 15:10 - ",
                  "color_label": "#00FF00"
                },
                {
                  "car_no": "AP14TO1427",
                  "position": "Went Out",
                  "car_belonging": "Taxi/Cab",
                  "color_label": "#FB940B",
                  "time": "15/12/19 | 15:10 - 15/12/19 | 15:20 "
                },
                {
                  "car_no": "TN04TR6352",
                  "position": "Went Out",
                  "car_belonging": "Private",
                  "color_label": "#FB9",
                  "time": "15/12/19 | 15:10 - 16/12/19 | 06:20 "
                }
              ]);
    },function(err){
        console.log(err);
        res.sendStatus(401);
    });;
});

router.get('/carsInsideTaxi', (req, res) => {
    var promise1 = new Promise(function (resolve, reject) {
        connection.query('select plate from carInside where category = "taxi"', (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        })
    }).then(function(result){
        res.send(result);
    },function(err){
        console.log(err);
        res.sendStatus(401);
    });
});


router.get('/carsInsideCount', (req, res) => {
    var promise1 = new Promise(function (resolve, reject) {
        connection.query('select count(*) as count from carInside ', (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    }).then(function(result){
        res.send(result);
    },function(err){
        console.log(err);
        res.sendStatus(401);
    });;
});

router.patch('/:blog_id',(req,res)=>{
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
            connection.query('update blogs set title = ? , description = ? where id = ? and userId = ?', [req.body.blog.title,req.body.blog.description,req.params.blog_id,userId], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            })
        });

        promise1.then(function(blogs){
            connection.query('select * from blogs where id = ? and userId = ?',[req.params.blog_id,userId],(err,result)=>{
                if(err)
                {
                    res.sendStatus(401);
                }
                else{
                    res.send(result);
                }
            });
        },function(err){
            console.log(err);
            res.sendStatus(401);
        });

    }
    else {
        res.sendStatus(401);
    }
});

router.delete('/:blog_id',(req,res)=>{
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
            connection.query('delete from blogs where id = ? and userId = ?', [req.params.blog_id,userId], (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            })
        });
        promise1.then(function(blogs){
            res.send("deleted");   
        },function(err){
            res.sendStatus(401);
        });
    }
    else {
        res.sendStatus(401);
    }
});


module.exports = router;
