if (process.env.NODE_ENV !== 'production') {
     require('dotenv').config()
} 

const express = require('express')
const bcrypt= require('bcrypt')
const uuid = require('uuid').v4
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const initializePassport = require('./passport-config')
const methodOverride = require('method-override')

const users=[] 

initializePassport(passport, 
     (email)=>  users.find(user=> user.email === email),
     (id)=>  users.find(user=> user.id === id)  
)

const app = express()
app.use(express.urlencoded({extended: false}))
app.set('view-engine', 'ejs')
app.use(flash())
app.use(session({ 
     secret: process.env.SESSION_SECRET, 
     resave: false, 
     saveUninitialized: false
}))
app.use(methodOverride('_method'))

app.use(passport.initialize())
app.use(passport.session())

app.get('/', isLoggedIn,  (req, res)=> {
      res.render('index.ejs', {name: req.user.name})
})

app.get('/login', isNotLoggedIn,  (req, res)=> {
     res.render('login.ejs')
})

app.get('/register', isNotLoggedIn,  (req, res)=> {
     res.render('register.ejs')
})

app.post('/register',  isNotLoggedIn, async (req, res)=> {
     try{
          const {email, name, password} = req.body
          users.push({
             id: uuid(), 
             email, 
             name,
             password: await bcrypt.hash(password, 10) 
          })
          res.redirect('/login')
     }catch {
         res.redirect('/register')   
     }
})


app.post('/login',  isNotLoggedIn,passport.authenticate('local', {
     successRedirect: '/',
     failureRedirect: '/login',
     failureFlash: true
}))

app.delete('/logout', isLoggedIn,  (req,res)=> {
     req.logout(function(err) {
          if (err) { return next(err); }
          res.redirect('/login');
     });
})

app.listen(3000, ()=> {
     console.log('server is running')
})

function isLoggedIn(req, res, next) {
      if (req.isAuthenticated()) {
          return next()
      } else {
           res.redirect('/login')
      }
}

function isNotLoggedIn(req, res, next) {
     if (!req.isAuthenticated()) {
         return  next()
     } else {
          res.redirect('/')
     }
}
