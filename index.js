const auth = require('./auth')

auth(({ status, username, message }) => {
  const mail = require('./mail')
  if (status) {
    mail(username)
  } else {
    console.log(message.red)
  }
})
