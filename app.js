var express = require('express');
var path = require('path');//处理url
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//引入路由
var routes = require('./routes/index');
// var users = require('./routes/users');

//引入数据库文件
// var db = require('./models/db')



var app = express();

//会话 数据库

//flash模块 通常和跳转结合起来用，用来提示用户消息（登陆成功或失败）。
var flash = require('connect-flash');

//支持会话,存放数据
var session = require('express-session');

//将会话保存在mongodb当中去，更加安全
var MongoStore  = require('connect-mongo')(session);

//引入数据库配置文件
var settings = require("./setting")

//使用flash模块
app.use(flash());

//使用session，并且进行参数配置
app.use(session({
    //防止篡改cookie，加密
    secret:settings.cookieSecret,
    //设置值
    key:settings.db,
    //cookie的生存周期
    cookie:{maxAge:1000*60*60*24*30},
    //将session的信息存储到数据库当中去.
    store: new MongoStore({
        //连接数据库当中的blog数据库
        url: 'mongodb://localhost/blog'
    }),
    //每次刷新的时候并不保存数据
    resave:false,
    //
    saveUninitialized:true
}));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

routes(app);
// app.use('/', index);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');//模板引擎，
});

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
    console.log('Express服务器正在监听端口： ' + app.get('port'));
});

module.exports = app;
