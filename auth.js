/* eslint-disable standard/no-callback-literal */
const colors = require('colors')
const inquirer = require('inquirer')
const Datastore = require('nedb')
const { pbkdf2Sync, randomBytes, createECDH } = require('crypto')
const CURVE_ALGORTHM = 'wap-wsg-idm-ecid-wtls11'
const [userDB, mailDB] = [
  new Datastore({ filename: './user', autoload: true }),
  new Datastore({ filename: './db', autoload: true })
]

// Username must be uniq.
userDB.ensureIndex({ fieldName: 'username', unique: true })

const requireLetterAndNumber = value => {
  if (!(/\w/.test(value))) {
    return 'Password need to have at least a letter'
  } else if (!(/[A-Z]/.test(value))) {
    return 'Password need to have at least a uppercase letter'
  } else if (!(/[a-z]/.test(value))) {
    return 'Password need to have at least a lowercase letter'
  } else if (!(/\d/.test(value))) {
    return 'Password need to have at least a number'
  } else if (!(/\W/.test(value))) {
    return 'Password need to have at least a special char'
  } else if (value.trim().length < 8) {
    return 'Password need to have more than 8 character'
  }
  return true
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
    const username = answers.username.trim()
    const password = answers.password.trim()

    userDB.find({ username: username }, (err, users) => {
      if (err) {
        console.error(err)
      }
      const salt = randomBytes(128).toString('base64')
      const hash = (pbkdf2Sync(password, salt, 100000, 512, 'sha512')).toString('hex')
      // If the user does not exists.
      if (users.length === 0) {
        // Elliptic curve diffie-hellman.
        const ecdh = createECDH(CURVE_ALGORTHM)
        const key = ecdh.generateKeys()
        const public = (ecdh.getPublicKey()).toString('hex')
        const private = (ecdh.getPrivateKey()).toString('hex')

        userDB.insert({ username, password: hash, salt, key: key.toString('hex'), public, private, created: new Date() }, (err, doc) => {
          if (err) {
            console.error(err)
          }
          callback({ status: true, message: 'registered successfully.', username })
        })
      } else {
        const user = users[0]
        if (user.password === (pbkdf2Sync(password, user.salt, 100000, 512, 'sha512')).toString('hex')) {
          callback({ status: true, message: 'logged in successfully.', username })
        } else {
          callback({ status: false, message: 'Login failure, password is wrong', username })
        }
      }
    })
  })
}
