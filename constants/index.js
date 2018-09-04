const constants = {
  WSF: {
    NAME: 'prod-webskyfit-prod',
    PREFACE: '',
    EMPTY_STAT_INTERVAL: 10,
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
        const split = line.split(' ')
        return split[3]
      },
      COUNT: (line) => {
        const split = line.split(' ')
        return Number(split[4]) || 1
      }
    },
    TIMING: {
      ENABLED: false,
      YES: [],
      NO: []
    }
  },
  IDENTITY: {
    NAME: 'staging-identityservice-staging',
    EMPTY_STAT_INTERVAL: 10,
    REQUESTS: {
      ENABLED: false,
      YES: [],
      NO: []
    },
    TIMING: {
      ENABLED: true,
      YES: ["'stats.timer;"],
      NO: ["ELB-HealthChecker"],
      STATNAME: (line) => {
        return `timing.identityservice.${line.split("'stats.timer; ")[1].split(' ')[0].replace(';', "'").replace("\'", "")}`
      },
      VALUE: (line) => {
        return Number(line.split("'stats.timer; ")[1].split(' ')[1].replace(';', "'").replace("\'", ""))
      }
    },
    INCREMENT: {
      ENABLED: true,
      YES: ["'stats.increment;"],
      NO: ["ELB-HealthChecker"],
      STATNAME: (line) => {
        const splitLine = line.substring(0, line.indexOf('\n')).split('INFO: ')[1]
        const baseStatName = splitLine.split("'message': ")[1].split(' ')[1].replace(/[^\w.]+/g, "");
        let rawTagsDict = splitLine.split("'message': ")[1].split("tags_dict': ")[1]
        let tagsDictKeys
        if (rawTagsDict) {
          rawTagsDict = rawTagsDict.substring(0, rawTagsDict.length - 3).replace(/'/g, '"')
          const tagsDict = JSON.parse(rawTagsDict)
          tagsDictKeys = Object.values(tagsDict).join('.')
        }
        return `identityservice.${baseStatName}.${tagsDictKeys}`
      },
      COUNT: (line) => {
        return 1
      }
    },
  },
  // MIGRATION: {
  //   PREFACE: '',
  //   REQUESTS: {
  //     ENABLED: false,
  //     YES: [],
  //     NO: []
  //   },
  //   TIMING: {
  //     ENABLED: false,
  //     YES: [],
  //     NO: []
  //   },
  //   INCREMENT: {
  //     ENABLED: true,
  //     YES: [
  //       'info:',
  //       'migrating',
  //       'user',
  //       'id:',
  //       'email:'
  //     ],
  //     NO: [],
  //     STATNAME: (line) => {
  //       const split = line.split(' ')
  //       return `${split[3]}.${split[4]}`
  //     },
  //     COUNT: (line) => {
  //       return 1
  //     }
  //   },
  // },
}

module.exports = constants
