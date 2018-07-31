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

const logCallback = (status, json) => {

}

const logCount = (logString, count = 1) => {
  stathat.trackEZCount(
    stathatKey,
    logString,
    count,
    logCallback
  )
  console.log(`${Date()} stat: ${logString} count: ${count}`)
}

const logValue = (logString, value) => {
  stathat.trackEZValue(
    stathatKey,
    logString,
    count,
    logCallback
  )
}

const isIncrementStat = (line) => {
  return baseChecker(constants[process.argv.slice(2)[0]].INCREMENT, line)
}

const isTimingStat = (line) => {
  return baseChecker(constants[process.argv.slice(2)[0]].TIMING, line)
}

const isRequestStat = (line) => {
  return baseChecker(constants[process.argv.slice(2)[0]].REQUESTS, line)
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
  const statName = constants[process.argv.slice(2)[0]].INCREMENT.STATNAME(line)
  const count = constants[process.argv.slice(2)[0]].INCREMENT.COUNT(line)
  console.log('JEFF', statName, count)
  logCount(statName, count)
}

const logTimingStat = (line) => {

}

const logRequestStat = (line) => {
  logCount('page view')
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


// get running on DO droplet
