import React, { useEffect, useState } from 'react';
import Bridge from './Bridge';
import Vote from './Vote';
import BNS from './BNS';
import QRCode from 'qrcode.react';

function Body() {
  // deployed tx: 0xf71b1b70696d4d7032e6f6c9de7b45380179a6deb0ed590a88841bafdba66a3d
  const voteAddress = '0x520bB1F53a7A6BCfc4C70E024c4e8e4Cc7499B9a';
  const DNSAddr = "0xaf60faa5cd840b724742f1af116168276112d6a6";
  let [vote, setVote] = useState(new Vote(voteAddress));
  let [bns, setBNS] = useState(new BNS(DNSAddr));
  let ethereum = {
    isMetaMask: false
  };
  let [chainId, setChainId] = useState('');
  let [selectedAddress, setSelectedAddress] = useState('');
  let [balance, setBalance] = useState(0);
  let [topics, setTopics] = useState([]);
  let [topicOptions, setTopicOptions] = useState({});
  if (window.ethereum) {
    ethereum = window.ethereum;
    if (typeof ethereum.on === 'function') {
      ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length <= 0 && selectedAddress) {
          setSelectedAddress(null);
        }
      });
      ethereum.on('chainChanged', (nChainId) => {
        setChainId(nChainId);
      });
      // ethereum.on('connect', () => {
      // });
      // ethereum.on('disconnect', () => {
      // });
    }
  }
  useEffect(() => {
    if (ethereum) {
      setChainId(ethereum.chainId);
      // it returns null sometimes
      if (ethereum.selectedAddress) {
        setSelectedAddress(ethereum.selectedAddress);
      }
    }
  }, [ethereum]);
  useEffect(() => {
    if (selectedAddress && selectedAddress.length > 0) {
      // vote = new Vote(voteAddress);
      Bridge.getBalance(selectedAddress)
        .then((b) => setBalance(b));
      bns.initialize().catch((err) => {});
      const fetchVote = async () => {
        await vote.initialize();
        let v = await vote.getTopicsLength();
        const totalTopics = v[0].toNumber();
        for (let i=0; i<totalTopics; i++) {
          let t = await vote.topics(i);
          let res = t[0];
          let locked = await vote.getLocked(res);
          let vo = await vote.getVotedOption(res, selectedAddress);
          let voted = vo[0];
          let nonZero = [];
          for (let j=0; j<res.length; j++) {
            if (res[j] != 0) {
              nonZero.push(res[j]);
            }
          }
          const topic = {
            name: Buffer.from(nonZero).toString('utf8'),
            locked: locked[0] || voted[0] != 0
          };
          setTopics(topics.concat(topic));
          let ops = Object.assign({}, topicOptions);
          let tt = await vote.getOptionsLength(res);
          const totalTopicOptions = tt[0].toNumber();
          for (let k=0; k<totalTopicOptions; k++) {
            let op = await vote.getOption(res, k);
            let opp = op[0];
            let vt = await vote.getTotalVotes(res, opp);
            let nonZeroOp = [];
            for (let l=0; l<opp.length; l++) {
              if (opp[l] != 0) {
                nonZeroOp.push(opp[l]);
              }
            }
            const option = {
              name: Buffer.from(nonZeroOp).toString('utf8'),
              votes: vt[0].toNumber(),
              topic: res,
              option: opp,
              voted: opp.equals(voted)
            };
            
            if (!ops[topic.name]) {
              ops[topic.name] = [option];
            } else {
              ops[topic.name].push(option);
            }
          }
          setTopicOptions(ops);
        }
      }
      fetchVote()
        .then(() => {})
        .catch((err) => {});
    } else {
      setBalance(0);
    }
  }, [selectedAddress])
  const requestAccount = async (e) => {
    e.preventDefault();
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length > 0) {
        setSelectedAddress(accounts[0]);
      }
    } catch (err) {
      alert(err.message);
    }
  }
  const LoadingButton = (props) => {
    let [isLoading, setIsLoading] = useState(false);
    const onClick = async () => {
      setIsLoading(true);
      try {
        await props.onClick(arguments);
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    }
    return(<button id={props.id} className="button" onClick={onClick}>
      <img src="https://diode.io/images/spinning.gif" className={ isLoading ? "btn-loading" : "hide" } />
      <span>{props.btnText ? props.btnText : "click"}</span>
    </button>);
  }
  const RequestMetamask = () => {
    return (
      <div className="data" >
        <div className="content">
          <div className="marginized-bottom"></div>
          <div className="not-enabled">
            <button className="button" onClick={(e) => { requestAccount(e) }}>Enable MetaMask</button>
            <div className="error">MetaMask is not connected to the Diode Network ({ethereum.networkVersion})</div>
            <div className="message">
              The Diode Network Explorer uses
              <a target="_blank" href="https://metamask.io">MetaMask</a> to
              authenticate your account. Please enable MetaMask to manage your
              settings. <br /><br />
              If you don’t have MetaMask installed, follow
              <a target="_blank" href="https://support.diode.io/article/uec3mloh9z-metamask">these instructions</a>
              to get started.
            </div>
          </div>
        </div>
      </div>)
  }
  
  const EnableMetamask = () => {
    if (!selectedAddress) {
      return (<RequestMetamask />)
    }
    let name = "";
    const isValidBNS = (n) => {
      return n.length > 7 || /^(0x)?[a-f0-9]{40}$/i.test(n);
    }
    const setLookupBNS = async (e) => {
      name = e.target.value;
      // if (!isValidBNS(name)) {
      //   name = "";
      // }
    }
    const lookupBNS = async (e) => {
      if (isValidBNS(name)) {
        if (/^(0x)?[a-f0-9]{40}$/i.test(name)) {
          await bns.sendTransaction(name, 0, 0, "");
          return
        }
        let res = await bns.Resolve(name);
        let addr = res[0];
        if (addr != '0x0000000000000000000000000000000000000000') {
          await bns.sendTransaction(addr, 0, 0, "");
        }
      }
    }
    return (
      <div className="data">
        <div className="content">
          <div className="marginized-bottom">Your Account</div>
          <div>
            <div className="marginized">
              <QRCode value={selectedAddress} />
              <br />
              Name:<br />
              <a href={"https://diode.io/prenet/#/address/"+selectedAddress} className="">{selectedAddress.substr(0, 17)}...</a></div>
              <div className="marginized">
                Balance:<br />
                {balance} DIO<br />
                Note:<br />
                The vote was deployed first on Diode Network, you can deploy your own vote smart contract with <a href="">source code</a>.<br />
                <div className="input-button white marginized-top" style={{minWidth: '250px'}}>
                  <input className="no-icon" placeholder="send to bns" type="text" onChange={setLookupBNS} />
                  <LoadingButton onClick={lookupBNS} btnText={"Send"}></LoadingButton>
                </div>
              </div>
          </div>
        </div>
      </div>
    )
  }
  const MetamaskNotFound = () => {
    return (
      <p>Please install metamask first</p>
    )
  }
  const TopicsTable = ({ vote }) => {
    let checked = '';
    let newOption = '';
    const optionChange = (e) => {
      const t = e.target;
      // allow one option
      if (checked != '') {
        checked.checked = false;
      }
      if (checked == t) {
        checked = '';
        return
      }
      checked = t;
    }
    const voteOption = async (e) => {
      if (checked == '') {
        return;
      }
      const topic = Buffer.from(checked.dataset.topic);
      const option = Buffer.from(checked.dataset.option);
      const topicName = checked.dataset.topicname
      const name = checked.dataset.optionname
      try {
        await vote.voteTopicOption(topic, option);
        const vs = document.getElementById(`votes-${name}`);
        if (vs) {
          vs.textContent = parseInt(vs.textContent) + 1;
        }
        const b = document.getElementById(`button-vote-${topicName}`);
        if (b) {
          b.remove();
        }
      } catch (err) {
        console.log('[vote]: ', err)
      }
    }
    const newOptionChange = (e, topic) => {
      const value = e.target.value;
      // do some validation
      if (value.length > 0) {
        // filter new option
        if (topicOptions[topic]) {
          let option = topicOptions[topic].filter((o) => {
            return o.name == newOption;
          });
          if (option.length > 0) {
            return;
          }
        }
        newOption = value;
      }
    }
    const addOption = async (e) => {
      if (newOption == '') {
        return;
      }
      const topic = Buffer.from(e).toString('hex').padEnd(64, 0);
      const option = Buffer.from(newOption).toString('hex').padEnd(64, 0);
      try {
        await vote.addTopicOption('0x' + topic, '0x' + option);
        let ops = Object.assign({}, topicOptions);
        
        if (ops[e]) {
          ops[e].push({
            name: newOption,
            votes: 0,
            topic: topic,
            option: option,
            voted: false
          });
          setTopicOptions(ops);
        }
      } catch (err) {
        console.log('[addOption]: ', err)
      }
      return
    }
    return (
      <table className="data">
        <caption><h1>Vote</h1></caption>
        <tbody>
          <tr>
            <th>Topic</th>
            <th>Options</th>
          </tr> 
          {topics.map((t) => {
            return (
              <tr key={t.name}>
                <td>{ t.name } {t.locked}</td>
                <td>
                  { topicOptions[t.name] && <div className="input-button white marginized-top">
                    <input className="no-icon" id={`text-${t.name}`}  placeholder="option" type="text" onChange={(e) => newOptionChange(e, t.name)} />
                    <LoadingButton id={`button-${t.name}`} onClick={addOption.bind(this,t.name)} btnText={"Add"}></LoadingButton>
                  </div>}
                  { topicOptions[t.name] && topicOptions[t.name].length > 0 && <div className="marginized-top">{topicOptions[t.name].map((o) => {
                    return (
                      <label htmlFor={`checkbox-${o.name}`} key={o.name}>
                        <input type="checkbox" id={`checkbox-${o.name}`} 
                          defaultChecked={o.voted}
                          disabled={t.locked}
                          onChange={optionChange}
                          data-topic={o.topic}
                          data-option={o.option}
                          data-optionname={o.name}
                          data-topicname={t.name}
                        />
                        {o.name} <span id={`votes-${o.name}`}>{o.votes}</span>
                      </label>
                    )
                  })}
                    {!t.locked && <LoadingButton id={`button-vote-${t.name}`} onClick={voteOption} btnText={"Vote"}></LoadingButton>}
                  </div> }
                  { !topicOptions[t.name] && <p></p> }
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
  return (
    <div>
      {chainId !== '0xf' && <div className="oops-title row">
        <div>
          <h1>Oops!</h1>
          <h1>You're using different network!</h1>
        </div>
      </div>}
      {chainId === '0xf' && <div><div className="title row">
        <div className="col-md-3 no-padding">
          <h1>Vote Dapp</h1>
        </div>
        <div className="col-md-3">
          <p>Vote address: <a href={`https://diode.io/prenet/#/address/${voteAddress}`}>{voteAddress}</a></p>
        </div>
        <div className="col-md-4 col-md-offset-2">
          {ethereum.isConnected() && <p>
          connected</p>}
        </div>
      </div>
      <div className="page-content">
        <div className="row align-start">
          <div className="col-md-3 col-sm-3 padding-right-10">
            {ethereum.isMetaMask && <EnableMetamask />}
            {!ethereum.isMetaMask && <MetamaskNotFound />}
          </div>
          <div className="col-md-9 col-sm-9">
            { topics.length <= 0 && <div></div>}
            { topics.length > 0 && <TopicsTable vote={vote}/>}
          </div>
        </div>
      </div></div>}
    </div>
  )
}

export default Body