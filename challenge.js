/* eslint-disable standard/no-callback-literal */
const inquirer = require('inquirer')

const ask = async () => {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'question',
      message: 'Choose one of secret question',
      choices: [
        'Your first pet name',
        'Your grandma name',
        'Your mothers hometown',
        'Your favorite color'
      ]
    },
    {
      type: 'password',
      name: 'answer',
      message: 'Write down to your answer'
    }
  ])
}

module.exports = ask
