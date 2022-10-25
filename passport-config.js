const LocalStrategy = require('passport-local').Strategy

const bcrypt = require('bcrypt')

function initializePassport(passport, getUserByEmail, getUserById) {

   passport.use(
    new LocalStrategy(
        {usernameField: 'email'}, 
        async  (email, password, done)=> {
            try {
                 console.log('step1')
                const user = getUserByEmail(email)
                if (!user) {
                     return done(null, false,{message: 'No user with that email!'})
                }
                if (await bcrypt.compare(password, user.password)) {
                    console.log('step2')
                    return done(null, user)    
                } else {
                    console.log('step3')
                     return done (null, false, {message: 'Password is in correct'})
                }
            }catch (err) {
                console.log('step4')
                 return done(err)
            }    
        }
    )
   )

   passport.serializeUser((user,done)=> done(null, user.id))
   passport.deserializeUser((id,done)=>  {
    done(null, getUserById(id))
   })
}

module.exports= initializePassport