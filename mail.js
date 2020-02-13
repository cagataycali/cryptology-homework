/* eslint-disable standard/no-callback-literal */
const colors = require('colors')
const inquirer = require('inquirer')
const Datastore = require('nedb')
const moment = require('moment')
const [userDB, mailDB] = [
  new Datastore({ filename: './user', autoload: true }),
  new Datastore({ filename: './db', autoload: true })
]

const showMailBox = username => {
  return new Promise((resolve, reject) => {
    // Find which mails send **to** me?
    mailDB.find({ to: username }, (err, mails) => {
      if (err) {
        reject(err)
      }
      resolve(mails)
    })
  })
}

const getOtherUsers = username => {
  return new Promise((resolve, reject) => {
    userDB.find({}, (err, users) => {
      if (err) {
        reject(err)
      }
      // Don't send yourself.
      users = users.filter(_user => _user.username !== username)
      resolve(users)
    })
  })
}

const askUser = users => {
  return new Promise(resolve => {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'username',
          message: 'Who do you want to send mail to?',
          choices: users.map(user => user.username)
        },
        {
          type: 'input',
          name: 'message',
          message: "What's your message?",
          validate: function (value) {
            if (value.trim().length > 0) {
              return true
            }

            return 'Please enter a message'
          }
        }
      ])
      .then(resolve)
  })
}

const run = username => {
  const questions = [
    {
      type: 'list',
      name: 'option',
      message: 'How can I help you?',
      choices: [
        {
          name: 'Show mailbox',
          value: 'mailbox'
        },
        {
          name: 'Send mail',
          value: 'send'
        },

        {
          name: 'Exit',
          value: 'exit'
        }

      ]
    }
  ]

  inquirer
    .prompt(questions)
    .then(async ({ option }) => {
      if (option === 'mailbox') {
        let mails = await showMailBox(username)
        if (mails.length === 0) {
          console.log('There\'s no mail for now.'.bold.green)
        } else {
          mails = mails.map(mail => {
            return {
              to: mail.to,
              from: mail.from || 'self',
              message: mail.message,
              date: moment(mail.date).fromNow() || moment(new Date()).fromNow()
            }
          })
          console.table(mails)
        }
        run(username)
      } else if (option === 'send') {
        const users = await getOtherUsers(username)
        if (users.length === 0) {
          console.log('There\'s no other users'.red)
          run(username)
        }
        const mail = await askUser(users)
        mailDB.insert({ from: username, to: mail.username, message: mail.message, date: new Date() }, (err, doc) => {
          if (err) {
            console.error(err)
          }
          console.log('Mail send successfully.'.green.bold.underlined)
          run(username)
        })
      }
    })
}

module.exports = run
