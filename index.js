const readline = require('readline')
const _ = require('lodash')
const stathat = require('stathat')
stathat.useHTTPS = true

const config = require('./config')
const constants = require('./constants/index')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
})

const stathatKey = config.STATHAT.KEY
const STAT_FAMILY = constants[process.argv.slice(2)[0]]
let STAT_QUEUE = []

const logCallback = (status, json) => {
  console.log({status})
  console.log({json})
}

const flushStats = () => {
  console.log('STAT_QUEUE length', STAT_QUEUE.length)
  cachedQueue = STAT_QUEUE
  STAT_QUEUE = []
  if (cachedQueue.length > 0) {
    console.log(cachedQueue)
    stathat._postRequest(
      '/ez',
      {
        ezkey: stathatKey,
        data: cachedQueue
      },
      logCallback
    )
  }
}

const isIncrementStat = (line) => {
  return baseChecker(STAT_FAMILY.INCREMENT, line)
}

const isTimingStat = (line) => {
  return baseChecker(STAT_FAMILY.TIMING, line)
}

const isRequestStat = (line) => {
  return baseChecker(STAT_FAMILY.REQUESTS, line)
}

const baseChecker = (constantType, line) => {
  const isEnabled = constantType.ENABLED

  if (!isEnabled) {
    return false
  }

  const split = line.split(' ')

  const expectedYesses = constantType.YES.length
  const expectedNos = constantType.NO.length

  let yesses = 0
  let nos = 0

  for (let expectedYes of constantType.YES) {
    for (let str of split) {
      if (str.includes(expectedYes)) {
        yesses += 1
      }
    }
  }

  for (let expectedNo of constantType.NO) {
    for (let str of split) {
      if (str.includes(expectedNo)) {
        nos += 1
      }
    }
  }

  return (yesses === expectedYesses) && (nos === 0)
}

const logIncrementStat = (line) => {
  split = line.split(' ')
  const statName = STAT_FAMILY.INCREMENT.STATNAME(line)
  const count = STAT_FAMILY.INCREMENT.COUNT(line)
  enqueueCountStat(statName, count)
}

const logTimingStat = (line) => {

}

const logRequestStat = (line) => {
  enqueueCountStat('page view')
}

const enqueueCountStat = (stat, count = 1) => {
  stat = {
    stat,
    count
  }
  STAT_QUEUE.push(stat)
}

const enqueueValueStat = (stat, value) => {
  stat = {
    stat,
    value
  }
  STAT_QUEUE.push(stat)
}


rl.on('line', (line) => {
  if(isRequestStat(line)) {
    logRequestStat(line)
  } else if (isIncrementStat(line)) {
    logIncrementStat(line)
  }
})

console.log({config})
console.log(stathatKey)

setInterval(flushStats, 5000)

// get running on DO droplet
