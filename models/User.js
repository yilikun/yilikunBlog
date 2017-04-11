/**
 * Created by 金宝塔四楼扛把子 on 2017/4/7.
 */
/*
在models文件夹下创建user.js来完成注册用户的写入数据库行为

创建一个User对象，在对象中接收用户提交的用户名、密码、邮箱,并在原型方法中添加新增用户和查询用户的方法.并将User对象暴露.

    新增用户的步骤是:(User.prototype.save)

整理下数据--->打开数据库---->读取users集合----->将数据插入到users集合中---->回调函数中返回错误或者正确的信息
*/
//
var mongodb = require("./db")
function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}
module.exports = User;

//保存用户的注册信息
User.prototype.save = function(callback){
    var user = {
        name:this.name,
        password:this.password,
        email:this.email
    }
    //通过open方法打开数据库
    mongodb.open(function(err,db){
        if(err){
             callback(err);
        }
        //读取users集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                 callback(err);
            }
            //将用户数据插入users集合当中去.
            collection.insert(user,{safe:true},function(err,user){
                mongodb.close();
                if(err){
                     callback(err);//错误位置！！！！！！！！！！！
                }
                 callback(null,user[0]);//成功的话返回用户名
            })
        })
    })
}

// 查询用户的步骤是:(User.get)
//
// 打开数据库 ----> 读取users集合 ----> 查找用户名(name)的文档findOne ----->回调函数中返回错误或者用户的信息

//读取用户的信息
User.get = function(name,callback){//操作的是参数，没有必要放在原型上
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
             callback(err);
        }
        //读取users集合
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查询用户名(name)的文档
            collection.findOne({name:name},function(err,user){
                // ？！！！！！！！下面是错误位置
                mongodb.close();//！！！！！！！！！！！！！
                if(err){
                    return callback(err);
                }
                 callback(null,user);//成功返回查询的用户信息

            })

        })
    })
}