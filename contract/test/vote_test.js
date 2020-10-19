const Vote = artifacts.require('Vote')

contract('Vote', async function (accounts) {
  const accountA = accounts[0]
  const accountB = accounts[1]
  const accountC = accounts[2]
  const accountD = accounts[3]
  function stringToByte32 (str) {
    if (typeof str !== 'string') {
      return
    }
    return web3.utils.stringToHex(str)
  }
  function byte32ToString (str) {
    if (typeof str !== 'string') {
      return
    }
    return web3.utils.hexToString(str)
  }
  function assertAddVoteTopic(event, owner, topic) {
    assert.equal(event.event, 'AddVoteTopic')
    assert.equal(event.args[0], owner)
    assert.equal(byte32ToString(event.args[1]), topic)
  }
  function assertAddVoteTopicOption(event, owner, topic, option) {
    assert.equal(event.event, 'AddVoteTopicOption')
    assert.equal(event.args[0], owner)
    assert.equal(byte32ToString(event.args[1]), topic)
    assert.equal(byte32ToString(event.args[2]), option)
  }
  function assertVoteTopicOption(event, owner, topic, option) {
    assert.equal(event.event, 'VoteTopicOption')
    assert.equal(event.args[0], owner)
    assert.equal(byte32ToString(event.args[1]), topic)
    assert.equal(byte32ToString(event.args[2]), option)
  }

  it('should add topic, option and vote', async function () {
    const vote = await Vote.new()
    let tx = await vote.addTopic(stringToByte32("teashop"), { from: accountA })
    assertAddVoteTopic(tx.logs[0], accountA, "teashop")

    // anybody can add option
    tx = await vote.addTopicOption(stringToByte32("teashop"), stringToByte32("bubbletea"), { from: accountA })
    assertAddVoteTopicOption(tx.logs[0], accountA, "teashop", "bubbletea")
    tx = await vote.addTopicOption(stringToByte32("teashop"), stringToByte32("blacktea"), { from: accountB })
    assertAddVoteTopicOption(tx.logs[0], accountB, "teashop", "blacktea")
    tx = await vote.addTopicOption(stringToByte32("teashop"), stringToByte32("greentea"), { from: accountC })
    assertAddVoteTopicOption(tx.logs[0], accountC, "teashop", "greentea")

    // add topic that already existed
    try {
      tx = await vote.addVoteTopic(stringToByte32("empty"), { from: accountA })
      assert.equal(false, true)
    } catch (err) {
      // passed
    }

    // vote to topic that not existed
    try {
      tx = await vote.voteTopicOption(stringToByte32("empty"), stringToByte32("bubbletea"), { from: accountA })
      assert.equal(false, true)
    } catch (err) {
      // passed
    }

    // vote, each user can only vote to topic once
    tx = await vote.voteTopicOption(stringToByte32("teashop"), stringToByte32("bubbletea"), { from: accountA })
    assertVoteTopicOption(tx.logs[0], accountA, "teashop", "bubbletea")
    let votes = await vote.getTotalVotes(stringToByte32("teashop"), stringToByte32("bubbletea"))
    assert.equal(votes.toNumber(), 1)
    try {
      tx = await vote.voteTopicOption(stringToByte32("teashop"), stringToByte32("greentea"), { from: accountA })
      assert.equal(false, true)
    } catch (err) {
      // vote same topic again, should revert
      votes = await vote.getTotalVotes(stringToByte32("teashop"), stringToByte32("bubbletea"))
      assert.equal(votes.toNumber(), 1)
    }
    tx = await vote.voteTopicOption(stringToByte32("teashop"), stringToByte32("blacktea"), { from: accountB })
    assertVoteTopicOption(tx.logs[0], accountB, "teashop", "blacktea")
    votes = await vote.getTotalVotes(stringToByte32("teashop"), stringToByte32("blacktea"))
    assert.equal(votes.toNumber(), 1)

    // lock the vote
    tx = await vote.lock(stringToByte32("teashop"), { from: accountA })
    locked = await vote.getLocked(stringToByte32("teashop"))
    assert.equal(locked, true)
    try {
      tx = await vote.voteTopicOption(stringToByte32("teashop"), stringToByte32("greentea"), { from: accountC })
      assert.equal(false, true)
    } catch (err) {
      // passed
    }
    try {
      tx = await vote.addTopicOption(stringToByte32("teashop"), stringToByte32("lemontea"), { from: accountC })
      assert.equal(false, true)
    } catch (err) {
      // passed
    }
    // loop through options
    optionsCount = await vote.getOptionsLength(stringToByte32("teashop"))
    assert.equal(optionsCount.toNumber(), 3)
    // for (let i=0; i<optionsCount.toNumber(); i++) {
    //   await vote.getOption(stringToByte32("teashop"), i)
    // }
  })
})