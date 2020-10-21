import React, { useEffect, useState } from 'react';

function Body() {
  let ethereum = {
    isMetaMask: false
  };
  let [chainId, setChainId] = useState('');
  let [selectedAddress, setSelectedAddress] = useState('');
  let [balance, setBalance] = useState(0);
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
      console.log('Get balance')
      getBalance(selectedAddress)
        .then((b) => setBalance(b));
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
  const getBalance = (address) => {
    return new Promise((resolve, reject) => {
      window.web3.eth.getBalance(address, (err, balance) => {
        if (err) reject(err);
        else {resolve(balance.div(1e18).toNumber())};
      });
    });
  }
  const EnableMetamask = () => {
    if (!selectedAddress) {
      return (<RequestMetamask />)
    }
    return (
      <div className="data">
        <div className="content">
          <div className="marginized-bottom">Your Account</div>
          <div><div className="marginized">
            Name:<br />
          <a href={"https://diode.io/prenet/#/address/"+selectedAddress} className="">{selectedAddress.substr(0, 17)}...</a></div>
          <div className="marginized">Balance:<br /> {balance} DIO</div> </div>
        </div>
      </div>
    )
  }
  const MetamaskNotFound = () => {
    return (
      <p>Please install metamask first</p>
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
          <p>Vote address: 0x..........</p>
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
          <div className="col-md-9 col-sm-9"></div>
        </div>
      </div></div>}
    </div>
  )
}

export default Body