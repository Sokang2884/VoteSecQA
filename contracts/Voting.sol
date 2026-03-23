// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        string party;
        string imageHash;
        uint voteCount;
    }

    mapping(address => bool) public hasVoted;
    Candidate[] public candidates;
    uint public startTime;
    uint public endTime;

    event VoteCast(address indexed voter, uint indexed candidateId);

    constructor(
        string[] memory _names,
        string[] memory _parties,
        string[] memory _imageHashes,
        uint _durationInMinutes
    ) {
        require(_names.length > 0, "No candidates provided.");
        require(_names.length == _parties.length && _names.length == _imageHashes.length, "Mismatched arrays.");

        startTime = block.timestamp;
        endTime = startTime + (_durationInMinutes * 1 minutes);

        for (uint i = 0; i < _names.length; i++) {
            candidates.push(Candidate({
                id: i,
                name: _names[i],
                party: _parties[i],
                imageHash: _imageHashes[i],
                voteCount: 0
            }));
        }
    }

    function vote(uint candidateId) public {
        require(!hasVoted[msg.sender], "You have already voted.");
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Election is not active.");
        require(candidateId < candidates.length, "Invalid candidate ID.");

        hasVoted[msg.sender] = true;
        candidates[candidateId].voteCount++;

        emit VoteCast(msg.sender, candidateId);
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getResults() public view returns (uint[] memory) {
        uint[] memory results = new uint[](candidates.length);
        for (uint i = 0; i < candidates.length; i++) {
            results[i] = candidates[i].voteCount;
        }
        return results;
    }
}
