const auth = require('./auth')
const colors = require('colors')

function start () {
  auth(({ status, user, message }) => {
    const mail = require('./mail')
    if (status) {
      console.log(message.underline)
      console.log('Welcome', colors.green.bold(user.username))

      mail(user, () => {
        console.log('Logged out.'.underline)
        start()
      })
    } else {
      console.log(message.red)
      start()
    }
  })
}

start()
