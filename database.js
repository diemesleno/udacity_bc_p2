const level = require('level')

/*
 - Class to model database
*/
class Database {
  constructor (data) {
    this.chainDB = './chaindata',
    this.db = level(this.chainDB)
  }

  /*
   - Function to add a block inside the database.
  */
  addBlockToDB(key, value) {
    return new Promise((resolve, reject) => {
      this.db.put(key, value, (error) => {
        if (error) {
          reject(error)
        }

        console.log(`Added block #${key}`)
        resolve(`Added block #${key}`)
      })
    })
  }

  /*
   - Function to get a block inside the database by its key (block height).
  */
  getBlockFromDB(key) {
    return new Promise((resolve, reject) => {
      this.db.get(key, (error, value) => {
        if (error) {
          reject(error)
        }
        resolve(value)
      })
    })
  }

  /*
   - Function to get the block height from database.
  */
  getBlockHeightFromDB() {
    return new Promise((resolve, reject) => {
      let height = -1

      this.db.createReadStream().on('data', (data) => {
        height++
      }).on('error', (error) => {
        reject(error)
      }).on('close', () => {
        resolve(height)
      })
    })
  }
}

module.exports = Database