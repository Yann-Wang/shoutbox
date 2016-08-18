/**
 * Created by spray on 16-6-23.
 */
var User = require('../lib/user');

exports.form = function (req, res) {
    res.render('login', {title: 'Login'});
};

exports.submit = function (req, res, next) {
    var data = req.body;
    User.authenticate(data['user[name]'], data['user[pass]'], function (err, user) {
        if (err) return next(err);
        if (user) {

            //express-session中间件自动生成sid,将sid保存在cookie中，并返回给浏览器
            //但是下面的uid　会保存到redis数据库，　当对应sid的会话来请求时，　express-session中间件
            //会自动加载对应的uid到req.session对象
            req.session.uid = user.id;
            req.session.save();
            res.redirect('/');
            
            
        } else {
            res.error("Sorry! invalid credentials.");
            res.redirect('back');
        }
    });
};

exports.logout = function (req, res) {
    req.session.destroy(function (err) {
        if (err) throw err;
        res.redirect('/');
    });
};
