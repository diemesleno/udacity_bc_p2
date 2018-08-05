const SHA256 = require('crypto-js/sha256')
const Block = require('./block')
const Database = require('./database')

/*
 - Class to cretate the blockchain
*/
class Blockchain {
  constructor() {
    this.database = new Database();
    /*
     - Persist the Genesis BLock as the first block in the blockchain.
    */
    this.getBlockHeight().then((height) => {
      if (height === -1) {
        this.addBlock(new Block("Genesis block")).then(() => console.log("Genesis block created!"))
      }
    })
  }

  /*
    - Method to store newBlock in the blockchain.
    @param {Block} newBlock 
  */
  async addBlock(newBlock) {
    const height = parseInt(await this.getBlockHeight())

    newBlock.height = height + 1
    newBlock.time = new Date().getTime().toString().slice(0, -3)

    if (newBlock.height > 0) {
      const prevBlock = await this.getBlock(height)
      newBlock.previousBlockHash = prevBlock.hash
      console.log(`Previous hash: ${newBlock.previousBlockHash}`)
    }

    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString()
    console.log(`New hash: ${newBlock.hash}`)

    await this.addBlockToDB(newBlock.height, JSON.stringify(newBlock))
  }

  /*
    - Retrieves the current block height in the chain.
  */
  async getBlockHeight() {
    return await this.getBlockHeightFromDB()
  }

  /*
    - Retrieves a block by its heigh in the chain.  
    @param {int} blockHeight 
  */
  async getBlock(blockHeight) {
    return JSON.parse(await this.getBlockFromDB(blockHeight))
  }

  /*
   - Validates a block stored in the blockchain.
    @param {int} blockHeight 
  */
  async validateBlock(blockHeight) {
    let block = await this.getBlock(blockHeight);
    let blockHash = block.hash;
    block.hash = '';
    
    let validBlockHash = SHA256(JSON.stringify(block)).toString();

    if (blockHash === validBlockHash) {
        return true;
      } else {
        console.log(`Block #${blockHeight} invalid hash: ${blockHash} <> ${validBlockHash}`);
        return false;
      }
  }

  /*
    - Validates blockchain stored.
  */
  async validateChain() {
    let errorLog = []
    let previousHash = ''
    let isValidBlock = false

    const heigh = await this.getBlockHeightFromDB()

    for (let i = 0; i < heigh; i++) {
      this.getBlock(i).then((block) => {
        isValidBlock = this.validateBlock(block.height)

        if (!isValidBlock) {
          errorLog.push(i)
        } 

        if (block.previousBlockHash !== previousHash) {
          errorLog.push(i)
        }

        previousHash = block.hash

        if (i === (heigh -1)) {
          if (errorLog.length > 0) {
            console.log(`Block errors = ${errorLog.length}`)
            console.log(`Blocks: ${errorLog}`)
          } else {
            console.log('No errors detected')
          }
        }
      })
    }
  }

  /*
   - Function to add a block inside the database.
  */
  addBlockToDB(key, value) {
    return new Promise((resolve, reject) => {
      this.database.db.put(key, value, (error) => {
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
      this.database.db.get(key, (error, value) => {
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

      this.database.db.createReadStream().on('data', (data) => {
        height++
      }).on('error', (error) => {
        reject(error)
      }).on('close', () => {
        resolve(height)
      })
    })
  }
}

module.exports = Blockchain