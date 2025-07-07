window.MATCH_RESULTS_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "donorId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "patientId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "organ", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "score", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "submittedBy", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "MatchResultStored",
    "type": "event"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "name": "matchResults",
    "outputs": [
      { "internalType": "string", "name": "donorId", "type": "string" },
      { "internalType": "string", "name": "patientId", "type": "string" },
      { "internalType": "string", "name": "organ", "type": "string" },
      { "internalType": "uint256", "name": "score", "type": "uint256" },
      { "internalType": "address", "name": "submittedBy", "type": "address" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      { "internalType": "string", "name": "donorId", "type": "string" },
      { "internalType": "string", "name": "patientId", "type": "string" },
      { "internalType": "string", "name": "organ", "type": "string" },
      { "internalType": "uint256", "name": "score", "type": "uint256" }
    ],
    "name": "storeMatchResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [ { "internalType": "uint256", "name": "index", "type": "uint256" } ],
    "name": "getMatchResult",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "string", "name": "", "type": "string" },
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getMatchResultsCount",
    "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
]; 