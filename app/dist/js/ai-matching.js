// AI-Powered Transplant Matching System
// Uses machine learning to predict match scores based on donor-patient compatibility

class AITransplantMatcher {
    constructor() {
        this.rfModel = null; // Random forest model
    }

    // Load the random forest model from JSON
    async loadRandomForestModel() {
        if (this.rfModel) return true;
        try {
            const response = await fetch('../random_forest_model.json');
            this.rfModel = await response.json();
            console.log('✅ Random Forest model loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading random forest model:', error);
            return false;
        }
    }

    // Encode features for the random forest (one-hot encoding to match Python model)
    encodeFeaturesRF(donor, patient, organ) {
        // Create array of 26 features (matching the Python model)
        const features = new Array(26).fill(0);
        
        // Age features (positions 0 and 1)
        features[0] = parseInt(donor.age) || 0;  // Donor_Age
        features[1] = parseInt(patient.age) || 0; // Patient_Age
        
        // Donor Blood Type (positions 2-9)
        const donorBloodType = donor.bloodType;
        if (donorBloodType === 'A+') features[2] = 1;
        else if (donorBloodType === 'A-') features[3] = 1;
        else if (donorBloodType === 'AB+') features[4] = 1;
        else if (donorBloodType === 'AB-') features[5] = 1;
        else if (donorBloodType === 'B+') features[6] = 1;
        else if (donorBloodType === 'B-') features[7] = 1;
        else if (donorBloodType === 'O+') features[8] = 1;
        else if (donorBloodType === 'O-') features[9] = 1;
        
        // Patient Blood Type (positions 10-17)
        const patientBloodType = patient.bloodType;
        if (patientBloodType === 'A+') features[10] = 1;
        else if (patientBloodType === 'A-') features[11] = 1;
        else if (patientBloodType === 'AB+') features[12] = 1;
        else if (patientBloodType === 'AB-') features[13] = 1;
        else if (patientBloodType === 'B+') features[14] = 1;
        else if (patientBloodType === 'B-') features[15] = 1;
        else if (patientBloodType === 'O+') features[16] = 1;
        else if (patientBloodType === 'O-') features[17] = 1;
        
        // Organ (positions 18-25)
        const normalizedOrgan = organ.toLowerCase().replace(/\s+/g, ' ').trim();
        if (normalizedOrgan === 'heart') features[18] = 1;
        else if (normalizedOrgan === 'intestine') features[19] = 1;
        else if (normalizedOrgan === 'left kidney') features[20] = 1;
        else if (normalizedOrgan === 'left lung') features[21] = 1;
        else if (normalizedOrgan === 'liver') features[22] = 1;
        else if (normalizedOrgan === 'pancreas') features[23] = 1;
        else if (normalizedOrgan === 'right kidney') features[24] = 1;
        else if (normalizedOrgan === 'right lung') features[25] = 1;
        
        return features;
    }

    // Traverse a single decision tree for one sample
    traverseTree(tree, features) {
        let node = 0;
        while (tree.feature[node] !== -2) { // -2 means leaf node in sklearn
            const featIdx = tree.feature[node];
            const threshold = tree.threshold[node];
            const featureValue = features[featIdx];
            
            if (featureValue <= threshold) {
                node = tree.children_left[node];
            } else {
                node = tree.children_right[node];
            }
        }
        // Value can be array (for regression, it's a float)
        const leafValue = tree.value[node];
        if (Array.isArray(leafValue)) {
            return leafValue[0];
        }
        return leafValue;
    }

    // Predict with random forest (average of all trees)
    predictMatchScore(donor, patient, organ) {
        if (!this.rfModel) {
            console.error('Random forest model not loaded');
            return 0;
        }
        console.log('🧠 Random forest is being used for prediction');
        const features = this.encodeFeaturesRF(donor, patient, organ);
        let sum = 0;
        for (const tree of this.rfModel.trees) {
            sum += this.traverseTree(tree, features);
        }
        const prediction = sum / this.rfModel.trees.length;
        const normalized = prediction / 100; // Normalize to 0-1
        const finalScore = Math.max(0, Math.min(1, normalized));
        console.log('🎯 AI Score:', (finalScore * 100).toFixed(1) + '%');
        return finalScore;
    }

    // Get match recommendations with AI scores
    async getMatchRecommendations(patients, donors) {
        if (!this.rfModel) {
            await this.loadRandomForestModel();
        }
        const recommendations = [];
        patients.forEach(patient => {
            patient.organs.forEach(patientOrgan => {
                donors.forEach(donor => {
                    donor.organs.forEach(donorOrgan => {
                        if (patientOrgan === donorOrgan) {
                            const aiScore = this.predictMatchScore(
                                { bloodType: donor.bloodType, age: donor.age },
                                { bloodType: patient.bloodType, age: patient.age },
                                patientOrgan
                            );
                            const basicCompatibility = this.calculateBloodCompatibility(
                                donor.bloodType, patient.bloodType
                            );
                            recommendations.push({
                                patient: patient,
                                donor: donor,
                                organ: patientOrgan,
                                aiScore: aiScore,
                                basicCompatibility: basicCompatibility,
                                combinedScore: (aiScore * 0.7) + (basicCompatibility * 0.3)
                            });
                        }
                    });
                });
            });
        });
        // Sort by combined score (highest first)
        return recommendations.sort((a, b) => b.combinedScore - a.combinedScore);
    }

    // Calculate blood compatibility score (0-1)
    calculateBloodCompatibility(donorBlood, patientBlood) {
        const compatibilityMatrix = {
            'O-': { 'O-': 1.0, 'O+': 0.8, 'A-': 0.6, 'A+': 0.4, 'B-': 0.6, 'B+': 0.4, 'AB-': 0.3, 'AB+': 0.2 },
            'O+': { 'O+': 1.0, 'A+': 0.8, 'B+': 0.8, 'AB+': 0.6, 'O-': 0.0, 'A-': 0.0, 'B-': 0.0, 'AB-': 0.0 },
            'A-': { 'A-': 1.0, 'A+': 0.8, 'AB-': 0.6, 'AB+': 0.4, 'O-': 0.0, 'O+': 0.0, 'B-': 0.0, 'B+': 0.0 },
            'A+': { 'A+': 1.0, 'AB+': 0.8, 'A-': 0.0, 'AB-': 0.0, 'O-': 0.0, 'O+': 0.0, 'B-': 0.0, 'B+': 0.0 },
            'B-': { 'B-': 1.0, 'B+': 0.8, 'AB-': 0.6, 'AB+': 0.4, 'O-': 0.0, 'O+': 0.0, 'A-': 0.0, 'A+': 0.0 },
            'B+': { 'B+': 1.0, 'AB+': 0.8, 'B-': 0.0, 'AB-': 0.0, 'O-': 0.0, 'O+': 0.0, 'A-': 0.0, 'A+': 0.0 },
            'AB-': { 'AB-': 1.0, 'AB+': 0.0, 'A-': 0.0, 'B-': 0.0, 'O-': 0.0, 'O+': 0.0, 'A+': 0.0, 'B+': 0.0 },
            'AB+': { 'AB+': 1.0, 'AB-': 0.0, 'A-': 0.0, 'A+': 0.0, 'B-': 0.0, 'B+': 0.0, 'O-': 0.0, 'O+': 0.0 }
        };
        return compatibilityMatrix[donorBlood]?.[patientBlood] || 0;
    }
}

// Export for use in main.js
window.AITransplantMatcher = AITransplantMatcher; 