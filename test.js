const { sendMail } = require('./mail')
const os = require('os')
let val = os.freemem() + (new Date()).valueOf()
// Prototyping for mock
const user = {
  private: 'P6PJLbMcgaeqqvYsgLWMcpKkBfJ+ukfjuCne8buNyjM=',
  public: 'BNwLBBHb2dmjczDlBjiQ5iJOQ5MeXCUofDhJ6U0zmH+tNE+r5W50ihNvOgHGHyUvFN18jcwlgob0jRbNhDV7f7A=',
  username: 'cagatay'
}
const users = [
  {
    username: 'test',
    password: '936597be8e37791ee010793bfcdb2a46ad4fe0413ffd4e9d023126084d08b2c3aeafc9d0953ad158dc95eccdbf7dbf64178fd5006b6a7d0adac4015de8d4903148bd793aa330f2a129a30446e4596359c60a56ca211de63fed7f418b60d7b3becb1f63ffddb61dcaf97a964e19d658322c98e03612cdde1557f22ee0ff87d2290fe2ea87735e4d24de1cfb81766312cfb994b82684288c7376445c9fe58e36fe04062e14e9a935572feb3d9ce4ee9423b6599790da01d9314b74b0b3f4c0cd908d35506ac99e9c9eaccbe1abb9ba01632fd254dd8c5a1150243807a974e403915144ba98881f50ecbbb14fefc4e45d87de85368878b277d7b710174f2ebcff9d59af0bfec40d321e4da508eb6e0bc2055546b1079b10a38cd301614e685d99a1d5bc0f05a5d397ce7547d6f9b00d9d910096d8f75b90c0e82a46072b8a1af00ad9b0a1a490722912303b00bc78b23cba56e330766b542bc353276b4cdff4d01a2273290cf3f9a92f041a5bc2ac61f8824c5579cd6987a889877ae1a1615766640680d029a8b28c6758dafe9c332cc819746876bfa3c00aa5523cf1ac70cbf1ff19329f4a619c7fdf8037405dc6264e7900d26bb2b0c80d1fb0bd632e07de5d837a45737fc4d7f7e4f63e56cb97b0c84807ce347635d93016293ab2f015f864cc64fff82e982f94537abe525178fb1f366ab60259df7fd60d22d5a7849f8a6a59',
    salt: 'Qx5sRWUAdhkuVELdd1Y1hpGWEPmRsZ8GhMVGr4/QDf7ACcgANm9r3oZ81jccl2KaJCh91kMA2oSTtOx5oN1JFrYnhcUETVqtQIg7QIVsmyLvsk7gbxD5wMbWIl+XLC77ctD1BkVdCmZs+2p4Vwq1pRoA2MuKPRdvKVOM3Da7La0=',
    public: 'BDTbujQlZb/JAktQIl8VHIVGxzS3bzolHLSS5ty1GTCI5n+Tmli43dpJPSieAhln8NLLjZYT17KE4OY67YvNwSg=',
    private: '84hNqK1AHhIZDpSzcxYviJyDNsaSCoqltE9DWsCtsxI=',
    created: '2020-03-12T15: 00:43.815Z',
    _id: 'OHXz6oXtFDyv91RT'
  }
]

const mail = { username: 'test', message: 'selam' }

// Example input of 100 words source; http://www.100wordstory.org/the-quiet-sadism-of-the-powerless/
const input = 'She woke to news of another stalemate, more children dying on the border, mounting humanitarian crises overseas, and a small mass in her breast. She made her tea, took deep breaths, cried, and set about her day. Friends and colleagues wanted to argue politics, climate change, gun control, and if we were entering the apocalypse. But she stayed silent, swallowing her corporeal fears, not wanting to fixate or spill more pain. Later, she noticed a spider, tiny and black, crawling along the sink. She paused, inhaled, then swiftly, fatally, brushed its body away, too small to pinch to its death.'
const inputAsArray = input.replace(/[^a-z0-9+]+/gi, '+').replace(/\(.+?\)/g, '').split('+') // Remove non alphanumerics. Convert to array.

// By ./c2
const random = (input) => {
  val += os.freemem() + (new Date()).valueOf()
  return input[(val) % input.length]
}

const run = (input, i = 0, result = [], cb) => {
  if (i < input.length - 1) {
    mail.message = input[i]
    sendMail(user, users, mail, (data) => {
      data.original = input[i]
      result.push(data)
      run(input, ++i, result, cb)
    })
  } else {
    cb(result)
  }
}

run(new Array(6).fill(null).map(() => random(inputAsArray)), 0, [], console.log)
