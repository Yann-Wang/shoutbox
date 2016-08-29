var redis = require('redis');
var bcrypt = require('bcryptjs');
var db = redis.createClient(6379, '127.0.0.1');
db.on('error', function (err) {
    console.log('Error' + err);
});

module.exports = User;

function User(obj) {
    for (var key in obj) {
        this[key] = obj[key];
    }
    
}

User.prototype.save = function (fn) {
    if (this.id){
        this.update(fn);
    }else{
        var user = this;
        db.incr('user:ids', function (err, id) {
            if (err) return fn(err);
            user.id = id;
            user.hashPassword(function (err) {
                if (err) return fn(err);
                user.update(fn);
            });
            
        });
    }
    
};

User.prototype.update = function (fn) {
    var user = this;
    var id = user.id;
    db.set ('user:id:' + user.name, id, function (err) {
        if (err) return fn(err);
        //Multiple values in a hash can be set by supplying an object:
        db.hmset('user:' + id, user, function (err) {
            fn(err);
        });
    });
};


User.prototype.hashPassword = function (fn) {
    var user = this;
    bcrypt.genSalt(12, function (err, salt) {
        if (err) return fn(err);
        user.salt = salt;
        bcrypt.hash(user.pass, salt, function (err, hash) {
            if (err)  return fn(err);
            user.pass = hash;
            fn();

        });
    });
};

User.getByName = function (name, fn) {
    User.getId(name, function (err, id) {
        if (err) return fn(err);
        User.get(id, fn);
    });
};

User.getId = function (name, fn) {
    db.get('user:id:' + name, fn);
};

User.get = function (id, fn) {
    //The reply from an HGETALL command will be converted into a JavaScript Object
    // by node_redis.
    db.hgetall('user:' + id, function (err, user) {
        if (err) return fn(err);
        fn(null, new User(user));
    });
};

User.authenticate = function (name, pass, fn) {
    User.getByName(name, function (err, user) {
        if (err) return fn(err);
        if (!user.id) return fn();
        bcrypt.hash(pass, user.salt, function (err, hash) {
            if (err) return fn(err);
            if(hash == user.pass) return fn(null, user);
            fn();
        });
    });
};
