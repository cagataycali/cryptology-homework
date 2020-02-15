/* eslint-disable standard/no-callback-literal */
const clear = require('clear')
const colors = require('colors')
const inquirer = require('inquirer')
const Datastore = require('nedb')
const { pbkdf2Sync, randomBytes, createECDH } = require('crypto')
const CURVE_ALGORTHM = 'secp256k1'
const ora = require('ora');
const spinner = ora('Authenticating\n')
const [userDB, mailDB] = [
  new Datastore({ filename: './user', autoload: true }),
  new Datastore({ filename: './db', autoload: true })
]

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

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

  inquirer.prompt(questions).then(async answers => {
    spinner.start()
    await sleep(300)
    spinner.color = 'yellow';
    const username = answers.username.trim()
    const password = answers.password.trim()

    userDB.find({ username: username }, async (err, users) => {
      if (err) {
        console.error(err)
      }
      spinner.color = 'red';
      await sleep(300)
      const salt = randomBytes(128).toString('base64')
      const hash = (pbkdf2Sync(password, salt, 100000, 512, 'sha512')).toString('hex')
      spinner.color = 'blue';
      await sleep(300)
      // If the user does not exists.
      if (users.length === 0) {
        // Elliptic curve diffie-hellman.
        const ecdh = createECDH(CURVE_ALGORTHM)
        const key = ecdh.generateKeys()
        const public = (ecdh.getPublicKey()).toString('base64')
        const private = (ecdh.getPrivateKey()).toString('base64')

        userDB.insert({ username, password: hash, salt, public, private, created: new Date() }, (err, doc) => {
          if (err) {
            console.error(err)
          }
          clear()
          spinner.stop()
          callback({ status: true, message: 'registered successfully.', user: {private, public, username} })
        })
      } else {
        const user = users[0]
        if (user.password === (pbkdf2Sync(password, user.salt, 100000, 512, 'sha512')).toString('hex')) {
          spinner.stop()
          callback({ status: true, message: 'logged in successfully.', user: { private: user.private, public: user.public, username: user.username } })
        } else {
          spinner.stop()
          callback({ status: false, message: 'Login failure, password is wrong', username })
        }
      }
    })
  })
}
