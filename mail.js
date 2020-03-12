/* eslint-disable camelcase */
/* eslint-disable node/no-deprecated-api */
/* eslint-disable standard/no-callback-literal */
const clear = require('clear')
const colors = require('colors')
const ora = require('ora')
const inquirer = require('inquirer')
const Datastore = require('nedb')
const moment = require('moment')
const crypto = require('crypto')
const loadingMails = ora('Loading mails\n')
const sendingMails = ora('Sending your super secret mail\n')
const [userDB, mailDB] = [
  new Datastore({ filename: './user', autoload: true }),
  new Datastore({ filename: './db', autoload: true })
]
const CURVE_ALGORTHM = 'secp256k1'
const AES256 = 'aes-256-gcm'

const generateHash = (message) => {
  const secret = 'cagataycali@!.'
  return crypto.createHmac('sha256', secret)
    .update(message)
    .digest('hex')
}

const isHashEqual = (message, hash) => {
  const secret = 'cagataycali@!.'
  return hash === crypto.createHmac('sha256', secret)
    .update(message)
    .digest('hex')
}

const encryptMessage = (user, to, message) => {
  // This scenario user is alice
  const alice = crypto.createECDH(CURVE_ALGORTHM)
  alice.generateKeys()
  alice.setPrivateKey(Buffer.from(user.private, 'base64'))

  // Bob is reciever to encrypted message
  const bob = crypto.createECDH(CURVE_ALGORTHM)
  bob.generateKeys()
  bob.setPrivateKey(Buffer.from(to.private, 'base64'))

  const aliceSharedKey = alice.computeSecret(to.public, 'base64', 'hex')
  const bobSharedKey = bob.computeSecret(user.public, 'base64', 'hex')

  if (aliceSharedKey !== bobSharedKey) {
    console.log('you are caught red handed :)'.red.bold)
    process.exit()
  }

  const IV = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    AES256,
    Buffer.from(aliceSharedKey, 'hex'),
    IV
  )

  let encrypted = cipher.update(message, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const auth_tag = cipher.getAuthTag().toString('hex')

  const payload = IV.toString('hex') + encrypted + auth_tag

  return Buffer.from(payload, 'hex').toString('base64')
}

const decryptMessage = (user, to, payload) => {
  // This scenario user is alice
  const alice = crypto.createECDH(CURVE_ALGORTHM)
  alice.generateKeys()
  alice.setPrivateKey(Buffer.from(user.private, 'base64'))

  // Bob is reciever to encrypted message
  const bob = crypto.createECDH(CURVE_ALGORTHM)
  bob.generateKeys()
  bob.setPrivateKey(Buffer.from(to.private, 'base64'))

  const aliceSharedKey = alice.computeSecret(to.public, 'base64', 'hex')
  const bobSharedKey = bob.computeSecret(user.public, 'base64', 'hex')

  if (aliceSharedKey !== bobSharedKey) {
    console.log('you are caught red handed :)'.red.bold)
    process.exit()
  }

  const bob_payload = Buffer.from(payload, 'base64').toString('hex')

  const bob_iv = bob_payload.substr(0, 32)
  const bob_encrypted = bob_payload.substr(32, bob_payload.length - 32 - 32)
  const bob_auth_tag = bob_payload.substr(bob_payload.length - 32, 32)
  try {
    const decipher = crypto.createDecipheriv(
      AES256,
      Buffer.from(bobSharedKey, 'hex'),
      Buffer.from(bob_iv, 'hex')
    )

    decipher.setAuthTag(Buffer.from(bob_auth_tag, 'hex'))

    let decrypted = decipher.update(bob_encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.log(error.message)
    return ''
  }
}

const getUser = username => {
  return new Promise((resolve, reject) => {
    userDB.find({ username }, (err, users) => {
      if (err) {
        reject(err)
      }
      resolve(users[0])
    })
  })
}

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

const run = (user, callback) => {
  const { username } = user
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
        loadingMails.start()
        let mails = await showMailBox(username)

        if (mails.length === 0) {
          loadingMails.fail('There\'s no mail for now.')
          loadingMails.stop()
          return run(user, callback)
        } else {
          mails = mails.map(async mail => {
            const message = mail.message

            // Get the sender data.
            const sender = await getUser(mail.from)
            const decryptedMessage = decryptMessage(user, sender, message)

            return {
              to: mail.to,
              from: mail.from,
              message: decryptedMessage,
              date: moment(mail.date).fromNow() || moment(new Date()).fromNow(),
              isHashValid: isHashEqual(decryptedMessage, mail.hash)
            }
          })

          Promise.all(mails).then((data) => {
            loadingMails.text = 'Mails gathered, will be decrypted...'
            setTimeout(() => {
              loadingMails.text = 'Mails decrypted succesfully.\n'
              loadingMails.stop()
              console.log('-'.repeat(100).rainbow)
              console.table(data)
              console.log('-'.repeat(100).rainbow)
              run(user, callback)
            }, 1000 * 2)
          })
        }
      } else if (option === 'send') {
        const users = await getOtherUsers(username)

        if (!users || users.length === 0) {
          console.log('There\'s no other users'.red)
          return run(user, callback)
        }
        const mail = await askUser(users)
        sendingMails.start()
        sendingMails.text = 'Encrypting your message...'
        const hash = generateHash(mail.message)
        const message = encryptMessage(user, users.find(user => user.username === mail.username), mail.message, true)
        sendingMails.text = 'Encrypting successfully...'
        sendingMails.succeed(`Your message is now only read by ${colors.green.underline.bold(mail.username)}.`)
        sendingMails.info('Sending...')
        mailDB.insert({ from: username, to: mail.username, message, date: new Date(), hash }, (err, doc) => {
          if (err) {
            sendingMails.fail('Mail didn\'t sended.')
            sendingMails.stop()
          } else {
            // Just show loading for secure looks UX.
            setTimeout(() => {
              sendingMails.succeed(`Mail sent to ${colors.green.underline.bold(mail.username)}.`)
              sendingMails.stop()
              run(user, callback)
            }, 1000 * 2)
          }
        })
      } else {
        callback()
      }
    })
}

module.exports = run
