/**
 * Created by spray on 16-6-24.
 */
function getField(req, field) {
    var val = req.body;
    val =val[field];
    return val;
}

exports.required = function (field) {
    return function (req, res, next) {
        if (getField(req, field)) {
            next();
        } else {
            res.error(field + 'is required');
            res.redirect('back');
        }
    };
};

exports.lengthAbove = function (field, len) {
    return function (req, res, next) {
        if (getField(req, field).length > len) {
            next();
        } else {
            res.error(field + ' must have more than ' + len + ' characters');
            res.redirect('back');
        }
    };
};
