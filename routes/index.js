//登录和注册需要的User类
var User = require('../models/User');
//连接数据库
var mongodb = require('../models/db');
//发表需要的Post类
var Post = require('../models/Post');
//引入留言需要的Comment类
var Comment = require('../models/Comment');
//需要引入一个加密的模块
var crypto = require('crypto');
//引入multer插件
var multer  = require('multer');
//新的使用方法配置multer
var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './public/images')
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
});
var upload = multer({
    storage: storage
});


//如果没有登录，是无法访问发表和退出页面的
function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录!');
        res.redirect('/login');
    }
    next();
}
//如果登录了，是无法访问登录和注册页面的
function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录!');
        res.redirect('back');//返回之前的页面
    }
    next();
}

module.exports = function (app) {

    //首页的路由
    // app.get("/",function (req, res) {
    //     Post.getAll(null,function (err, posts) {
    //         if (err){
    //             posts=[]
    //         }
    //         res.render("index",{
    //             title:"首页",
    //             user:req.session.user,
    //             posts: posts,
    //             success: req.flash('success').toString(),
    //             error: req.flash('error').toString()
    //         })
    //     })
    //     // res.render("index",{
    //     //     title:"首页",
    //     //     user:req.session.user,
    //     //     success:req.flash('success').toString(),
    //     //     error:req.flash('error').toString()
    //     // })
    //
    // })修改以上首页路由如下，实现分页功能
    app.get('/', function (req, res) {
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = parseInt(req.query.p) || 1;
        //查询并返回第 page 页的 10 篇文章
        Post.getTen(null, page, function (err, posts, total) {
            if (err) {
                posts = [];
            }
            console.log(total)
            res.render('index', {
                title: '主页',
                posts: posts,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 10 + posts.length) == total,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString(),
                total:Math.ceil(total/10)
            });
        });
    });

    //注册页面路由
    // app.get("/reg",checkNotLogin) 可改为以下的方式
    app.get("/reg",checkNotLogin,function (req, res) {
        res.render("reg",{
            title:"注册",
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    app.post("/reg",function (req, res) {
        //1，收集数据
        var name = req.body.name;
        var password = req.body.password;
        var password_re = req.body.password_re;
        // console.log(password,password_re)
        //2,判断一下两次密码输入是否一致
        if (password !== password_re){
            req.flash("error","两次密码不一样");
            // console.log("密码test")
            return res.redirect("/reg");//重定向到注册页面
        }

        //3，密码加密
        var md5 = crypto.createHash("md5")

        var password = md5.update(req.body.password).digest("hex");
        //4,整理到一个对象中去
        var newUser = new User({
            name:name,
            password:password,
            email:req.body.email
        })
        //5,检查用户名是否被占用
        User.get(newUser.name,function (err, user) {
            // console.log(user)
            if(err){
                req.flash("error",err);
                return res.redirect("/reg");
            }
            if(user){
                req.flash("error","用户名被占用");
                return res.redirect("/reg");
            }
            //6,把数据存放到数据库里面去
            newUser.save(function (err,user) {
                if(err){
                    req.flash("error",err)
                    return res.redirect("/reg")
                }
                req.session.user = user;
                req.flash("success","注册成功")
                return res.redirect("/login")
            })
        })
    })

    //登陆页面的路由
    app.get("/reg",checkNotLogin)
    app.get("/login",function (req, res) {
        res.render("login",{
            title:"登陆",
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    app.post("/login",function (req, res) {
        var md5 = crypto.createHash("md5")
        var password = md5.update(req.body.password).digest("hex");//wt
        //检查用户名是否存在
        User.get(req.body.name,function (err, user) {
            //有错误输出
            if(err){
                req.flash("error",err)
                return res.redirect("/login");
            }
            //如果用户名不存在
            if(!user){
                req.flash("error","用户名不存在")
                return res.redirect("/reg")
            }
            //检查密码是否一致
            // console.log(user.password)//数据库保存的密码
            // console.log(password)//输入的密码
            if(user.password !== password){
                req.flash("error","密码错误1111");
                return res.redirect("/login");
            }
            //都匹配之后，将用户的信息存入session
            req.session.user = user;
            req.flash("success","登陆成功");
            res.redirect("/");
        })
    })

    //退出页面的路由
    app.get("/reg",checkLogin)
    app.get("/logout",function (req, res) {
        req.session.user = null;
        req.flash('success', '登出成功!');
        res.redirect('/');//登出成功后跳转到主页
    })

    //发表页面的路由
    app.get("/post",checkLogin);
    app.get("/post",function (req,res) {
        res.render("post",{
            title:"登陆",
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //发表的行为
    app.post("/post",function (req,res) {
        //获取当前登录的用户名
        var currentUser = req.session.user
        var post = new Post(currentUser.name, req.body.title, req.body.post);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            req.flash('success', '发布成功!');
            res.redirect('/');//发表成功跳转到主页
        });
    })

    //上传页面的路由
    app.get('/upload', checkLogin);
    app.get('/upload', function (req, res) {
        res.render('upload', {
            title: '文件上传',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    //上传的行为
    app.post('/upload', checkLogin);
    //upload.array('field1', 5) name为field1的input，一次最多上传5张
    app.post('/upload', upload.array('field1', 5), function (req, res) {
        req.flash('success', '文件上传成功!');
        res.redirect('/upload');
    });

    //查看用户所有文章的路由
    app.get('/u/:name', function (req, res) {
        //添加代码实现分页
        var page = parseInt(req.query.p)||1;
        //检查用户是否存在
        //动态路由，用params
        User.get(req.params.name, function (err, user) {
            if (!user) {
                req.flash('error', '用户不存在!');
                return res.redirect('/');//用户不存在则跳转到主页
            }
            //查询并返回该用户的所有文章
            // Post.getAll(user.name, function (err, posts) {
            //     if (err) {
            //         req.flash('error', err);
            //         return res.redirect('/');
            //     }
            //     res.render('user', {
            //         title: user.name,
            //         posts: posts,
            //         user : req.session.user,
            //         success : req.flash('success').toString(),
            //         error : req.flash('error').toString()
            //     });
            // });
            //查询并返回该用户第 page 页的 10 篇文章
            Post.getTen(user.name, page, function (err, posts, total) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * 10 + posts.length) == total,
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                });
            });
        });
    });

    //一篇文章详情页面的路由
    app.get('/u/:name/:minute/:title', function (req, res) {
        Post.getOne(req.params.name, req.params.minute, req.params.title, function (err, post) {
            if (err) {
                req.flash('error', "111111111111");
                return res.redirect('/');
            }
            res.render('article', {
                title: "文章详情页面",
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    //增加留言功能的路由
    app.post('/comment/:name/:minute/:title', function (req, res) {
        var date = new Date(),
            time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                   date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        var comment = {
            name: req.body.name,
            time: time,
            content: req.body.content
        };
        var newComment = new Comment(req.params.name, req.params.minute, req.params.title, comment);
        newComment.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '留言成功!');
            res.redirect('back');
        });
    });
   // 注意：这里我们使用 res.redirect('back'); ，即留言成功后返回到该文章页。

    //编辑页面的路由
    app.get('/edit/:name/:minute/:title', checkLogin);
    app.get('/edit/:name/:minute/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.edit(currentUser.name, req.params.minute, req.params.title, function (err, post) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            res.render('edit', {
                title: '编辑',
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });

    //编辑页面的行为（提交）
    //最后添加表单提交的处理
    app.post('/edit/:name/:minute/:title', checkLogin);
    app.post('/edit/:name/:minute/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.update(currentUser.name, req.params.minute, req.params.title, req.body.post, function (err) {
            var url = encodeURI('/u/' + req.params.name + '/' + req.params.minute + '/' + req.params.title);
            if (err) {
                req.flash('error', err);
                return res.redirect(url);//出错！返回文章页
            }
            req.flash('success', '修改成功!');
            res.redirect(url);//成功！返回文章页
        });
    });

    //删除文章的路由
    app.get('/remove/:name/:minute/:title', checkLogin);
    app.get('/remove/:name/:minute/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.remove(currentUser.name, req.params.minute, req.params.title, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '删除成功!');
            res.redirect('/');
        });
    });

    //查询文章存档的路由
    app.get('/archive', function (req, res) {
        Post.getArchive(function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('archive', {
                title: '存档',
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
}
