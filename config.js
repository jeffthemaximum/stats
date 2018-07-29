let config = {
  STATHAT: {
    KEY: process.env.STATHAT_KEY
  }
}

try {
  config = require('./config.local')
}
catch (err) {
  // Do nothing
}

module.exports = config
