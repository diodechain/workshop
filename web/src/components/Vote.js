import Bridge from './Bridge';
import Abi from 'ethereumjs-abi';
import KeccakHashAsync from 'js-keccak-tiny/dist/node-bundle';

function Vote(address) {
  const vote = {};
  vote._address = address;
  vote._abi = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "_topic",
          "type": "bytes32"
        }
      ],
      "name": "AddVoteTopic",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "_topic",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "_option",
          "type": "bytes32"
        }
      ],
      "name": "AddVoteTopicOption",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "_topic",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "_locked",
          "type": "bool"
        }
      ],
      "name": "LockVoteTopic",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "_topic",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "_option",
          "type": "bytes32"
        }
      ],
      "name": "VoteTopicOption",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "voting",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "topic",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "locked",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getTopicsLength",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "topic",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "i",
          "type": "uint256"
        }
      ],
      "name": "getOption",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "topic",
          "type": "bytes32"
        }
      ],
      "name": "getOptionsLength",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "topic",
          "type": "bytes32"
        }
      ],
      "name": "getOwner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "topic",
          "type": "bytes32"
        }
      ],
      "name": "getLocked",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "topic",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "option",
          "type": "bytes32"
        }
      ],
      "name": "getTotalVotes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "topic",
          "type": "bytes32"
        }
      ],
      "name": "lock",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "topic",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "option",
          "type": "bytes32"
        }
      ],
      "name": "voteTopicOption",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "topic",
          "type": "bytes32"
        }
      ],
      "name": "addTopic",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "topic",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "option",
          "type": "bytes32"
        }
      ],
      "name": "addTopicOption",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "topic",
          "type": "bytes32"
        },
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "getVotedOption",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "topics",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "topic",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
  ];
  vote.initialize = async () => {
    window.aabi = Abi
    vote.keccak = await KeccakHashAsync();
    // loop through abi, and setup the promise function
    vote._abi = vote._abi.map((a) => {
      if (a.type === 'function') {
        let inputsType = a.inputs.map((i) => {
          return i.internalType;
        });
        let outputsType = a.outputs.map((i) => {
          return i.internalType;
        });
        let hash = vote.keccak.keccak256(Buffer.from(`${a.name}(${inputsType.join(',')})`));
        a.inputsType = inputsType;
        a.outputsType = outputsType;
        a.signature = hash.slice(0, 4);
        vote[a.name] = async (...args) => {
          const params = Abi.rawEncode(a.inputsType, args)
          let conBuf = Buffer(params.length + 4)
          conBuf.fill(a.signature);
          conBuf.fill(params, 4);
          const callData = '0x' + conBuf.toString('hex');
          if (a.stateMutability === 'view' && a.constant) {
            let ret = await Bridge.ethCall({
              to: vote._address,
              data: callData
            })
            ret = Buffer.from(ret.substr(2), 'hex')
            return Abi.rawDecode(a.outputsType, ret);
          }
          let confirmation;
          try {
            console.log({params: [
              { to: vote._address, data: callData, gasPrice: 0 },
            ],
            from: window.ethereum.selectedAddress})
            let tx = await window.ethereum.request({
              method: "eth_sendTransaction",
              params: [
                { from: window.ethereum.selectedAddress, to: vote._address, data: callData, gasPrice: 0 },
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
  return vote;
}

export default Vote;