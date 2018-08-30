const axios = require('axios')
const config = require('./config')
const BASE_URL = process.argv.slice(2)[0] || 'http://connect2id.aaptiv.com'
const stathatKey = config.STATHAT.KEY
let C2ID_KEY
let STAT_QUEUE = []

function prompt(question) {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;

    stdin.resume();
    stdout.write(question);

    stdin.on('data', data => resolve(data.toString().trim()));
    stdin.on('error', err => reject(err));
  });
}

const flushStats = () => {
  console.log('STAT_QUEUE length', STAT_QUEUE.length)
  cachedQueue = STAT_QUEUE
  STAT_QUEUE = []
  if (cachedQueue.length > 0) {
    console.log(cachedQueue)
    data = {
      ezkey: stathatKey,
      data: cachedQueue
    }
    axios.post('http://api.stathat.com/ez', data, {
      'Content-Type': 'application/json'
    })
    .then(function (response) {
      const { data } = response
      console.log({data})
    })
    .catch(function (error) {
      console.log({error})
    })
  }
}

handleData = (data) => {
  for (let key in data['gauges']) {
    if (data['gauges'][key]['value'] != 0) {
      enqueueValueStat(`gauge.${key}`, data['gauges'][key]['value'])
    }
  }

  for (let key in data['histograms']) {
    if (data['histograms'][key]['mean'] != 0) {
      enqueueValueStat(`histogram.${key}`, data['histograms'][key]['mean'])
    }
  }

  for (let key in data['meters']) {
    if (data['meters'][key]['mean_rate'] != 0) {
      enqueueValueStat(`meter.${key}`, data['meters'][key]['mean_rate'])
    }
  }

  for (let key in data['timers']) {
    if (data['timers'][key]['mean'] != 0) {
      enqueueValueStat(`timer.${key}`, data['timers'][key]['mean'])
    }
  }

  flushStats()
}

const enqueueValueStat = (statName, value) => {
  stat = {
    stat: `c2id.${statName}`,
    value
  }
  STAT_QUEUE.push(stat)
}

const main = () => {
  axios.get(
    `${BASE_URL}/c2id/monitor/v1/metrics`,
    {
      headers: {
        Authorization: `Bearer ${C2ID_KEY}`
      }
    }
  )
    .then(response => {
      handleData(response.data)
    })
    .catch((error) => {
      console.log('error ' + error);
    });
}

prompt("c2id key ")
  .then((key) => {
    C2ID_KEY = key
    setInterval(main, 5000)
  })
