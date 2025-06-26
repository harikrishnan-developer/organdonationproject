import { RandomForestRegression } from 'ml-random-forest';

// AI-Powered Transplant Matching System
// Uses machine learning to predict match scores based on donor-patient compatibility

export default class AITransplantMatcher {
    constructor() {
        this.trainingData = [];
        this.model = null;
        this.isModelTrained = false;
    }

    // Load and preprocess the training data
    async loadTrainingData() {
        const csvFilePath = './transplant_dataa.csv';
        console.log(`[AI-DEBUG] 1. Starting to load training data from '${csvFilePath}'...`);
        try {
            const response = await fetch(csvFilePath);
            if (!response.ok) {
                console.error(`[AI-DEBUG] ERROR: Failed to fetch '${csvFilePath}'. Status: ${response.status}`);
                return false;
            }
            const csvText = await response.text();
            console.log('[AI-DEBUG] 2. CSV file fetched successfully.');
            this.trainingData = this.parseCSV(csvText);
            console.log(`[AI-DEBUG] 3. CSV parsed. Found ${this.trainingData.length} records.`);
            if (this.trainingData.length > 0) {
                console.log('[AI-DEBUG] First parsed record:');
                console.table(this.trainingData[0]);
            }
            return true;
        } catch (error) {
            console.error('[AI-DEBUG] FATAL ERROR in loadTrainingData:', error);
            return false;
        }
    }

    // Parse CSV data
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const values = lines[i].split(',');
            const record = {};
            
            headers.forEach((header, index) => {
                record[header.trim()] = values[index] ? values[index].trim() : '';
            });
            
            data.push(record);
        }

        return data;
    }

    // Feature engineering - convert categorical data to numerical
    encodeFeatures(donor, patient, organ) {
        // Blood type encoding (O-, O+, A-, A+, B-, B+, AB-, AB+)
        const bloodTypeEncoding = {
            'O-': 0, 'O+': 1, 'A-': 2, 'A+': 3, 
            'B-': 4, 'B+': 5, 'AB-': 6, 'AB+': 7
        };

        // Organ encoding
        const organEncoding = {
            'heart': 0, 'liver': 1, 'left kidney': 2, 'right kidney': 3,
            'left lung': 4, 'right lung': 5, 'pancreas': 6, 'intestine': 7
        };

        // Age difference feature
        const ageDiff = Math.abs(donor.age - patient.age);
        
        // Blood compatibility score (basic rules)
        const bloodCompatibility = this.calculateBloodCompatibility(donor.bloodType, patient.bloodType);

        return {
            donorBlood: bloodTypeEncoding[donor.bloodType] || 0,
            patientBlood: bloodTypeEncoding[patient.bloodType] || 0,
            donorAge: parseInt(donor.age) || 0,
            patientAge: parseInt(patient.age) || 0,
            ageDiff: ageDiff,
            organ: organEncoding[organ] || 0,
            bloodCompatibility: bloodCompatibility
        };
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

    // Train the Random Forest model for match score prediction
    trainModel() {
        console.log('[AI-DEBUG] 4. Starting Random Forest model training...');
        if (this.trainingData.length === 0) {
            console.error('[AI-DEBUG] ERROR: Cannot train model, no training data.');
            return false;
        }

        // Prepare training features and targets
        const features = [];
        const targets = [];

        this.trainingData.forEach(record => {
            if (record.Match_Score && record.Donor_Blood && record.Patient_Blood && record.Organ) {
                const featureVector = this.encodeFeatures(
                    { bloodType: record.Donor_Blood, age: record.Donor_Age },
                    { bloodType: record.Patient_Blood, age: record.Patient_Age },
                    record.Organ
                );

                features.push([
                    featureVector.donorBlood,
                    featureVector.patientBlood,
                    featureVector.donorAge,
                    featureVector.patientAge,
                    featureVector.ageDiff,
                    featureVector.organ,
                    featureVector.bloodCompatibility
                ]);

                targets.push(parseFloat(record.Match_Score));
            }
        });

        console.log(`[AI-DEBUG] 5. Prepared ${features.length} feature sets for training.`);
        if (features.length === 0) {
            console.error('[AI-DEBUG] ERROR: No valid features to train on.');
            return false;
        }

        if (features.length > 0) {
            console.log('[AI-DEBUG] First feature set for training:');
            console.log(features[0]);
            console.log(`[AI-DEBUG] Corresponding target score: ${targets[0]}`);
        }
        
        // Train Random Forest Regression model
        const options = {
            seed: 3,
            maxFeatures: 4,
            replacement: false,
            nEstimators: 100 // Number of trees in the forest
        };

        this.model = new RandomForestRegression(options);
        this.model.train(features, targets);
        this.isModelTrained = true;
        console.log('[AI-DEBUG] 6. AI Random Forest model trained successfully.');
        return true;
    }

    // Predict match score using the trained model
    predictMatchScore(donor, patient, organ) {
        if (!this.isModelTrained || !this.model) {
            if (localStorage.getItem('aiDebug') === 'true') {
                console.warn('[AI-DEBUG] WARNING: Model not trained. Falling back to basic compatibility score.');
            }
            // Fallback to basic compatibility if model is not ready
            return this.calculateBloodCompatibility(donor.bloodType, patient.bloodType);
        }

        const featureVector = this.encodeFeatures(donor, patient, organ);
        const features = [
            featureVector.donorBlood,
            featureVector.patientBlood,
            featureVector.donorAge,
            featureVector.patientAge,
            featureVector.ageDiff,
            featureVector.organ,
            featureVector.bloodCompatibility
        ];

        // Random Forest prediction
        const prediction = this.model.predict([features]);
        let score = prediction[0];
        
        // Clamp the score to be between 0 and 1
        score = Math.max(0, Math.min(1, score));

        if (localStorage.getItem('aiDebug') === 'true') {
            console.log(`[AI-DEBUG] AI Prediction for ${donor.name} -> ${patient.name} (${organ}):`);
            console.log(`[AI-DEBUG]   - Features:`, features);
            console.log(`[AI-DEBUG]   - Predicted Score: ${score.toFixed(4)}`);
        }
        
        return score;
    }

    // Get ranked match recommendations for all patients and donors
    async getMatchRecommendations(patients, donors) {
        if (!this.isModelTrained) {
            await this.loadTrainingData();
            this.trainModel();
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
}

// Export for use in main.js
window.AITransplantMatcher = AITransplantMatcher; 