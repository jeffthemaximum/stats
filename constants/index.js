const constants = {
  WSF: {
    REQUESTS: {
      ENABLED: true,
      YES: [
        '"GET',
      ],
      NO: [
        'AdsBot-Google',
        'ELB-HealthChecker',
        '/api'
      ]
    },

    INCREMENT: {
      ENABLED: true,
      YES: [
        'serverStatLoggingService.increment'
      ],
      NO: [],
      STATNAME: (line) => {
        split = line.split(' ')
        return split[3]
      },
      COUNT: (line) => {
        split = line.split(' ')
        return Number(split[4]) || 1
      }
    },
    TIMING: {
      ENABLED: false,
      YES: [],
      NO: []
    }
  },
  MIGRATION: {
    REQUESTS: {
      ENABLED: false,
      YES: [],
      NO: []
    },
    TIMING: {
      ENABLED: false,
      YES: [],
      NO: []
    },
    INCREMENT: {
      ENABLED: true,
      YES: [
        'info:',
        'migrating',
        'user',
        'id:',
        'email:'
      ],
      NO: [],
      STATNAME: (line) => {
        split = line.split(' ')
        return `${split[3]}.${split[4]}`
      },
      COUNT: (line) => {
        return 1
      }
    },
  }

}

module.exports = constants
