const Block = require('./block')
const Blockchain = require('./blockchain')


let blockchain = new Blockchain();

(function theLoop (i) {
  setTimeout(() => {
    blockchain.addBlock(new Block(`Test data ${i}`)).then(() => {
      if (--i) {
        theLoop(i)
      }
    })
  }, 100);
})(10);

setTimeout(() => blockchain.validateChain(), 2000)
