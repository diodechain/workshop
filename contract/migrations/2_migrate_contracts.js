const SafeMath = artifacts.require("SafeMath");
const Vote = artifacts.require("Vote");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, Vote);
  deployer.deploy(Vote);
};
