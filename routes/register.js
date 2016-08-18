/**
 * Created by spray on 16-6-23.
 */
var User = require('../lib/user');

exports.form = function (req, res) {
    res.render('register', {title: 'Register'});
}

exports.submit = function (req, res, next) {
    var data = req.body;
    User.getByName(data['user[name]'], function (err, user) {
        if (err) return next(err);
        
        //redis will default it
        if (user.id) {
            res.error("Username already taken!");
            res.redirect('back');
        } else {
            user = new User({
                name: data['user[name]'],
                pass: data['user[pass]']
            });
            
            user.save(function (err) {
                if (err) return next(err);
                req.session.uid = user.id;
                res.redirect('/');
            });
        }
    });
};
