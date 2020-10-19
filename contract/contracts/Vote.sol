// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
import "./SafeMath.sol";

contract Vote {
  using SafeMath for uint256;
  struct Votes {
    bytes32 topic;
    address owner;
    bool locked;
    bytes32[] options;
    mapping(address => bytes32) voted;
    mapping(bytes32 => uint256) votes;
    mapping(bytes32 => bool) existedOptions;
  }
  bytes32[] topics;
  mapping(bytes32 => Votes) public voting;

  event LockVoteTopic(
    address _owner,
    bytes32 _topic,
    bool _locked
  );
   
  event AddVoteTopic(
    address _owner,
    bytes32 _topic
  );
  
  event AddVoteTopicOption(
    address _owner,
    bytes32 _topic,
    bytes32 _option
  );
  
  event VoteTopicOption(
    address _from,
    bytes32 _topic,
    bytes32 _option
  );

  // return option
  function getOption(bytes32 topic, uint256 i) public view returns (bytes32) {
      return voting[topic].options[i];
  }

  // return length of option
  function getOptionsLength(bytes32 topic) public view returns (uint256) {
      return voting[topic].options.length;
  }

  // return owner of topic
  function getOwner(bytes32 topic) public view returns (address) {
      return voting[topic].owner;
  }

  // return whether vote was locked
  function getLocked(bytes32 topic) public view returns (bool) {
      return voting[topic].locked;
  }

  // return total votes for option of topic
  function getTotalVotes(bytes32 topic, bytes32 option) public view returns (uint256) {
      return voting[topic].votes[option];
  }

  // lock the vote
  function lock(bytes32 topic) public {
      if (voting[topic].topic != topic) {
          revert("top did not exist");
      }
      address sender = msg.sender;
      if (voting[topic].owner != sender) {
          revert("no access");
      }
      voting[topic].locked = true;
      emit LockVoteTopic(sender, topic, true);
  }

  // vote for option in the topic
  function voteTopicOption(bytes32 topic, bytes32 option) public {
      if (voting[topic].topic != topic) {
          revert("top did not exist");
      }
      if (voting[topic].locked) {
        revert("top was locked");
      }
      if (voting[topic].existedOptions[option] == false) {
          revert("option did not exist");
      }
      address sender = msg.sender;
      if (voting[topic].voted[sender] != 0) {
          revert("voted");
      }
      voting[topic].voted[sender] = topic;
      voting[topic].votes[option] = voting[topic].votes[option].add(1);
      emit VoteTopicOption(sender, topic, option);
  }

  // add topic
  function addTopic(bytes32 topic) public {
      if (voting[topic].topic == topic) {
          revert("top existed");
      }
      voting[topic].topic = topic;
      voting[topic].owner = msg.sender;
      emit AddVoteTopic(msg.sender, topic);
  }

  // add option for topic
  function addTopicOption(bytes32 topic, bytes32 option) public {
      if (voting[topic].topic != topic) {
          revert("top existed");
      }
      if (voting[topic].locked) {
        revert("top was locked");
      }
      if (voting[topic].existedOptions[option] == true) {
          revert("option existed");
      }
      voting[topic].options.push(option);
      voting[topic].existedOptions[option] = true;
      emit AddVoteTopicOption(msg.sender, topic, option);
  }
}
