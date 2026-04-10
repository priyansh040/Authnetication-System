/**
 * src/middlewares/authMiddleware.js
 * * THE BOUNCER (AUTHENTICATION MIDDLEWARE):
 * This function intercepts requests to protected routes. It verifies the user's
 * JSON Web Token (JWT) to ensure they are logged in and their session hasn't expired.
 */

const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // 1. CHECK FOR THE AUTHORIZATION HEADER
  // It is an industry HTTP standard to send tokens in the headers like this:
  // Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR..."
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. EXTRACT THE TOKEN
      // Splits the string "Bearer <token>" into an array and grabs the 2nd item (the actual token)
      token = req.headers.authorization.split(" ")[1];

      // 3. CRYPTOGRAPHIC VERIFICATION
      // jwt.verify checks two things:
      // a) Was this token signed by OUR server? (using process.env.JWT_ACCESS_SECRET)
      // b) Has the 15-minute expiration time passed?
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // 4. IDENTIFY THE USER
      // The token payload contains the user's ID. We attach it directly to the 'req' object.
      // Because of this line, ANY route that uses this middleware can simply look at
      // 'req.user.userId' to know exactly who is making the request!
      req.user = decoded;

      // 5. GRANT ACCESS
      // 'next()' tells Express: "This request is clean, pass it to the next function (the controller)."
      next();
    } catch (error) {
      // If the token is fake, modified, or expired, jwt.verify automatically throws an error.
      res.status(401); // 401 = Unauthorized
      next(new Error("Not authorized: Token failed or expired"));
    }
  }

  // 6. MISSING TOKEN
  // If the loop finished and no token was ever found in the headers, block them.
  if (!token) {
    res.status(401);
    next(new Error("Not authorized: No token provided"));
  }
};

module.exports = { protect };
