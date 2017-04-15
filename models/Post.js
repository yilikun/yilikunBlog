/**
 * Created by 金宝塔四楼扛把子 on 2017/4/10.
 */
var mongodb = require('./db');

//引入markdown
var markdown = require("markdown").markdown;

function Post(name, title, post) {
    this.name = name;
    this.title = title;
    this.post = post;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
    console.log("11111111111111111111111")
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        date:date,
        year:date.getFullYear(),
        month:date.getFullYear() + '-' + (date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1),
        day:date.getFullYear() + '-' + (date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-' + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()),
        minute:date.getFullYear() + '-' + (date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1 ) + '-' + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':' +
        (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
    }

    //要存入数据库的文档
    var post = {
        name: this.name,
        time: time,
        title: this.title,
        post: this.post,
        //加入一个字段，保存留言
        comments:[]
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 posts 集合
            collection.insert(post, {
                safe: true
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null);//返回 err 为 null
            });
        });
    });
};

//读取所有文章及其相关信息
// Post.getAll = function(name, callback) {
//     //打开数据库
//     mongodb.open(function (err, db) {
//         if (err) {
//             return callback(err);
//         }
//         //读取 posts 集合
//         db.collection('posts', function(err, collection) {
//             if (err) {
//                 mongodb.close();
//                 return callback(err);
//             }
//             var query = {};
//             if (name) {
//                 query.name = name;
//             }
//             //根据 query 对象查询文章
//             collection.find(query).sort({
//                 time: -1
//             }).toArray(function (err, docs) {
//                 console.log(docs)
//                 mongodb.close();
//                 if (err) {
//                     return callback(err);//失败！返回 err
//                 }
//
//                 //---------------------在发到前台之前，把文章的内容用markdown解析一下
//                 //
//                 // docs.forEach(function (doc) {
//                 //     doc.post = markdown.toHTML(doc.post);
//                 // });e
//                 //以上为markdown添加部分
//
//                 return callback(null, docs);//成功！以数组形式返回查询的结果
//             });
//         });
//     });
// };修改以上代码如下，实现分页功能
//一次获取十篇文章
Post.getTen = function(name, page, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }
            //使用 count 返回特定查询的文档数 total
            collection.count(query, function (err, total) {
                //根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
                collection.find(query, {
                    skip: (page - 1)*10,
                    limit: 10
                }).sort({
                    time: -1
                }).toArray(function (err, docs) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    //解析 markdown 为 html
                    docs.forEach(function (doc) {
                        doc.post = markdown.toHTML(doc.post);
                    });
                    callback(null, docs, total);
                });
            });
        });
    });
};


//获取一篇文章
Post.getOne = function (name,minute,title,callback) {
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取post集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //可以根据用户名、发表日期以及文章名进行查询
            collection.findOne({
                "name":name,
                "time.minute":minute,
                "title":title
            },function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                //文章正文的markdown解析
                doc.post = markdown.toHTML(doc.post);
                //留言的markdown解析
                doc.comments.forEach(function (comment) {
                    comment.content=markdown.toHTML(comment.content)
                })
                return callback(null,doc);//返回查询的一篇文章
            })
        })
    })
}

//编辑一篇文章（自己的）
//返回原始发表的内容（markdown 格式）
Post.edit = function(name, minute, title, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名、发表日期及文章名进行查询
            collection.findOne({
                "name": name,
                "time.minute": minute,
                "title": title
            }, function (err, doc) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, doc);//返回查询的一篇文章（markdown 格式）
            });
        });
    });
};

//更新一篇文章及其相关信息
Post.update = function(name, minute, title, post, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //更新文章内容
            collection.update({//第一个参数是查询的条件
                "name": name,//
                "time.minute": minute,//时间
                "title": title
            }, {
                $set: {post: post}//修改post字段为新的post字段
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

//删除一篇文章
Post.remove = function(name, minute, title, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据用户名、日期和标题查找并删除一篇文章
            collection.remove({
                "name": name,
                "time.minute": minute,
                "title": title
            }, {
                w: 1
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

//返回所有文章存档信息
Post.getArchive = function(callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //返回只包含 name、time、title 属性的文档组成的存档数组
            collection.find({}, {
                "name": 1,
                "time": 1,
                "title": 1
            }).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, docs);
            });
        });
    });
};