const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach the user payload to the request
        next(); // Proceed to the next middleware/function
    } catch (error) {
        res.status(400).send('Invalid Token');
    }
}

function verifyRole(roles) {
    return function(req, res, next) {
        const token = req.header('Authorization');
        if (!token) return res.status(401).send('Access Denied');

        try {
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            req.user = verified;
            if (!roles.includes(req.user.role)) {
                return res.status(403).send('You do not have permission to perform this action');
            }
            next();
        } catch (error) {
            res.status(400).send('Invalid Token');
        }
    };
}

function updateLastAction(req, res, next) {
    const token = req.header('Authorization').replace('Bearer ', '');
    User.findOneAndUpdate({"tokens.token": token}, {"$set": {"tokens.$.lastAction": new Date()}}, function(err, user) {
        if (err) {
            return res.status(500).send();
        }
        next();
    });
}

module.exports = { verifyToken, verifyRole, updateLastAction };
