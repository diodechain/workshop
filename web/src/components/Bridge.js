// Bridg.js
// It's bridge the ui to diode network, also bridge
// some web3 api to promise like api.
// Why do we bridge web3 api to promise like api?
// With promise like api, you can use async/await.
// Also then/catch instead of callback.
// Note: we didn't bridge all web3 rpc api.
const Bridge = {};
Bridge.getBalance = (address) => {
  return new Promise((resolve, reject) => {
    window.web3.eth.getBalance(address, (err, balance) => {
      if (err) reject(err);
      else {resolve(balance.div(1e18).toNumber())};
    });
  });
}

Bridge.ethCall = (params) => {
  return new Promise((resolve, reject) => {
    window.web3.eth.call(params, (err, ret) => {
      if (err) reject(err);
      else {resolve(ret)};
    });
  });
}

Bridge.isTxConfirmed = (txHash) => {
  let delay = (callback, time) => {
    return new Promise(function (resolve, reject) {
      window.setTimeout(() => {
          resolve(callback());
      }, time);
    });
  }

  return new Promise((resolve, reject) => {
    if (
      !txHash ||
      txHash.length != 66 ||
      !/^0x[0-9a-f]{64}$/i.test(txHash)
    ) {
      reject("Not a valid transaction hash");
    }
    window.web3.eth
      .getTransactionReceipt(txHash, (err, tx) => {
        if (err) {
          return resolve(
            delay(Bridge.isTxConfirmed.bind(this, txHash), 1000)
          );
        }
        if (tx) {
          if (tx.status === '0x01') {
            return resolve(tx);
          }
          return reject(new Error("tx was failed", txHash));
        }
        resolve(
          delay(Bridge.isTxConfirmed.bind(this, txHash), 1000)
        )
      });
    }
  );
}

export default Bridge;