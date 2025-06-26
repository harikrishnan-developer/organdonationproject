// Import Web3 JS library
const Web3 = require('web3');
const web3 = new Web3("HTTP://127.0.0.1:7545");

// Import the ABI definition of the DemoContract
const artifact = require('../../build/contracts/DonorContract.json');

// const netid = await web3.eth.net.getId()
const deployedContract = artifact.networks[5777];
const contractAddress = deployedContract.address;

const MIN_GAS = 1000000;

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
    document.getElementById("get"+user+"BloodType").innerHTML = "Blood Type: " + result[3];
    document.getElementById("get"+user+"Organ").innerHTML = "Organ: " + result[4];
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
        const allowedDonorAccount = '0xDcC47A13d3b7162Cb202D7110fEaff9BE84a5e85'.toLowerCase();
        const allowedPatientAccount = '0xfebabf937d7683a0e490061cb8fcd0a9fc3fe3b6'.toLowerCase();
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
                matches.push(result);
            }
        }
        if (matches.length > 0) {
            // Show all matches as a list
            let html = '';
            matches.forEach((result, idx) => {
                html += `<div class='border rounded p-2 mb-2'>` +
                    `<strong>Match ${idx+1}</strong><br>` +
                    `Full Name: ${result[0]}<br>` +
                    `Age: ${result[1]}<br>` +
                    `Gender: ${result[2]}<br>` +
                    `Blood Type: ${result[3]}<br>` +
                    `Organ: ${result[4]}<br>` +
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
        
        // Load random forest model (no training in browser)
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

        // Prepare patient data
        const patients = [];
        for (let i = 0; i < patientCount; i++) {
            const result = await this.contractInstance.methods.getPatient(patientIDs[i]).call();
            const organsArr = [];
            for (let o = 0; o < result[4].length; o++) {
                organsArr.push(result[4][o]);
            }
            patients.push({
                id: patientIDs[i],
                name: result[0],
                age: result[1],
                gender: result[2],
                bloodType: result[3],
                organs: organsArr,
                weight: result[5],
                height: result[6]
            });
        }

        // Prepare donor data
        const donors = [];
        for (let i = 0; i < donorCount; i++) {
            const result = await this.contractInstance.methods.getDonor(donorIDs[i]).call();
            const organsArr = [];
            for (let o = 0; o < result[4].length; o++) {
                organsArr.push(result[4][o]);
            }
            donors.push({
                id: donorIDs[i],
                name: result[0],
                age: result[1],
                gender: result[2],
                bloodType: result[3],
                organs: organsArr,
                weight: result[5],
                height: result[6]
            });
        }

        // Get AI-powered recommendations
        const recommendations = await aiMatcher.getMatchRecommendations(patients, donors);
        
        // Update match count
        document.getElementById("matchCount").innerHTML = recommendations.length;

        // Display matches in table
        const table = document.getElementById("transplantTable");
        table.innerHTML = '';

        if (recommendations.length > 0) {
            // Create table header
            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            const headers = [
                "Rank", "Patient Name", "Patient Age", "Patient Blood", "Organ", 
                "AI Score", "Basic Compatibility", "Combined Score", "Donor Name", 
                "Donor Age", "Donor Blood", "Match Quality"
            ];
            
            headers.forEach(header => {
                const th = document.createElement("th");
                th.textContent = header;
                headerRow.appendChild(th);
            });

            // Create table body
            const tbody = table.createTBody();
            recommendations.forEach((rec, index) => {
                const row = tbody.insertRow();
                
                // Determine match quality color
                let qualityClass = '';
                let qualityText = '';
                if (rec.combinedScore >= 0.8) {
                    qualityClass = 'text-success';
                    qualityText = 'Excellent';
                } else if (rec.combinedScore >= 0.6) {
                    qualityClass = 'text-warning';
                    qualityText = 'Good';
                } else if (rec.combinedScore >= 0.4) {
                    qualityClass = 'text-info';
                    qualityText = 'Fair';
                } else {
                    qualityClass = 'text-danger';
                    qualityText = 'Poor';
                }

                // Determine organ label/icon
                let organLabel = rec.organ;
                switch (rec.organ.toLowerCase()) {
                    case 'heart':
                        organLabel = '❤️ Heart';
                        break;
                    case 'liver':
                        organLabel = 'Liver';
                        break;
                    case 'left lung':
                    case 'right lung':
                        organLabel = '🫁 ' + rec.organ.charAt(0).toUpperCase() + rec.organ.slice(1);
                        break;
                    case 'left kidney':
                    case 'right kidney':
                        organLabel = '🫘 ' + rec.organ.charAt(0).toUpperCase() + rec.organ.slice(1);
                        break;
                    case 'pancreas':
                        organLabel = 'Pancreas';
                        break;
                    case 'intestine':
                        organLabel = 'Intestine';
                        break;
                    default:
                        organLabel = rec.organ;
                }

                row.innerHTML = `
                    <td><strong>${index + 1}</strong></td>
                    <td>${rec.patient.name}</td>
                    <td>${rec.patient.age}</td>
                    <td><span class="badge badge-secondary">${rec.patient.bloodType}</span></td>
                    <td>${organLabel}</td>
                    <td><span class="badge badge-info">${(rec.aiScore * 100).toFixed(1)}%</span></td>
                    <td><span class="badge badge-secondary">${(rec.basicCompatibility * 100).toFixed(1)}%</span></td>
                    <td><span class="badge badge-primary">${(rec.combinedScore * 100).toFixed(1)}%</span></td>
                    <td>${rec.donor.name}</td>
                    <td>${rec.donor.age}</td>
                    <td><span class="badge badge-secondary">${rec.donor.bloodType}</span></td>
                    <td><span class="${qualityClass}"><strong>${qualityText}</strong></span></td>
                `;
            });
        } else {
            table.innerHTML = '<tr><td colspan="12" class="text-center text-muted">No matches found</td></tr>';
        }

        // Generate AI insights
        this.generateAIInsights(recommendations, patients, donors, aiMatcher);

        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    },

    generateAIInsights: function(recommendations, patients, donors, aiMatcher) {
        const insightsDiv = document.getElementById("aiInsights");
        
        if (recommendations.length === 0) {
            insightsDiv.innerHTML = '<p class="text-muted">No matches found. Consider adding more donors or patients.</p>';
            return;
        }

        // Calculate statistics
        const avgAIScore = recommendations.reduce((sum, rec) => sum + rec.aiScore, 0) / recommendations.length;
        const avgCombinedScore = recommendations.reduce((sum, rec) => sum + rec.combinedScore, 0) / recommendations.length;
        const excellentMatches = recommendations.filter(rec => rec.combinedScore >= 0.8).length;
        const goodMatches = recommendations.filter(rec => rec.combinedScore >= 0.6 && rec.combinedScore < 0.8).length;

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
                    <h6>📊 Match Statistics</h6>
                    <ul class="list-unstyled">
                        <li><strong>Total Matches:</strong> ${recommendations.length}</li>
                        <li><strong>Average AI Score:</strong> ${(avgAIScore * 100).toFixed(1)}%</li>
                        <li><strong>Average Combined Score:</strong> ${(avgCombinedScore * 100).toFixed(1)}%</li>
                        <li><strong>Excellent Matches (≥80%):</strong> ${excellentMatches}</li>
                        <li><strong>Good Matches (≥60%):</strong> ${goodMatches}</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6>💡 Key Insights</h6>
                    <ul class="list-unstyled">
                        <li><strong>Most Requested Organ:</strong> ${mostCommonOrgan}</li>
                        <li><strong>Best Match Score:</strong> ${(bestMatch.combinedScore * 100).toFixed(1)}%</li>
                        <li><strong>Patient-Donor Ratio:</strong> ${patients.length}:${donors.length}</li>
                        <li><strong>AI Model Confidence:</strong> High (trained on 10000 records)</li>
                    </ul>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-12">
                    <h6>⭐ Top Recommendation</h6>
                    <div class="alert alert-success">
                        <strong>${bestMatch.patient.name}</strong> (${bestMatch.patient.bloodType}) 
                        needs a <strong>${bestMatch.organ}</strong> and matches with 
                        <strong>${bestMatch.donor.name}</strong> (${bestMatch.donor.bloodType}) 
                        with a <strong>${(bestMatch.combinedScore * 100).toFixed(1)}%</strong> compatibility score.
                    </div>
                </div>
            </div>
        `;
    }

}

window.App = App;

window.addEventListener("load", function() {
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:7545"),
    );

  App.start();
});