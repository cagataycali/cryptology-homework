/* eslint-disable standard/no-callback-literal */
const colors = require('colors')
const inquirer = require('inquirer')
const Datastore = require('nedb')
const crypto = require('crypto')
const [userDB, mailDB] = [
  new Datastore({ filename: './user', autoload: true }),
  new Datastore({ filename: './db', autoload: true })
]

// Username must be uniq.
userDB.ensureIndex({ fieldName: 'username', unique: true })

const requireLetterAndNumber = value => {
  return true
  //   if (!(/\w/.test(value))) {
  //     return 'Password need to have at least a letter'
  //   } else if (!(/\d/.test(value))) {
  //     return 'Password need to have at least a number'
  //   } else if (value.trim().length < 8) {
  //     return 'Password need to have more than 8 character'
  //   }
  //   return true
}
module.exports = callback => {
  const questions = [
    {
      type: 'input',
      name: 'username',
      message: "What's your username?",
      validate: value => {
        if (value.trim().length > 0) {
          return true
        }

        return 'Please enter a valid username'
      }
    },
    {
      type: 'password',
      name: 'password',
      message: "What's your password?",
      mask: '*',
      validate: requireLetterAndNumber
    }
  ]

  inquirer.prompt(questions).then(answers => {
    const { username, password } = answers
    userDB.find({ username: username }, (err, users) => {
      if (err) {
        console.error(err)
      }
      const hash = crypto.createHash('sha256').update(password).digest('base64')
      // If the user does not exists.
      if (users.length === 0) {
        userDB.insert({ username, password: hash }, (err, doc) => {
          if (err) {
            console.error(err)
          }
          callback({ status: true, message: 'registered successfully.', username })
        })
      } else {
        const user = users[0]
        if (user.password === hash) {
          callback({ status: true, message: 'logged in successfully.', username })
        } else {
          callback({ status: false, message: 'Login failure, password is wrong', username })
        }
      }
    })
  })
}
