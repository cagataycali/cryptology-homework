/* eslint-disable node/no-deprecated-api */

const crypto = require('crypto')
const assert = require('assert')

const CURVE_ALGORTHM = 'wap-wsg-idm-ecid-wtls11'

console.log('Elliptic Curve Algorithm: ' + CURVE_ALGORTHM)
console.log('\n')

// Generate Zoe's keys...
var zoe = crypto.createECDH(CURVE_ALGORTHM)
var zoeKey = Buffer.from('0401cd59789732ab14a10615644edd11c3b4734a158eacf3e6d2af8c1b5cdb013d1a918f30d222be8dae6a71c659f1f62974282b10b396d20b78801544', 'hex')

// Generating Joe's keys...
var joe = crypto.createECDH(CURVE_ALGORTHM)
var joeKey = Buffer.from('04004ebf13e23611ed745cd69dcffb40d9d1b09b09d324fc1fee5ae4be909c01f0a671500c8dce655bccf5845592ea407730c844d836b45c640817d780', 'hex')

// Exchange and generate secret...
var zoeSecret = zoe.computeSecret(joeKey)
var joeSecret = joe.computeSecret(zoeKey)

assert.strictEqual(zoeSecret.toString('hex'), joeSecret.toString('hex'))

console.log("Zoe's Public Key: " + zoe.getPublicKey('hex'))
console.log("Zoe's Private Key: " + zoe.getPrivateKey('hex'))

console.log('\n')

console.log("Joe's Public Key: " + joe.getPublicKey('hex'))
console.log("Joe's Private Key: " + joe.getPrivateKey('hex'))

console.log('\n')

zoeSecret = zoeSecret.toString('hex')
joeSecret = joeSecret.toString('hex')

console.log('Zoe secret: ' + zoeSecret)
console.log('Joe secret: ' + joeSecret)

console.log('\n')

// Using the generated shared Secrets to cipher/decipher messages between Zoe and Joe
var AES256 = 'aes256'

var zoeCipher = crypto.createCipher(AES256, zoeSecret)
var zoeDecipher = crypto.createDecipher(AES256, zoeSecret)

var joeCipher = crypto.createCipher(AES256, joeSecret)
var joeDecipher = crypto.createDecipher(AES256, joeSecret)

// Zoe ciphers a message for Joe
// zoe = user
// joe = to

var msg1 = "Hey Joe, I'm Zoe"
var eMsg1 = zoeCipher.update(msg1, 'utf8', 'hex')
eMsg1 += zoeCipher.final('hex')
console.log('Zoe says (clear): ' + msg1)
console.log('Zoe says (ciphered): ' + eMsg1)

console.log('\n')

// Joe deciphers Zoe's message
var dMsg1 = joeDecipher.update(eMsg1, 'hex', 'utf8')
dMsg1 += joeDecipher.final('utf8')
console.log('Joe receives (ciphered): ' + eMsg1)
console.log('Joe receives (deciphered): ' + dMsg1)

console.log('\n')

// Joe ciphers a message for Zoe
var msg2 = 'Hey Zoe, how are you doing?'
var eMsg2 = joeCipher.update(msg2, 'utf8', 'hex')
eMsg2 += joeCipher.final('hex')
console.log('Joe says (clear): ' + msg2)
console.log('Joe says (ciphered): ' + eMsg2)

console.log('\n')

// Zoe deciphers Joe's message
var dMsg2 = zoeDecipher.update(eMsg2, 'hex', 'utf8')
dMsg2 += zoeDecipher.final('utf8')
console.log('Zoe receives (ciphered): ' + eMsg2)
console.log('Zoe receives (deciphered): ' + dMsg2)
