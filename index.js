// const readline = require('readline')
const _ = require('lodash')
const stathat = require('stathat')
const axios = require('axios')
const stripAnsi = require('strip-ansi')

const sys = require('sys')
const spawn = require('child_process').spawn

const config = require('./config')
const constants = require('./constants/index')

const stathatKey = config.STATHAT.KEY
const STAT_FAMILY = constants[process.argv.slice(2)[0]]
let ACCEPTABLE_EMPTY_STAT_INTERVAL = 0

console.log({STAT_FAMILY})

let STAT_QUEUE = []

const flushStats = () => {
  console.log('STAT_QUEUE length', STAT_QUEUE.length)
  cachedQueue = STAT_QUEUE
  STAT_QUEUE = []
  let data = {}
  if (cachedQueue.length > 0) {
    console.log(cachedQueue)
    data = {
      ezkey: stathatKey,
      data: cachedQueue
    }
    axios.post('http://api.stathat.com/ez', data, {
      'Content-Type': 'application/json'
    })
  } else if (STAT_FAMILY.EMPTY_STAT_INTERVAL) {
    ACCEPTABLE_EMPTY_STAT_INTERVAL += 1
    console.log({ACCEPTABLE_EMPTY_STAT_INTERVAL})
    console.log({'STAT_FAMILY.EMPTY_STAT_INTERVAL': STAT_FAMILY.EMPTY_STAT_INTERVAL})
    if (ACCEPTABLE_EMPTY_STAT_INTERVAL >= STAT_FAMILY.EMPTY_STAT_INTERVAL) {
      ACCEPTABLE_EMPTY_STAT_INTERVAL = 0
      data.data = [{
        stat: `restart.${STAT_FAMILY.NAME}`,
        count: 1
      }]
      axios.post('http://api.stathat.com/ez', data, {
        'Content-Type': 'application/json'
      })
      .then(function (response) {
        const { data } = response
        console.log({data})
        // throw new Error('awslogs needs a restart')
        process.exit(1)
        child.kill()
      })
      .catch(function (error) {
        console.log({error})
        // throw new Error('awslogs needs a restart')
        process.exit(1)
        child.kill()
      })
    }
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
  try {
    const statName = STAT_FAMILY.INCREMENT.STATNAME(line)
    if (statName) {
      const count = STAT_FAMILY.INCREMENT.COUNT(line)
      enqueueCountStat(statName, count)
    }
  } catch (e) {
    console.log(e)
  }
}

const logTimingStat = (line) => {
  try {
    const statName = STAT_FAMILY.TIMING.STATNAME(line)
    const value = STAT_FAMILY.TIMING.VALUE(line)
    enqueueValueStat(statName, value)
  } catch (e) {
    console.log(e)
  }
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

const processLine = (line) => {
  if(isRequestStat(line)) {
    logRequestStat(line)
  } else if (isIncrementStat(line)) {
    logIncrementStat(line)
  } else if (isTimingStat(line)) {
    logTimingStat(line)
  }
}

const child = spawn('awslogs', ['get', STAT_FAMILY.NAME, 'ALL', '--watch'])

child.stdout.on('data', function (line) {
  line = stripAnsi(line.toString())
  processLine(line)
})

child.on('close', function (code) {
  console.log('child process closed with code ' + code)
  process.exit(1)
  child.kill()
})

child.on('error', function (code) {
  console.log('child process errored with code ' + code)
  process.exit(1)
  child.kill()
})

child.on('SIGQUIT', function() {
  console.log('child quit errored with code ' + code)
  process.exit(1)
  child.kill()
})

console.log({config})
console.log(stathatKey)

setInterval(flushStats, 5000)
