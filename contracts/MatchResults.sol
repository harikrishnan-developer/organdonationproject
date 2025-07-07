// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract MatchResults {
    struct MatchResult {
        string donorId;
        string patientId;
        string organ;
        uint score; // 0-100 (or 0-10000 for decimals)
        address submittedBy;
        uint timestamp;
    }

    MatchResult[] public matchResults;

    event MatchResultStored(string donorId, string patientId, string organ, uint score, address indexed submittedBy, uint timestamp);

    function storeMatchResult(string memory donorId, string memory patientId, string memory organ, uint score) public {
        matchResults.push(MatchResult(donorId, patientId, organ, score, msg.sender, block.timestamp));
        emit MatchResultStored(donorId, patientId, organ, score, msg.sender, block.timestamp);
    }

    function getMatchResult(uint index) public view returns (string memory, string memory, string memory, uint, address, uint) {
        require(index < matchResults.length, "Index out of bounds");
        MatchResult memory result = matchResults[index];
        return (result.donorId, result.patientId, result.organ, result.score, result.submittedBy, result.timestamp);
    }

    function getMatchResultsCount() public view returns (uint) {
        return matchResults.length;
    }
} 