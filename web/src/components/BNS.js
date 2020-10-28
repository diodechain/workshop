import Bridge from './Bridge';
import Abi from 'ethereumjs-abi';
import KeccakHashAsync from 'js-keccak-tiny/dist/node-bundle';

function BNS(address) {
  const bns = {};
  bns._address = address;
  bns._abi = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "Resolve",
      "outputs": [
        {
          "internalType": "address",
          "name": "result",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
  ];
  bns.initialize = async () => {
    window.aabi = Abi
    bns.keccak = await KeccakHashAsync();
    // loop through abi, and setup the promise function
    bns._abi = bns._abi.map((a) => {
      if (a.type === 'function') {
        let inputsType = a.inputs.map((i) => {
          return i.internalType;
        });
        let outputsType = a.outputs.map((i) => {
          return i.internalType;
        });
        let hash = bns.keccak.keccak256(Buffer.from(`${a.name}(${inputsType.join(',')})`));
        a.inputsType = inputsType;
        a.outputsType = outputsType;
        a.signature = hash.slice(0, 4);
        bns[a.name] = async (...args) => {
          const params = Abi.rawEncode(a.inputsType, args)
          let conBuf = Buffer(params.length + 4)
          conBuf.fill(a.signature);
          conBuf.fill(params, 4);
          const callData = '0x' + conBuf.toString('hex');
          if (a.stateMutability === 'view' && a.constant) {
            let ret = await Bridge.ethCall({
              to: bns._address,
              data: callData
            })
            ret = Buffer.from(ret.substr(2), 'hex')
            return Abi.rawDecode(a.outputsType, ret);
          }
          let confirmation;
          try {
            console.log({params: [
              { to: bns._address, data: callData, gasPrice: 0 },
            ],
            from: window.ethereum.selectedAddress})
            let tx = await window.ethereum.request({
              method: "eth_sendTransaction",
              params: [
                { from: window.ethereum.selectedAddress, to: bns._address, data: callData, gasPrice: 0 },
              ],
              from: window.ethereum.selectedAddress,
            });

            confirmation = await Bridge.isTxConfirmed(tx);
          } catch (err) {
            console.log("[Transaction] error: ", a.name, args, err);
          }
          return confirmation;
        }
      }
      return a;
    })
  };
  bns.sendTransaction = async (to, value, data) => {
    let confirmation;
    try {
      console.log({params: [
        { to: to, value: value, gasPrice: 0, data: data },
      ],
      from: window.ethereum.selectedAddress})
      let tx = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          { from: window.ethereum.selectedAddress, to: to, value: value, gasPrice: 0, data: data },
        ],
        from: window.ethereum.selectedAddress,
      });

      confirmation = await Bridge.isTxConfirmed(tx);
    } catch (err) {
      console.log("[Transaction] error: ", err);
    }
    return confirmation;
  };
  return bns;
}

export default BNS;