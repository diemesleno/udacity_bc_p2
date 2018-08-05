const level = require('level')

/*
 - Class to model database
*/
class Database {
  constructor (data) {
    this.chainDB = './chaindata',
    this.db = level(this.chainDB)
  }
}

module.exports = Database