// Import Web3 JS library
const Web3 = require('web3');
const web3 = new Web3("HTTP://127.0.0.1:7545");

// Import the ABI definition of the DemoContract
const artifact = require('../../build/contracts/DonorContract.json');

// const netid = await web3.eth.net.getId()
const deployedContract = artifact.networks[5777];
const contractAddress = deployedContract.address;

const MIN_GAS = 1000000;

// Add SHA-256 hash function using jsSHA
function sha256(str) {
    str = String(str); // Ensure input is a string
    var shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(str);
    return shaObj.getHash("HEX");
}

function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}
function generateTable(table, data) {
    for (let element of data) {
        let row = table.insertRow();
        for (key in element) {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);
        cell.appendChild(text);
        }
    }
}

let table = document.querySelector("table");


function selectRow() {
    var table = document.getElementById('pending-table');
    var cells = table.getElementsByTagName('td');

    for (var i = 0; i < cells.length; i++) {
        // Take each cell
        var cell = cells[i];
        // do something on onclick event for cell
        cell.onclick = function () {
            // Get the row id where the cell exists
            var rowId = this.parentNode.rowIndex;

            var rowsNotSelected = table.getElementsByTagName('tr');
            for (var row = 0; row < rowsNotSelected.length; row++) {
                rowsNotSelected[row].style.backgroundColor = "";
                rowsNotSelected[row].style.fontWeight = "";
                rowsNotSelected[row].classList.remove('selected');
            }
            var rowSelected = table.getElementsByTagName('tr')[rowId];
            rowSelected.style.backgroundColor = "#aad7ec";
            rowSelected.style.fontWeight = 800;
            rowSelected.className += " selected";

            var row_value = [];
            for (var i= 0; i < rowSelected.cells.length; i++) {
                row_value[i] = rowSelected.cells[i].innerHTML;
            }
            console.log("Selected row: "+row_value);
            document.getElementById("getPledgeFullName").innerHTML =  row_value[1];
            document.getElementById("getPledgeAge").innerHTML =  row_value[2];
            document.getElementById("getPledgeGender").innerHTML = row_value[3];
            document.getElementById("getPledgeMedicalID").innerHTML = row_value[4];
            document.getElementById("getPledgeBloodType").innerHTML =  row_value[5];
            document.getElementById("getPledgeOrgan").innerHTML = row_value[6];
            document.getElementById("getPledgeWeight").innerHTML =  row_value[7];
            document.getElementById("getPledgeHeight").innerHTML =  row_value[8];
            document.getElementById("PledgeMessage").innerHTML = null;
        
            var textcontainer = document.getElementById("text-hidden");
            textcontainer.className = 'verification';
        }
    }
}

function showWarning(user, message, color) {
    let userid = user+"InputCheck";
    var warning = document.querySelector(".alert.warning");
    warning.style.background = color;
    document.getElementById(userid).innerHTML = message;
    warning.style.opacity = "100";
    warning.style.display = "block";
}

function checkInputValues(user, fullname, age, gender, medical_id, organ, weight, height){
    var color = "#ff9800"
    if (fullname=="")
        showWarning(user, "Enter your name", color);
    else if (age.length==0)
        showWarning(user, "Enter your age", color);
    else if (user=="Pledge" && age<18)
        showWarning(user, "You must be over 18 to pledge", color);
    else if (gender==null)
        showWarning(user, "Enter your gender", color);
    else if (medical_id.length == 0)
         showWarning(user, "Enter your Medical ID", color);
    else if (organ.length == 0)
        showWarning(user, "Enter organ(s)", color);
    else if (weight.length == 0)
        showWarning(user, "Enter your weight", color);
    else if (weight < 20 || weight > 200)
        showWarning(user, "Enter proper weight", color);
    else if (height.length == 0)
        showWarning(user, "Enter your height", color);
    else if (height < 54 || height > 272)
        showWarning(user, "Enter proper height", color);
    else {
        return true;
    }
}

function assignSearchValues(result, user){
    document.getElementById("get"+user+"FullName").innerHTML = "Full Name: " + result[0];
    document.getElementById("get"+user+"Age").innerHTML = "Age: " + result[1];
    document.getElementById("get"+user+"Gender").innerHTML = "Gender: " + result[2];
    document.getElementById("get"+user+"BloodType").innerHTML = "Blood Type SHA256: " + sha256(result[3]);
    document.getElementById("get"+user+"Organ").innerHTML = "Organ SHA256: " + sha256(Array.isArray(result[4]) ? result[4].join(',') : result[4]);
    document.getElementById("get"+user+"Weight").innerHTML = "Weight: " + result[5];
    document.getElementById("get"+user+"Height").innerHTML = "Height: " + result[6];
}

function clearSearchValues(user){
    document.getElementById("get"+user+"FullName").innerHTML = null;
    document.getElementById("get"+user+"Age").innerHTML = null;
    document.getElementById("get"+user+"Gender").innerHTML = null;
    document.getElementById("get"+user+"BloodType").innerHTML = null;
    document.getElementById("get"+user+"Organ").innerHTML = null;
    document.getElementById("get"+user+"Weight").innerHTML = null;
    document.getElementById("get"+user+"Height").innerHTML = null;
}

const App = {
    web3: null,
    contractInstance: null,
    accounts: null,
    metamaskInstalled: false,

    start: async function() {
        if (typeof window.ethereum !== 'undefined') {
            this.metamaskInstalled = true;
            this.web3 = new Web3(window.ethereum);
        } else {
            // MetaMask is not installed
            this.web3 = new Web3("HTTP://127.0.0.1:7545");
        }

        try {
        // Get the accounts
            this.accounts = await this.web3.eth.getAccounts();
        console.log(this.accounts);

            this.contractInstance = new this.web3.eth.Contract(
                artifact.abi,
                contractAddress
            );

            // Update UI based on connection status
            this.updateUI();

        } catch (error) {
            console.error("Could not start the application.", error);
        }
    },

    connect: async function() {
        if (!this.metamaskInstalled) {
            alert("Please install MetaMask to use this feature.");
            return;
        }
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.accounts = accounts;
            console.log("Connected accounts:", this.accounts);

            this.contractInstance = new this.web3.eth.Contract(
            artifact.abi,
            contractAddress
        );

            // Update UI after connecting
            this.updateUI();

        } catch (error) {
            console.error("User denied account access or an error occurred.", error);
        }
    },

    updateUI: function() {
        const connectButton = document.getElementById('connectWalletBtn');
        const formContainer = document.getElementById('registrationForm');
        const walletInfo = document.getElementById('walletInfo');
        const allowedDonorAccount = '0x2Fe5B6648120ee69734346D1482599ef3605caaB'.toLowerCase();
        const allowedPatientAccount = '0x12E76137000E2B3D0Ed09B657d2f138d19b37Cda'.toLowerCase();
        let accessDeniedDiv = document.getElementById('accessDeniedDonor');
        if (formContainer) {
            if (!accessDeniedDiv) {
                accessDeniedDiv = document.createElement('div');
                accessDeniedDiv.id = 'accessDeniedDonor';
                accessDeniedDiv.className = 'alert alert-danger mt-4';
                accessDeniedDiv.style.display = 'none';
                accessDeniedDiv.innerText = 'Access Denied: Only the authorized account can register as a donor.';
                formContainer.parentNode.insertBefore(accessDeniedDiv, formContainer);
            }
        }
        let accessDeniedPatientDiv = document.getElementById('accessDeniedPatient');
        if (formContainer) {
            if (!accessDeniedPatientDiv) {
                accessDeniedPatientDiv = document.createElement('div');
                accessDeniedPatientDiv.id = 'accessDeniedPatient';
                accessDeniedPatientDiv.className = 'alert alert-danger mt-4';
                accessDeniedPatientDiv.style.display = 'none';
                accessDeniedPatientDiv.innerText = 'Access Denied: Only the authorized account can register as a patient.';
                formContainer.parentNode.insertBefore(accessDeniedPatientDiv, formContainer);
            }
        }
        if (connectButton && formContainer) {
            if (this.accounts && this.accounts.length > 0) {
                const userAccount = this.accounts[0].toLowerCase();
                // Donor registration page restriction
                if (window.location.pathname.includes('donor-registration.html')) {
                    if (userAccount === allowedDonorAccount) {
                        connectButton.style.display = 'none';
                        formContainer.style.display = 'block';
                        accessDeniedDiv.style.display = 'none';
                        if (walletInfo) {
                            walletInfo.innerHTML = `Connected: ${this.accounts[0].substring(0, 6)}...${this.accounts[0].substring(38)}`;
                            walletInfo.style.display = 'block';
                        }
                    } else {
                        connectButton.style.display = 'none';
                        formContainer.style.display = 'none';
                        accessDeniedDiv.style.display = 'block';
                        if (walletInfo) {
                            walletInfo.innerHTML = `Connected: ${this.accounts[0].substring(0, 6)}...${this.accounts[0].substring(38)}`;
                            walletInfo.style.display = 'block';
                        }
                    }
                // Patient registration page restriction
                } else if (window.location.pathname.includes('patient-registration.html')) {
                    if (userAccount === allowedPatientAccount) {
                        connectButton.style.display = 'none';
                        formContainer.style.display = 'block';
                        accessDeniedPatientDiv.style.display = 'none';
                        if (walletInfo) {
                            walletInfo.innerHTML = `Connected: ${this.accounts[0].substring(0, 6)}...${this.accounts[0].substring(38)}`;
                            walletInfo.style.display = 'block';
                        }
                    } else {
                        connectButton.style.display = 'none';
                        formContainer.style.display = 'none';
                        accessDeniedPatientDiv.style.display = 'block';
                        if (walletInfo) {
                            walletInfo.innerHTML = `Connected: ${this.accounts[0].substring(0, 6)}...${this.accounts[0].substring(38)}`;
                            walletInfo.style.display = 'block';
                        }
                    }
                } else {
                    // Default behavior for other pages
                    connectButton.style.display = 'none';
                    formContainer.style.display = 'block';
                    accessDeniedDiv.style.display = 'none';
                    accessDeniedPatientDiv.style.display = 'none';
                    if (walletInfo) {
                        walletInfo.innerHTML = `Connected: ${this.accounts[0].substring(0, 6)}...${this.accounts[0].substring(38)}`;
                        walletInfo.style.display = 'block';
                    }
                }
            } else {
                connectButton.style.display = 'block';
                formContainer.style.display = 'none';
                if (accessDeniedDiv) accessDeniedDiv.style.display = 'none';
                if (accessDeniedPatientDiv) accessDeniedPatientDiv.style.display = 'none';
                if (walletInfo) {
                    walletInfo.style.display = 'none';
                }
            }
        }
    },

    closeAlert: async function (){
        var alert = document.querySelector(".alert.warning");
        alert.style.opacity = "0";
        setTimeout(function(){ alert.style.display = "none"; }, 600);
    },

    register: async function(user) {
        console.log(user);
        const fullname = document.getElementById(user+'FullName').value;
        const age = document.getElementById(user+'Age').value;
        const selectedGender = document.querySelector("input[name='gender']:checked");
        const gender = (selectedGender) ? selectedGender.value : null;
        const medical_id = document.getElementById(user+'MedicalID').value;
        const blood_type = document.getElementById(user+'BloodType').value;
        let checkboxes = document.querySelectorAll("input[name='Organ']:checked");
        let organ = [];
        checkboxes.forEach((checkbox) => {
            organ.push(checkbox.value);
        });
        const weight = document.getElementById(user+'Weight').value;
        const height = document.getElementById(user+'Height').value;

        let checkedValues = false;
        checkedValues = checkInputValues(user, fullname, age, gender, medical_id, organ, weight, height);
        console.log("Values Checked");
        var warning = document.querySelector(".alert.warning");
        if (checkedValues) {
            let validate;
            if (user=="Pledge") {
                validate = await this.contractInstance.methods.validatePledge(medical_id).call();
                console.log(validate);
            }
            else if (user=="Donor") {
                validate = await this.contractInstance.methods.validateDonor(medical_id).call();
                console.log(validate);
            }
            else if (user=="Patient") {
                validate = await this.contractInstance.methods.validatePatient(medical_id).call();
                console.log(validate);
            }

            if (!validate) {        
                console.log(fullname, age, gender, medical_id, blood_type, organ, weight, height);
                if (user=="Pledge")
                    this.setPledge(fullname, age, gender, medical_id, blood_type, organ, weight, height);
                else if (user=="Donor")
                    this.setDonor(fullname, age, gender, medical_id, blood_type, organ, weight, height);
                else if (user=="Patient") 
                    this.setPatient(fullname, age, gender, medical_id, blood_type, organ, weight, height);
                showWarning(user, "Registration Successful!", "#04AA6D");
                setTimeout(function(){
                    warning.style.opacity = "0";
                    setTimeout(function(){ warning.style.display = "none"; }, 1200);
                }, 5000);
            }
            else {
                showWarning(user, "Medical ID already exists!", "#f44336");
            }
        }
    },

    forwardPledge: async function() {
        const medical_id = document.getElementById('getPledgeMedicalID').innerHTML;
        console.log(medical_id);
        await this.contractInstance.methods.getPledge(medical_id).call().then(function(result) {
            console.log(result);
            App.setDonor(result[0], result[1], result[2], medical_id, result[3], result[4], result[5], result[6]);
        });
        document.getElementById("PledgeMessage").innerHTML = "Registration Successful!";
    },

    setPledge: async function(fullname, age, gender, medical_id, blood_type, organ, weight, height) {
        const gas = await this.contractInstance.methods.setPledge(fullname, age, gender, medical_id, blood_type, organ, weight, height).estimateGas({
            from: this.accounts[0]
        });
        await this.contractInstance.methods.setPledge(fullname, age, gender, medical_id, blood_type, organ, weight, height
        ).send({
            from: this.accounts[0], gas: Math.max(gas, MIN_GAS)
        })
    },

    setDonor: async function(fullname, age, gender, medical_id, blood_type, organ, weight, height) {
        const gas = await this.contractInstance.methods.setDonors(fullname, age, gender, medical_id, blood_type, organ, weight, height).estimateGas({
            from: this.accounts[0]
        });
        await this.contractInstance.methods.setDonors(fullname, age, gender, medical_id, blood_type, organ, weight, height
        ).send({
            from: this.accounts[0], gas: Math.max(gas, MIN_GAS)
        })
    },

    setPatient: async function(fullname, age, gender, medical_id, blood_type, organ, weight, height) {
        const gas = await this.contractInstance.methods.setPatients(fullname, age, gender, medical_id, blood_type, organ, weight, height).estimateGas({
            from: this.accounts[0]
        });
        await this.contractInstance.methods.setPatients(fullname, age, gender, medical_id, blood_type, organ, weight, height).send({
            from: this.accounts[0], gas: Math.max(gas, MIN_GAS)
        });
    },

    search: async function(user) {
        console.log(user);
        // Use the new unified search input
        const input = document.getElementById("input"+user+"Search").value.trim();
        if (input.length === 0) {
            document.getElementById("search"+user+"Check").innerHTML = "Enter Medical ID or Name";
            clearSearchValues(user);
            return;
        }

        // Try searching by Medical ID first
            let validate = false;
        if (user === "Donor") {
            validate = await this.contractInstance.methods.validateDonor(input).call();
        } else if (user === "Patient") {
            validate = await this.contractInstance.methods.validatePatient(input).call();
            }

            if (validate) {
            // Found by Medical ID
            if (user === "Donor") {
                await this.contractInstance.methods.getDonor(input).call().then(function(result){
                        document.getElementById("search"+user+"Check").innerHTML = null;
                        assignSearchValues(result, user);
                    });
            } else if (user === "Patient") {
                await this.contractInstance.methods.getPatient(input).call().then(function(result){
                        document.getElementById("search"+user+"Check").innerHTML = null;
                        assignSearchValues(result, user);
                    });
                }
            return;
        }

        // If not found by Medical ID, search by name (case-insensitive)
        let allIDs = [];
        if (user === "Donor") {
            allIDs = await this.contractInstance.methods.getAllDonorIDs().call();
        } else if (user === "Patient") {
            allIDs = await this.contractInstance.methods.getAllPatientIDs().call();
        }
        let matches = [];
        for (let i = 0; i < allIDs.length; i++) {
            let result;
            if (user === "Donor") {
                result = await this.contractInstance.methods.getDonor(allIDs[i]).call();
            } else if (user === "Patient") {
                result = await this.contractInstance.methods.getPatient(allIDs[i]).call();
            }
            // result[0] is fullname
            if (result[0] && result[0].toLowerCase() === input.toLowerCase()) {
                // Hash blood type and organ for demonstration
                const bloodTypeHash = sha256(result[3]);
                const organHash = sha256(Array.isArray(result[4]) ? result[4].join(',') : result[4]);
                matches.push({
                    result: result,
                    bloodTypeHash: bloodTypeHash,
                    organHash: organHash
                });
            }
        }
        if (matches.length > 0) {
            // Show all matches as a list
            let html = '';
            matches.forEach((match, idx) => {
                const result = match.result;
                html += `<div class='border rounded p-2 mb-2'>` +
                    `<strong>Match ${idx+1}</strong><br>` +
                    `Full Name: ${result[0]}<br>` +
                    `Age: ${result[1]}<br>` +
                    `Gender: ${result[2]}<br>` +
                    `Blood Type SHA256: ${match.bloodTypeHash}<br>` +
                    `Organ SHA256: ${match.organHash}<br>` +
                    `Weight: ${result[5]}<br>` +
                    `Height: ${result[6]}` +
                    `</div>`;
            });
            document.getElementById("search"+user+"Check").innerHTML = null;
            document.getElementById("get"+user+"FullName").innerHTML = html;
            document.getElementById("get"+user+"Age").innerHTML = '';
            document.getElementById("get"+user+"Gender").innerHTML = '';
            document.getElementById("get"+user+"BloodType").innerHTML = '';
            document.getElementById("get"+user+"Organ").innerHTML = '';
            document.getElementById("get"+user+"Weight").innerHTML = '';
            document.getElementById("get"+user+"Height").innerHTML = '';
        } else {
            document.getElementById("search"+user+"Check").innerHTML = "No match found!";
                clearSearchValues(user);
        }
    },

    verifyPledges: async function() {
        this.accounts = await web3.eth.getAccounts();
        this.contractInstance = new web3.eth.Contract(
            artifact.abi,
            contractAddress
        );
        const PledgeCount = await this.contractInstance.methods.getCountOfPledges().call();
        const PledgeIDs = await this.contractInstance.methods.getAllPledgeIDs().call();
        let Pledge;
        let tableCreated = false;
        let initialTableGeneration = true;

        for (let i=0; i<PledgeCount; i++) {
            var validate = await this.contractInstance.methods.validateDonor(PledgeIDs[i]).call();

            if (!validate) {
                tableCreated = true;
                await this.contractInstance.methods.getPledge(PledgeIDs[i]).call().then(function(result) {
                    console.log(result);
                    Pledge = [
                        { Index: i+1, "Full Name": result[0], Age: result[1], Gender: result[2], "Medical ID": PledgeIDs[i], "Blood-Type": result[3], Organ: result[4], Weight: result[5], Height: result[6]},
                    ];
    
                    let data = Object.keys(Pledge[0]);
                    if (initialTableGeneration){
                        generateTableHead(table, data);
                        initialTableGeneration = false;
                    }
                    generateTable(table, Pledge);
                });
            }
        }
        if (tableCreated) {
            selectRow();
        } else {
            document.getElementById("pending-table-message").innerHTML = "No pending pledges found!";
        }
        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    },

    viewPledges: async function() {
        this.accounts = await web3.eth.getAccounts();
        this.contractInstance = new web3.eth.Contract(
            artifact.abi,
            contractAddress
        );
        const PledgeCount = await this.contractInstance.methods.getCountOfPledges().call();
        const PledgeIDs = await this.contractInstance.methods.getAllPledgeIDs().call();
        let Pledge;

        for (let i=0; i<PledgeCount; i++) {
            await this.contractInstance.methods.getPledge(PledgeIDs[i]).call().then(function(result) {
                console.log(result);
                Pledge = [
                    { Index: i+1, "Full Name": result[0], Age: result[1], Gender: result[2], "Medical ID": PledgeIDs[i], "Blood-Type": result[3], Organ: result[4], Weight: result[5], Height: result[6]},
                ];

                let data = Object.keys(Pledge[0]);
                if (i==0)
                    generateTableHead(table, data);
                generateTable(table, Pledge);
            });
        }
        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    },

    viewDonors: async function() {
        this.accounts = await web3.eth.getAccounts();
        this.contractInstance = new web3.eth.Contract(
            artifact.abi,
            contractAddress
        );
        const DonorCount = await this.contractInstance.methods.getCountOfDonors().call();
        const DonorIDs = await this.contractInstance.methods.getAllDonorIDs().call();
        let Donor;

        for (let i=0; i<DonorCount; i++) {
            await this.contractInstance.methods.getDonor(DonorIDs[i]).call().then(function(result) {
                console.log(result);
                Donor = [
                    { Index: i+1, "Full Name": result[0], Age: result[1], Gender: result[2], "Medical ID": DonorIDs[i], "Blood Type": result[3], "Organ(s)": result[4], "Weight(kg)": result[5], "Height(cm)": result[6]},
                ];

                let data = Object.keys(Donor[0]);
                if (i==0)
                    generateTableHead(table, data);
                generateTable(table, Donor);
            });
        }
        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    },

    viewPatients: async function() {
        this.accounts = await web3.eth.getAccounts();
        this.contractInstance = new web3.eth.Contract(
            artifact.abi,
            contractAddress
        );
        const patientCount = await this.contractInstance.methods.getCountOfPatients().call();
        const patientIDs = await this.contractInstance.methods.getAllPatientIDs().call();
        let patient;

        for (let i=0; i<patientCount; i++) {
            await this.contractInstance.methods.getPatient(patientIDs[i]).call().then(function(result) {
                console.log(result);
                patient = [
                    { Index: i+1, "Full Name": result[0], Age: result[1], Gender: result[2], "Medical ID": patientIDs[i], "Blood Type": result[3], "Organ(s)": result[4], "Weight(kg)": result[5], "Height(cm)": result[6]},
                ];

                let data = Object.keys(patient[0]);
                if (i==0)
                    generateTableHead(table, data);
                generateTable(table, patient);
            });
        }
        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    },

    transplantMatch: async function() {
        this.accounts = await web3.eth.getAccounts();
        this.contractInstance = new web3.eth.Contract(
            artifact.abi,
            contractAddress
        );
        document.getElementById("transplantTable").innerHTML = null;
        var patientCount = await this.contractInstance.methods.getCountOfPatients().call();
        var donorCount = await this.contractInstance.methods.getCountOfDonors().call();
        var patientIDs = await this.contractInstance.methods.getAllPatientIDs().call();
        var donorIDs = [''];
        await this.contractInstance.methods.getAllDonorIDs().call().then(function(result){
            for (let i=0; i<donorCount; i++) {
                donorIDs[i] = result[i];
            }
        });

        let donor = [];
        for (let i=0; i<donorCount; i++) {
            await this.contractInstance.methods.getDonor(donorIDs[i]).call().then(function(result){
                let organsArr = [];
                let temp = result[4];
                for (let o=0; o<temp.length; o++) {
                    organsArr[o] = temp[o];
                }
                donorObj = { ID: donorIDs[i], name: result[0], bloodtype: result[3], organs: organsArr, organcount: organsArr.length };
                donor[i] = donorObj;
            });
        }
        console.log(donor);

        let match;
        console.log("Patient Count: " + patientCount);
        console.log("Donor Count: " + donorCount);

        let initialTableGeneration = true;

        for (var i=0; i<patientCount; i++) {
            var patientname;
            var patientbloodtype;            
            var patientorgans;
            await this.contractInstance.methods.getPatient(patientIDs[i]).call().then(function(result){
                patientname = result[0];
                patientbloodtype=result[3];
                patientorgans=result[4];
            });
            console.log("Checking patient: "+patientname);
            for (var poi=0; poi < patientorgans.length; poi++) {
                console.log("Checking patient organ: "+patientorgans[poi]);
                for (var j=0; j<donorCount; j++) {
                    let matchedOrgan = false;
                    console.log("Checking donor: "+donor[j].name);
                    console.log("Organ count: "+donor[j].organcount);
                    for (let doi=0; doi < donor[j].organcount; doi++) {
                        console.log("Checking donor organ: "+donor[j].organs[doi])
                        if (patientbloodtype==donor[j].bloodtype && patientorgans[poi]==donor[j].organs[doi]) {
                            matchedOrgan = true;
                            console.log("Matched: "+patientname+" "+patientorgans[poi]+"<->"+donor[j].name+" "+donor[j].organs[doi]);
                            match = [
                                { "Patient Name": patientname, "Patient Organ": patientorgans[poi], "Patient Medical ID": patientIDs[i],"": "↔️", "Donor Medical ID": donorIDs[j], "Donor Organ": donor[j].organs[doi], "Donor Name": donor[j].name},
                            ];
        
                            let data = Object.keys(match[0]);
                            if (initialTableGeneration){
                                generateTableHead(table, data);
                                initialTableGeneration = false;
                            }
                            generateTable(table, match);
                            
                            // Removing marked donor organ
                            donor[j].organs[doi] = donor[j].organs[donor[j].organcount-1];
                            donor[j].organs.pop();
                            donor[j].organcount--;
                            break;
                        }
                    }
                    if (donor[j].organcount == 0) {
                        donor[j] = donor[donorCount-1];
                        donorCount--;
                    }
                    if (matchedOrgan) {
                        break;
                    }
                }
            }
        }
        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    },

    enhancedTransplantMatch: async function() {
        this.accounts = await web3.eth.getAccounts();
        this.contractInstance = new web3.eth.Contract(
            artifact.abi,
            contractAddress
        );

        // Check if AI matcher is available
        if (typeof AITransplantMatcher === 'undefined') {
            console.error('AITransplantMatcher not loaded. Falling back to basic matching.');
            document.getElementById("aiStatus").innerHTML = "Not Available";
            document.getElementById("aiStatus").className = "badge badge-danger";
            // Fall back to basic matching
            return this.transplantMatch();
        }

        // Update status indicators
        document.getElementById("aiStatus").innerHTML = "Training...";
        document.getElementById("aiStatus").className = "badge badge-warning";

        // Initialize AI matcher
        const aiMatcher = new AITransplantMatcher();
        await aiMatcher.loadRandomForestModel();
        document.getElementById("aiStatus").innerHTML = "Ready";
        document.getElementById("aiStatus").className = "badge badge-success";

        // Get patient and donor data
        const patientCount = await this.contractInstance.methods.getCountOfPatients().call();
        const donorCount = await this.contractInstance.methods.getCountOfDonors().call();
        const patientIDs = await this.contractInstance.methods.getAllPatientIDs().call();
        const donorIDs = await this.contractInstance.methods.getAllDonorIDs().call();

        // Update counts
        document.getElementById("patientCount").innerHTML = patientCount;
        document.getElementById("donorCount").innerHTML = donorCount;

        // Prepare patient data with enhanced features
        const patients = [];
        for (let i = 0; i < patientCount; i++) {
            const result = await this.contractInstance.methods.getPatient(patientIDs[i]).call();
            const organsArr = [];
            for (let o = 0; o < result[4].length; o++) {
                organsArr.push(result[4][o]);
            }
            const patient = {
                id: patientIDs[i],
                name: result[0],
                age: parseInt(result[1]),
                gender: result[2],
                bloodType: result[3],
                organs: organsArr,
                weight: parseInt(result[5]),
                height: parseInt(result[6]),
                urgencyLevel: this.calculateUrgencyLevel(result[1], organsArr),
                bmi: this.calculateBMI(result[5], result[6]),
                medicalRisk: this.calculateMedicalRisk(result[1], result[5], result[6]),
                waitingTime: this.generateWaitingTime(),
                previousTransplants: this.generateTransplantHistory(),
                location: this.generateLocation()
            };
            patients.push(patient);
        }
        // Prepare donor data with enhanced features
        const donors = [];
        for (let i = 0; i < donorCount; i++) {
            const result = await this.contractInstance.methods.getDonor(donorIDs[i]).call();
            const organsArr = [];
            for (let o = 0; o < result[4].length; o++) {
                organsArr.push(result[4][o]);
            }
            const donor = {
                id: donorIDs[i],
                name: result[0],
                age: parseInt(result[1]),
                gender: result[2],
                bloodType: result[3],
                organs: organsArr,
                weight: parseInt(result[5]),
                height: parseInt(result[6]),
                bmi: this.calculateBMI(result[5], result[6]),
                location: this.generateLocation(),
                availabilityScore: this.calculateAvailabilityScore(),
                medicalHistory: this.generateMedicalHistory()
            };
            donors.push(donor);
        }
        // Get enhanced AI-powered recommendations
        const recommendations = [];
        for (const patient of patients) {
            for (const donor of donors) {
                for (const patientOrgan of patient.organs) {
                    if (donor.organs.includes(patientOrgan)) {
                        const bloodCompatibility = this.calculateBloodCompatibility(donor.bloodType, patient.bloodType);
                        const tissueCompatibility = this.calculateTissueCompatibility(patient, donor);
                        // Use Random Forest model for AI score
                        const aiScore = aiMatcher.predictMatchScore(
                            { bloodType: donor.bloodType, age: donor.age },
                            { bloodType: patient.bloodType, age: patient.age },
                            patientOrgan
                        );
                        const urgencyScore = this.calculateUrgencyScore(patient.urgencyLevel);
                        const combinedScore = (
                            (aiScore * 0.35) +
                            (bloodCompatibility * 0.25) +
                            (tissueCompatibility * 0.25) +
                            (urgencyScore * 0.15)
                        );
                        if (bloodCompatibility === 0 || tissueCompatibility === 0 || combinedScore > 0.3) {
                            // Enhanced match quality assessment
                            let qualityClass = '';
                            let qualityText = '';
                            let riskLevel = '';
                            if (bloodCompatibility === 0 || tissueCompatibility === 0) {
                                qualityClass = 'text-danger';
                                qualityText = 'Incompatible';
                                riskLevel = 'N/A';
                            } else if (combinedScore >= 0.85) {
                                qualityClass = 'text-success';
                                qualityText = 'Excellent';
                                riskLevel = 'Low';
                            } else if (combinedScore >= 0.70) {
                                qualityClass = 'text-warning';
                                qualityText = 'Good';
                                riskLevel = 'Medium';
                            } else if (combinedScore >= 0.50) {
                                qualityClass = 'text-info';
                                qualityText = 'Fair';
                                riskLevel = 'High';
                            } else {
                                qualityClass = 'text-danger';
                                qualityText = 'Poor';
                                riskLevel = 'Very High';
                            }
                            recommendations.push({
                                patient: patient,
                                donor: donor,
                                organ: patientOrgan,
                                aiScore: aiScore,
                                bloodCompatibility: bloodCompatibility,
                                tissueCompatibility: tissueCompatibility,
                                combinedScore: combinedScore,
                                urgencyScore: urgencyScore,
                                qualityText: qualityText,
                                riskLevel: riskLevel
                            });
                        }
                    }
                }
            }
        }
        recommendations.sort((a, b) => b.combinedScore - a.combinedScore);
        
        // Update match count
        document.getElementById("matchCount").innerHTML = recommendations.length;

        // Display enhanced matches in table
        const table = document.getElementById("transplantTable");
        table.innerHTML = '';

        if (recommendations.length > 0) {
            // Create enhanced table header
            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            const headers = [
                "Rank", "Patient Name", "Patient Age", "Patient Blood", "Organ", 
                "Urgency", "AI Score", "Blood Match", "Tissue Match", "Combined Score", 
                "Donor Name", "Donor Age", "Donor Blood", "Match Quality", "Risk Level"
            ];
            
            headers.forEach(header => {
                const th = document.createElement("th");
                th.textContent = header;
                headerRow.appendChild(th);
            });

            // Create enhanced table body
            const tbody = table.createTBody();
            recommendations.forEach((rec, index) => {
                const row = tbody.insertRow();
                
                // Enhanced match quality assessment
                let qualityClass = '';
                let qualityText = '';
                let riskLevel = '';
                
                if (rec.bloodCompatibility === 0 || rec.tissueCompatibility === 0) {
                    qualityClass = 'text-danger';
                    qualityText = 'Incompatible';
                    riskLevel = 'N/A';
                } else if (rec.combinedScore >= 0.85) {
                    qualityClass = 'text-success';
                    qualityText = 'Excellent';
                    riskLevel = 'Low';
                } else if (rec.combinedScore >= 0.70) {
                    qualityClass = 'text-warning';
                    qualityText = 'Good';
                    riskLevel = 'Medium';
                } else if (rec.combinedScore >= 0.50) {
                    qualityClass = 'text-info';
                    qualityText = 'Fair';
                    riskLevel = 'High';
                } else {
                    qualityClass = 'text-danger';
                    qualityText = 'Poor';
                    riskLevel = 'Very High';
                }
                
                // Debug logging
                console.log('Combined Score:', rec.combinedScore);
                console.log('Risk Level:', riskLevel);

                // Determine organ label
                let organLabel = rec.organ;

                row.innerHTML = `
                    <td><strong>${index + 1}</strong></td>
                    <td>${rec.patient.name}</td>
                    <td>${rec.patient.age}</td>
                    <td><span class="badge badge-secondary">${rec.patient.bloodType}</span></td>
                    <td>${organLabel}</td>
                    <td><span class="${rec.patient.urgencyLevel === 'Critical' ? 'badge badge-danger' : rec.patient.urgencyLevel === 'High' ? 'badge badge-warning' : rec.patient.urgencyLevel === 'Medium' ? 'badge badge-info' : 'badge badge-success'}">${rec.patient.urgencyLevel}</span></td>
                    <td><span class="badge badge-info">${(rec.aiScore * 100).toFixed(1)}%</span></td>
                    <td><span class="badge badge-secondary">${(rec.bloodCompatibility * 100).toFixed(1)}%</span></td>
                    <td><span class="badge badge-primary">${(rec.tissueCompatibility * 100).toFixed(1)}%</span></td>
                    <td><span class="badge badge-primary">${(rec.combinedScore * 100).toFixed(1)}%</span></td>
                    <td>${rec.donor.name}</td>
                    <td>${rec.donor.age}</td>
                    <td><span class="badge badge-secondary">${rec.donor.bloodType}</span></td>
                    <td><span class="${qualityClass}"><strong>${qualityText}</strong></span></td>
                    <td><span class="${
                        riskLevel.trim().toLowerCase() === 'low' ? 'badge badge-success' :
                        riskLevel.trim().toLowerCase() === 'medium' ? 'badge badge-warning' :
                        riskLevel.trim().toLowerCase() === 'high' ? 'badge badge-danger' :
                        riskLevel.trim().toLowerCase() === 'very high' ? 'badge badge-darkred' :
                        'badge badge-secondary'
                    }">${riskLevel}</span></td>
                    <td><button class="btn btn-outline-success btn-sm" onclick="App.openIpfsModal(${index})">Save to IPFS</button></td>
                `;
            });
        } else {
            table.innerHTML = '<tr><td colspan="16" class="text-center text-muted">No matches found</td></tr>';
        }

        // Store recommendations globally for access by uploadMatchToIPFS
        window.currentRecommendations = recommendations;

        // Generate enhanced AI insights
        this.generateEnhancedAIInsights(recommendations, patients, donors, aiMatcher);

        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    },

    // Enhanced helper functions
    calculateUrgencyLevel: function(age, organs) {
        const ageNum = parseInt(age);
        let urgency = 'Low';
        
        if (ageNum > 65) urgency = 'High';
        else if (ageNum > 50) urgency = 'Medium';
        
        // Organ-specific urgency
        if (organs.includes('heart') || organs.includes('liver')) {
            urgency = 'Critical';
        } else if (organs.includes('lung')) {
            urgency = 'High';
        }
        
        return urgency;
    },

    calculateBMI: function(weight, height) {
        const weightKg = parseInt(weight);
        const heightM = parseInt(height) / 100;
        return (weightKg / (heightM * heightM)).toFixed(1);
    },

    calculateMedicalRisk: function(age, weight, height) {
        const ageNum = parseInt(age);
        const bmi = this.calculateBMI(weight, height);
        let risk = 0;
        
        if (ageNum > 70) risk += 0.3;
        if (bmi > 30) risk += 0.2;
        if (bmi < 18.5) risk += 0.2;
        
        return Math.min(risk, 1);
    },

    calculateDonorHealthScore: function(age, weight, height) {
        const ageNum = parseInt(age);
        const bmi = this.calculateBMI(weight, height);
        let score = 100;
        
        if (ageNum > 60) score -= 20;
        if (bmi > 30 || bmi < 18.5) score -= 15;
        
        return Math.max(score, 50);
    },

    generateWaitingTime: function() {
        return Math.floor(Math.random() * 365) + 1; // 1-365 days
    },

    generateTransplantHistory: function() {
        return Math.random() > 0.8 ? 1 : 0; // 20% chance of previous transplant
    },

    generateLocation: function() {
        const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
        return cities[Math.floor(Math.random() * cities.length)];
    },

    generateMedicalHistory: function() {
        return Math.random() > 0.9 ? 'Clean' : 'Minor Issues';
    },

    calculateAvailabilityScore: function() {
        return Math.floor(Math.random() * 30) + 70; // 70-100%
    },

    calculateBloodCompatibility: function(donorBlood, patientBlood) {
        // Donor-centric blood type compatibility
        const donorCompatibility = {
            'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
            'O+': ['O+', 'A+', 'B+', 'AB+'],
            'A-': ['A-', 'A+', 'AB-', 'AB+'],
            'A+': ['A+', 'AB+'],
            'B-': ['B-', 'B+', 'AB-', 'AB+'],
            'B+': ['B+', 'AB+'],
            'AB-': ['AB-', 'AB+'],
            'AB+': ['AB+']
        };
        return donorCompatibility[donorBlood] && donorCompatibility[donorBlood].includes(patientBlood) ? 1.0 : 0.0;
    },

    calculateTissueCompatibility: function(patient, donor) {
        // Simulated HLA compatibility (in real system, this would be actual tissue typing)
        let compatibility = 0.5; // Base compatibility
        
        // Age factor
        const ageDiff = Math.abs(patient.age - donor.age);
        if (ageDiff < 10) compatibility += 0.2;
        else if (ageDiff < 20) compatibility += 0.1;
        
        // BMI factor
        const bmiDiff = Math.abs(patient.bmi - donor.bmi);
        if (bmiDiff < 5) compatibility += 0.2;
        else if (bmiDiff < 10) compatibility += 0.1;
        
        // Gender factor (some organs have gender preferences)
        if (patient.gender === donor.gender) compatibility += 0.1;
        
        return Math.min(compatibility, 1.0);
    },

    calculateUrgencyScore: function(urgencyLevel) {
        const urgencyScores = {
            'Critical': 1.0,
            'High': 0.8,
            'Medium': 0.6,
            'Low': 0.4
        };
        return urgencyScores[urgencyLevel] || 0.5;
    },

    getUrgencyBadge: function(urgencyLevel) {
        console.log('Urgency Level:', urgencyLevel); // Debug log
        let badgeClass = '';
        switch(urgencyLevel) {
            case 'Critical':
                badgeClass = 'badge badge-danger';
                break;
            case 'High':
                badgeClass = 'badge badge-warning';
                break;
            case 'Medium':
                badgeClass = 'badge badge-info';
                break;
            case 'Low':
                badgeClass = 'badge badge-success';
                break;
            default:
                badgeClass = 'badge badge-secondary';
        }
        console.log('Urgency Badge Class:', badgeClass); // Debug log
        return `<span class="${badgeClass}">${urgencyLevel}</span>`;
    },

    getRiskBadge: function(riskLevel) {
        console.log('Risk Level:', riskLevel); // Debug log
        let badgeClass = '';
        switch(riskLevel) {
            case 'Low':
                badgeClass = 'badge badge-success';
                break;
            case 'Medium':
                badgeClass = 'badge badge-warning';
                break;
            case 'High':
                badgeClass = 'badge badge-danger';
                break;
            case 'Very High':
                badgeClass = 'badge badge-darkred';
                break;
            default:
                badgeClass = 'badge badge-secondary';
        }
        console.log('Badge Class:', badgeClass); // Debug log
        return `<span class="${badgeClass}">${riskLevel}</span>`;
    },

    generateEnhancedAIInsights: function(recommendations, patients, donors, aiMatcher) {
        const insightsDiv = document.getElementById("aiInsights");
        
        if (recommendations.length === 0) {
            insightsDiv.innerHTML = '<p class="text-muted">No matches found. Consider adding more donors or patients.</p>';
            return;
        }

        // Enhanced statistics
        const avgAIScore = recommendations.reduce((sum, rec) => sum + rec.aiScore, 0) / recommendations.length;
        const avgCombinedScore = recommendations.reduce((sum, rec) => sum + rec.combinedScore, 0) / recommendations.length;
        const excellentMatches = recommendations.filter(rec => rec.combinedScore >= 0.85).length;
        const goodMatches = recommendations.filter(rec => rec.combinedScore >= 0.70 && rec.combinedScore < 0.85).length;
        const criticalPatients = patients.filter(p => p.urgencyLevel === 'Critical').length;
        const highRiskMatches = recommendations.filter(rec => rec.combinedScore < 0.5).length;

        // Find most common organs
        const organCounts = {};
        recommendations.forEach(rec => {
            organCounts[rec.organ] = (organCounts[rec.organ] || 0) + 1;
        });
        const mostCommonOrgan = Object.keys(organCounts).reduce((a, b) => organCounts[a] > organCounts[b] ? a : b);

        // Find best match
        const bestMatch = recommendations[0];

        insightsDiv.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>📊 Enhanced Match Statistics</h6>
                    <ul class="list-unstyled">
                        <li><strong>Total Matches:</strong> ${recommendations.length}</li>
                        <li><strong>Average AI Score:</strong> ${(avgAIScore * 100).toFixed(1)}%</li>
                        <li><strong>Average Combined Score:</strong> ${(avgCombinedScore * 100).toFixed(1)}%</li>
                        <li><strong>Excellent Matches (≥85%):</strong> ${excellentMatches}</li>
                        <li><strong>Good Matches (≥70%):</strong> ${goodMatches}</li>
                        <li><strong>Critical Patients:</strong> ${criticalPatients}</li>
                        <li><strong>High Risk Matches:</strong> ${highRiskMatches}</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6>💡 Enhanced Insights</h6>
                    <ul class="list-unstyled">
                        <li><strong>Most Requested Organ:</strong> ${mostCommonOrgan}</li>
                        <li><strong>Best Match Score:</strong> ${(bestMatch.combinedScore * 100).toFixed(1)}%</li>
                        <li><strong>Patient-Donor Ratio:</strong> ${patients.length}:${donors.length}</li>
                        <li><strong>Enhanced AI Model:</strong> Multi-factor analysis</li>
                        <li><strong>Risk Assessment:</strong> Integrated</li>
                        <li><strong>Urgency Tracking:</strong> Active</li>
                    </ul>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-12">
                    <h6>🏥 Top Medical Recommendation</h6>
                    <div class="alert alert-success">
                        <strong>${bestMatch.patient.name}</strong> (${bestMatch.patient.bloodType}, ${bestMatch.patient.urgencyLevel} urgency) 
                        needs a <strong>${bestMatch.organ}</strong> and matches with 
                        <strong>${bestMatch.donor.name}</strong> (${bestMatch.donor.bloodType}, Health: ${bestMatch.donor.healthScore}%) 
                        with a <strong>${(bestMatch.combinedScore * 100).toFixed(1)}%</strong> compatibility score.
                        <br><small class="text-muted">Risk Level: ${bestMatch.combinedScore >= 0.85 ? 'Low' : bestMatch.combinedScore >= 0.70 ? 'Medium' : 'High'}</small>
                    </div>
                </div>
            </div>
        `;
    },

    openIpfsModal: function(index) {
        window.selectedMatchIndex = index;
        document.getElementById('ipfsPasswordInput').value = '';
        document.getElementById('ipfsPasswordError').textContent = '';
        document.getElementById('ipfsPasswordModal').style.display = 'flex';
    }
}

window.App = App;

window.addEventListener("load", function() {
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545"),
    );

  App.start();
});

window.addEventListener('load', function() {
    const submitBtn = document.getElementById('ipfsPasswordSubmit');
    if (submitBtn) {
        submitBtn.onclick = async function() {
            const password = document.getElementById('ipfsPasswordInput').value;
            if (!password) {
                document.getElementById('ipfsPasswordError').textContent = 'Password is required!';
                return;
            }
            document.getElementById('ipfsPasswordModal').style.display = 'none';
            const match = window.currentRecommendations[window.selectedMatchIndex];
            try {
                const cid = await window.uploadMatchResultToIPFS(match, password);
                document.getElementById('lastIpfsCid').innerHTML =
                  'Last uploaded CID: <code>' + cid + '</code> ' +
                  '<button class="btn btn-outline-primary btn-sm" onclick="navigator.clipboard.writeText(\'' + cid + '\')">Copy</button>';
                alert('Match result uploaded to IPFS!\nCID: ' + cid);
            } catch (err) {
                alert('Failed to upload to IPFS: ' + err.message);
            }
        };
    }
});