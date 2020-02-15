const auth = require('./auth')
const colors = require('colors')

function start () {
  auth(({ status, username, message }) => {
    const mail = require('./mail')
    if (status) {
      console.log('Log-in successfully.'.underline)
      console.log('Welcome', colors.green.bold(username))

      mail(username, () => {
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
