// Make sure to include match-results-abi.js before this script in your HTML!
// Usage: window.saveMatchResult(...), window.getMatchResultsCount(), window.getMatchResult(...)

// Set your deployed contract address here:
window.MATCH_RESULTS_CONTRACT_ADDRESS = '0x9B7FB504651Bae400838a3F2c074A961bF3193F5';

window.getMatchResultsContract = function() {
  if (typeof window.web3 === 'undefined') {
    alert('Web3 not found. Please install MetaMask.');
    return null;
  }
  const web3 = new window.Web3(window.ethereum);
  return new web3.eth.Contract(window.MATCH_RESULTS_ABI, window.MATCH_RESULTS_CONTRACT_ADDRESS);
};

window.saveMatchResult = async function(donorId, patientId, organ, score) {
  const contract = window.getMatchResultsContract();
  if (!contract) return;
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const from = accounts[0];
  return contract.methods.storeMatchResult(donorId, patientId, organ, score).send({ from });
};

window.getMatchResultsCount = async function() {
  const contract = window.getMatchResultsContract();
  if (!contract) return 0;
  return contract.methods.getMatchResultsCount().call();
};

window.getMatchResult = async function(index) {
  const contract = window.getMatchResultsContract();
  if (!contract) return null;
  return contract.methods.getMatchResult(index).call();
}; 