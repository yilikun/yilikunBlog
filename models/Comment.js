/**
 * Created by 金宝塔四楼扛把子 on 2017/4/12.
 */
var mongodb = require('./db');

function Comment(name, minute, title, comment) {
    this.name = name;
    this.minute = minute;
    this.title = title;
    this.comment = comment;
}
module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(callback) {
    var name = this.name,
        minute = this.minute,
        title = this.title,
        comment = this.comment;
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
            //通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的 comments 数组里
            collection.update({
                "name": name,
                "time.minute":minute,
                "title": title
            }, {
                $push: {"comments": comment}//一个数组，添加到最后。
            } , function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};