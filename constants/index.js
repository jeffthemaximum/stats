const constants = {
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
    NO: []
  },
  TIMING: {
    ENABLED: false,
    YES: [],
    NO: []
  },
}

module.exports = constants
