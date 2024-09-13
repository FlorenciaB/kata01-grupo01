class FeatureFlag {
    constructor(name, options, engine) {
        this.name = name;
        this.options = options;
        this.engine = engine;
    }
}

class RoundRobinEngine {
    constructor() {
        this.index = 0;
    }

    selectOption(flag) {
        const option = flag.options[this.index];
        this.index = (this.index + 1) % flag.options.length;
        return option;
    }
}

class RandomWeightEngine {
    constructor(weights) {
        this.weights = weights;
        if (this.weights.reduce((a, b) => a + b) !== 1) {
            throw new Error("Los pesos deben sumar 1");
        }
    }

    selectOption(flag) {
        const randomValue = Math.random();
        let cumulativeWeight = 0;

        for (let i = 0; i < flag.options.length; i++) {
            cumulativeWeight += this.weights[i];
            if (randomValue <= cumulativeWeight) {
                return flag.options[i];
            }
        }

        return flag.options[flag.options.length - 1];
    }
}

class FeatureFlagSystem {
    constructor() {
        this.clientSelections = {};
    }

    getFeatureFlag(clientId, flag) {
        if (!this.clientSelections[clientId]) {
            this.clientSelections[clientId] = {};
        }

        if (this.clientSelections[clientId][flag.name]) {
            return this.clientSelections[clientId][flag.name];
        }

        const selectedOption = flag.engine.selectOption(flag);
        this.clientSelections[clientId][flag.name] = selectedOption;
        return selectedOption;
    }
}

//Pruebas realizadas
const featureFlagSystem = new FeatureFlagSystem();

const roundRobinFlag = new FeatureFlag(
    "Prueba de Round Robin",
    ["Alfa", "Beta", "Gamma"],
    new RoundRobinEngine()
);

const randomWeightFlag = new FeatureFlag(
    "Prueba de Random Weight",
    ["Pera", "Manzana", "Naranja"],
    new RandomWeightEngine([0.5, 0.3, 0.2])
);

console.log(featureFlagSystem.getFeatureFlag("cliente1", roundRobinFlag));
console.log(featureFlagSystem.getFeatureFlag("cliente2", roundRobinFlag));
console.log(featureFlagSystem.getFeatureFlag("cliente1", roundRobinFlag));
console.log(featureFlagSystem.getFeatureFlag("cliente3", roundRobinFlag));
console.log(featureFlagSystem.getFeatureFlag("cliente4", roundRobinFlag));
console.log(featureFlagSystem.getFeatureFlag("cliente3", roundRobinFlag));

console.log(featureFlagSystem.getFeatureFlag("cliente1", randomWeightFlag));
console.log(featureFlagSystem.getFeatureFlag("cliente2", randomWeightFlag));
console.log(featureFlagSystem.getFeatureFlag("cliente1", randomWeightFlag));
console.log(featureFlagSystem.getFeatureFlag("cliente4", randomWeightFlag));
console.log(featureFlagSystem.getFeatureFlag("cliente3", randomWeightFlag));
console.log(featureFlagSystem.getFeatureFlag("cliente4", randomWeightFlag));