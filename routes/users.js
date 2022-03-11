var express = require('express');
var router = express.Router();
var mysql = require('mysql2');
var models = require('../models');
var passport = require('../services/passport');



router.get('/signup', function(req, res, next) {
     res.render('signup');
   });
/*USER SIGNUP /users/signup */
router.post('/signup', function(req, res, next) {
  models.users
    .findOrCreate({
      where: {
        Username: req.body.username
      },
      defaults: {
        FirstName: req.body.firstName,
        LastName: req.body.lastName,
        Email: req.body.email,
        Password: req.body.password
      }
    })
    .spread(function(result, created) {
      if (created) {
        res.redirect('login');
      } else {
        res.send('This user already exists');
      }
    });
});

/*USER LOGIN /users/login */
router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/users/login'
  }),
  function (req, res, next) {
    res.redirect('profile/');
});
/* LIST OF USERS ADMIN /users */
router.get('/', function (req, res, next){
  if (req.user && req.user.Admin){
models.users.findAll({where:{Deleted:false}})
.then(usersFound =>{
  res.render('users', {
    users : usersFound
  })
})
  }else{
    res.redirect('unauthorized')
  }
});

/* USER PROFILE /users/profile */
router.get('/profile', function (req, res, next) {
  if (req.user) {
    models.users
      .findByPk(parseInt(req.user.UserId))
      .then(user => {
        if (user) {
          res.render('profile', {
            FirstName: user.FirstName,
            LastName: user.LastName,
            Email: user.Email,
            Username: user.Username,
          });
        } else {
          res.send('User not found');
        }
      });
  } else {
    res.redirect('login');
  }
});
/* SPECIFIC USER ADMIN /users/:id */
router.get('/:id', function (req, res, next){
  if (req.user && req.user.Admin){
    models.users.findOne({
      where:{UserId: parseInt(req.params.id)}
    }) 
    .then(user => {
      if (user) {
        res.render('user', {
          users : user
        });
      } else {
        res.send('User not found');
      }
  });
} else {
  res.send('unauthorized');
}
});

/* DELETE USER ADMIN /users/:id */
router.put("/admin/editUser/:id", function(req, res) {
  const id = parseInt(req.params.id);

    models.users.update({
      Deleted: true
  }, {
    where: {
      UserId: id
    }
  }).then(response  => {
    res.json(response)
  }
  )
  
})

   
   

module.exports = router;
