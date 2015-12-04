var express = require('express');

var routes = function(User) {
  var userRouter = express.Router();

  var userController = require('./userController')(User);
  userRouter.route('/signin')
    .post(userController.signin);

  userRouter.route('/signup')
    .post(userController.signup);

  userRouter.route('/signedin')
    .get(userController.checkAuth);



  // lets setup some middleware for the users:
  
  // this tells our router to USE this middleware before each call to /userId
  userRouter.use('/:userId', function (req, res, next) {
    // this is our own custom middleware
    // we need next to tell this middleware to keep going
    
    // not that the the route has a colon, this makes it a wildcard
    // for userIds
    
    // now lets look for a user by that ID
    User.findById(req.params.userId, function (err, user) {
      if (err) {
        res.status(500);
        res.send(err);
        //res.end();
      }
      else if (user) { // if that userId is there
        req.user = user; // set req.user to user
        next();           // now our request object has a user property on it
                          // because we put it there in this middleware!
      }
      else{
        res.status(404);
        res.send('No User Found');
      }
    });
  });
  // go to setup the routing:
  userRouter.route('/:userId')
    /// use callback because of next() in middleware:
    .get(function (req, res) {
      // all the middleware could be right here too, but its going to be
      // repeated a bunch so that why we abstracted it away.
      // all we need here now is:
      res.json(req.user); 
    })
    .put(function (req, res) {
      req.user.shows = req.body.shows;
      req.user.save(function (err) {
        if (err) {
          console.log(err);
        } else {
          res.json(req.user);
          console.log(req.user.shows, 'this is the shows');
          console.log(req.user);
        }
      });
     
    });
// we should be able to grab specific userModels now, based on the id
// we can edit the User Schema to have an object that holds shows
// ok so how do we add to that object? like adding episodes to watch later?
  userRouter.route('/:userId')
   .patch(function (req, res){
    // middleware sets the user to req.user
    // lets say we now have the "show" object in the user schema:
    // all we have to do is add the show to that userId
    //req.user.shows is the current state of the show obj
    // we need to add to it, could use underscore, or even a patch/ patch is another alternative to 
    // get/post/put/delete ...etc, there are a bunch
    // patch just updates objects put changed them, not sure which to use here
      
      for (var prop in req.body) {
        // this might change user data in an unwanted way, not sure about this approach
        // maybe we just post to the userID
        // currentShows.push(req.body[prop]);
        // req.user[prop] = req.body[prop];
        // req.user.shows = currentShows;
        req.user.shows.push(req.body[prop]);
      }
      req.user.save(function (err) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.json(req.user);
        }
      });

  });
  return userRouter;
};


module.exports = routes;