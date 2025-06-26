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
            const response = await fetch('../../random_forest_model.json');
            this.rfModel = await response.json();
            return true;
        } catch (error) {
            console.error('Error loading random forest model:', error);
            return false;
        }
    }

    // Encode features for the random forest (same as Python)
    encodeFeaturesRF(donor, patient, organ) {
        const blood_type_map = this.rfModel?.blood_type_map || {
            'O-': 0, 'O+': 1, 'A-': 2, 'A+': 3, 'B-': 4, 'B+': 5, 'AB-': 6, 'AB+': 7
        };
        const organ_type_map = this.rfModel?.organ_type_map || {
            'heart': 0, 'liver': 1, 'left kidney': 2, 'right kidney': 3, 'left lung': 4, 'right lung': 5, 'pancreas': 6, 'intestine': 7
        };
        return [
            blood_type_map[donor.bloodType] ?? 0,
            parseInt(donor.age) || 0,
            blood_type_map[patient.bloodType] ?? 0,
            parseInt(patient.age) || 0,
            organ_type_map[organ.toLowerCase()] ?? 0
        ];
    }

    // Traverse a single decision tree for one sample
    traverseTree(tree, features) {
        let node = 0;
        while (tree.feature[node] !== -2) { // -2 means leaf node in sklearn
            const featIdx = tree.feature[node];
            if (features[featIdx] <= tree.threshold[node]) {
                node = tree.children_left[node];
        } else {
                node = tree.children_right[node];
            }
        }
        // Value can be array (for regression, it's a float)
        if (Array.isArray(tree.value[node])) {
            return tree.value[node][0];
        }
        return tree.value[node];
    }

    // Predict with random forest (average of all trees)
    predictMatchScore(donor, patient, organ) {
        if (!this.rfModel) {
            console.error('Random forest model not loaded');
            return 0;
        }
        console.log('Random forest is being used for prediction'); // Debug log
        const features = this.encodeFeaturesRF(donor, patient, organ);
        let sum = 0;
        for (const tree of this.rfModel.trees) {
            sum += this.traverseTree(tree, features);
        }
        const prediction = sum / this.rfModel.n_trees;
        // Clamp between 0 and 1
        return Math.max(0, Math.min(1, prediction));
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
            'AB-': { 'AB-': 1.0, 'AB+': 0.8, 'A-': 0.0, 'B-': 0.0, 'O-': 0.0, 'O+': 0.0, 'A+': 0.0, 'B+': 0.0 },
            'AB+': { 'AB+': 1.0, 'AB-': 0.0, 'A-': 0.0, 'A+': 0.0, 'B-': 0.0, 'B+': 0.0, 'O-': 0.0, 'O+': 0.0 }
        };
        return compatibilityMatrix[donorBlood]?.[patientBlood] || 0;
    }
}

// Export for use in main.js
window.AITransplantMatcher = AITransplantMatcher; 