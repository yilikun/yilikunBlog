/**
 * Created by 金宝塔四楼扛把子 on 2017/4/7.
 */
//连接数据库，创建一个链接数据库的实例
// var setting = require("../setting")
// var MongoClient = require('mongodb').MongoClient
//
// var url = 'mongodb://'+setting.host+":"+setting.port+"/"+setting.db;
// // Use connect method to connect to the Server
// MongoClient.connect(url, function(err, db) {
//     // assert.equal(null, err);
//     console.log("已经成功连接数据库");
//
//     module.exports = db;
//     // db.close();
// });

var setting = require('../setting'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
    console.log("数据库已连接")
module.exports = new Db(setting.db, new Server(setting.host, setting.port),
    {safe: true});