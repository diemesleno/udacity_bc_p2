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

    await this.database.addBlockToDB(newBlock.height, JSON.stringify(newBlock))
  }

  /*
    - Retrieves the current block height in the chain.
  */
  async getBlockHeight() {
    return await this.database.getBlockHeightFromDB()
  }

  /*
    - Retrieves a block by its heigh in the chain.  
    @param {int} blockHeight 
  */
  async getBlock(blockHeight) {
    return JSON.parse(await this.database.getBlockFromDB(blockHeight))
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

    const heigh = await this.database.getBlockHeightFromDB()

    for (let i = 0; i <= heigh; i++) {
      console.log(`Validating the block with heigh = ${i}`)
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
}

module.exports = Blockchain