// Interact with the deployed MatchResults contract from the frontend

const MatchResultsArtifact = require('../../../build/contracts/MatchResults.json');
const MATCH_RESULTS_ADDRESS = '0x9B7FB504651Bae400838a3F2c074A961bF3193F5'; // Update if redeployed

let matchResultsInstance;

function getMatchResultsInstance(web3) {
    if (!matchResultsInstance) {
        matchResultsInstance = new web3.eth.Contract(
            MatchResultsArtifact.abi,
            MATCH_RESULTS_ADDRESS
        );
    }
    return matchResultsInstance;
}

// Store a match result on the blockchain
async function storeMatchResult(web3, account, donorId, patientId, organ, score) {
    const contract = getMatchResultsInstance(web3);
    return contract.methods.storeMatchResult(donorId, patientId, organ, score)
        .send({ from: account });
}

// Get the number of match results
async function getMatchResultsCount(web3) {
    const contract = getMatchResultsInstance(web3);
    return contract.methods.getMatchResultsCount().call();
}

// Get a match result by index
async function getMatchResult(web3, index) {
    const contract = getMatchResultsInstance(web3);
    return contract.methods.getMatchResult(index).call();
}

window.matchResults = {
    storeMatchResult,
    getMatchResultsCount,
    getMatchResult
}; 