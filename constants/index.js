const constants = {
  WSF: {
    PREFACE: '',
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
  MIGRATION: {
    PREFACE: '',
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
        const split = line.split(' ')
        return `${split[3]}.${split[4]}`
      },
      COUNT: (line) => {
        return 1
      }
    },
  },
  IDENTITY: {
    REQUESTS: {
      ENABLED: false,
      YES: [],
      NO: []
    },
    TIMING: {
      ENABLED: true,
      YES: ["'stats.timer;"],
      NO: [],
      STATNAME: (line) => {
        return `identityservice.timing.${line.split("'stats.timer; ")[1].split(' ')[0].replace(';', "'").replace("\'", "")}`
      },
      VALUE: (line) => {
        return Number(line.split("'stats.timer; ")[1].split(' ')[1].replace(';', "'").replace("\'", ""))
      }
    },
    INCREMENT: {
      ENABLED: true,
      YES: ["'stats.increment;"],
      NO: [],
      STATNAME: (line) => {
        const splitLine = line.split('INFO: ')[1]
        const baseStatName = splitLine.split("'message': ")[1].split(' ')[1].substring(2, splitLine.length).replace("\',);", '')
        const rawTagsDict = splitLine.split("'message': ")[1].split("tags_dict': ")[1]
        const tagsDict = JSON.parse(rawTagsDict.substring(0, rawTagsDict.length -3).replace(/'/g, '"'))
        const tagsDictKeys = Object.keys(tagsDict).join('.')
        return `identityservice.${baseStatName}.${tagsDictKeys}`
      },
      COUNT: (line) => {
        return 1
      }
    },
  }

}

module.exports = constants
