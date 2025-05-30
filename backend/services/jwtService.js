const jwt = require("jsonwebtoken");
const config = require("../config");

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.JWT_TOKEN, (err, decodedToken) => {
      if (err || !decodedToken) {
        return reject(err);
      }

      resolve(decodedToken);
    });
  });
}

function jwt_MW(req, res, next) {
  for (let route of config.PUBLIC_ROUTES) {
    if (req.url.startsWith(route)) {
      next();
      return;
    }
  }
  let token = req.query.token || req.headers.authorization;
  if (!token) {
    token = (req.form && req.form.token) || (req.body && req.body.token);
  }

  if (!token) {
    return res.sendError("userNotLogged", "Token is not provided");
  }
  verifyToken(token)
    .then((decodedToken) => {
      req.user = decodedToken;
      next();
    })
    .catch((err) => {
      console.log(err);
      res.sendError("userNotLogged", "Invalid auth token provided.");
    });
}

async function authenticate(user) {
  var newUser = {};
  newUser._id = user._id;
  newUser.role = user.role;
  newUser.username = user.username;
  newUser.mobile = user.mobile;

  delete newUser.password;
  const token = jwt.sign(newUser, config.JWT_TOKEN);
  return token;
}

module.exports = { jwt_MW, verifyToken, authenticate };
