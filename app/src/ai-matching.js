// AI-Powered Transplant Matching System
// Uses machine learning to predict match scores based on donor-patient compatibility

class AITransplantMatcher {
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

    // Simple linear regression model for match score prediction
    trainModel() {
        console.log('[AI-DEBUG] 4. Starting model training...');
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
        if (features.length > 0) {
            console.log('[AI-DEBUG] First feature set for training:');
            console.log(features[0]);
            console.log(`[AI-DEBUG] Corresponding target score: ${targets[0]}`);
        }

        // Simple linear regression using least squares
        this.model = this.trainLinearRegression(features, targets);
        this.isModelTrained = true;
        console.log('[AI-DEBUG] 6. AI model trained successfully.');
        console.log('[AI-DEBUG] Model Coefficients (beta):');
        console.log(this.model.coefficients);
        return true;
    }

    // Train linear regression model
    trainLinearRegression(features, targets) {
        const n = features.length;
        const m = features[0].length;
        
        // Normalize features
        const normalizedFeatures = this.normalizeFeatures(features);
        
        // Add bias term
        const X = normalizedFeatures.map(f => [1, ...f]);
        
        // Calculate coefficients using normal equation
        const XT = this.transpose(X);
        const XTX = this.multiply(XT, X);
        const XTy = this.multiply(XT, targets);
        
        // Solve (X^T * X) * beta = X^T * y
        const beta = this.solveLinearSystem(XTX, XTy);
        
        return {
            coefficients: beta,
            featureMeans: this.calculateMeans(features),
            featureStds: this.calculateStds(features)
        };
    }

    // Normalize features
    normalizeFeatures(features) {
        const means = this.calculateMeans(features);
        const stds = this.calculateStds(features);
        
        return features.map(feature => 
            feature.map((val, i) => (val - means[i]) / (stds[i] || 1))
        );
    }

    // Calculate means
    calculateMeans(features) {
        const m = features[0].length;
        const means = new Array(m).fill(0);
        
        features.forEach(feature => {
            feature.forEach((val, i) => {
                means[i] += val;
            });
        });
        
        return means.map(mean => mean / features.length);
    }

    // Calculate standard deviations
    calculateStds(features) {
        const means = this.calculateMeans(features);
        const m = features[0].length;
        const variances = new Array(m).fill(0);
        
        features.forEach(feature => {
            feature.forEach((val, i) => {
                variances[i] += Math.pow(val - means[i], 2);
            });
        });
        
        return variances.map(variance => Math.sqrt(variance / features.length));
    }

    // Matrix operations
    transpose(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }

    multiply(a, b) {
        if (Array.isArray(b[0])) {
            // Matrix multiplication
            return a.map(row => 
                b[0].map((_, j) => 
                    row.reduce((sum, val, k) => sum + val * b[k][j], 0)
                )
            );
        } else {
            // Matrix-vector multiplication
            return a.map(row => 
                row.reduce((sum, val, i) => sum + val * b[i], 0)
            );
        }
    }

    // Solve linear system using Gaussian elimination
    solveLinearSystem(A, b) {
        const n = A.length;
        const augmented = A.map((row, i) => [...row, b[i]]);
        
        // Forward elimination
        for (let i = 0; i < n; i++) {
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                    maxRow = k;
                }
            }
            
            [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
            
            for (let k = i + 1; k < n; k++) {
                const factor = augmented[k][i] / augmented[i][i];
                for (let j = i; j <= n; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }
        
        // Back substitution
        const x = new Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            let sum = 0;
            for (let j = i + 1; j < n; j++) {
                sum += augmented[i][j] * x[j];
            }
            x[i] = (augmented[i][n] - sum) / augmented[i][i];
        }
        
        return x;
    }

    // Predict match score for a donor-patient-organ combination
    predictMatchScore(donor, patient, organ) {
        if (!this.isModelTrained) {
            console.error('[AI-DEBUG] ERROR: Model not trained, cannot predict.');
            return 0;
        }

        const features = this.encodeFeatures(donor, patient, organ);
        const featureVector = [
            features.donorBlood,
            features.patientBlood,
            features.donorAge,
            features.patientAge,
            features.ageDiff,
            features.organ,
            features.bloodCompatibility
        ];

        console.log('[AI-DEBUG] 7. Predicting score for:', { donor, patient, organ });
        console.log('[AI-DEBUG] Input Features for Prediction:', featureVector);

        // Normalize features
        const normalizedFeatures = featureVector.map((val, i) => 
            (val - this.model.featureMeans[i]) / (this.model.featureStds[i] || 1)
        );

        // Add bias term and predict
        const input = [1, ...normalizedFeatures];
        const prediction = input.reduce((sum, val, i) => 
            sum + val * this.model.coefficients[i], 0
        );

        const finalScore = Math.max(0, Math.min(1, prediction));
        console.log(`[AI-DEBUG] 8. Predicted Score: ${finalScore}`);
        // Ensure prediction is between 0 and 1
        return finalScore;
    }

    // Get match recommendations with AI scores
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