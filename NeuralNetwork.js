class NeuralNetwork {
  constructor(a, b, c, d) {
    if (a instanceof tf.Sequential) {
      this.model = a;
      this.input_nodes = b;
      this.hidden_nodes = c;
      this.output_nodes = d;
    } else {
      this.input_nodes = a;
      this.hidden_nodes = b;
      this.output_nodes = c;
      this.model = this.createModel();
    }
  }

  copy() {
    return tf.tidy(() => {
      const modelCopy = this.createModel();
      const weights = this.model.getWeights();
      const weightCopies = [];
      for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone();
      }
      modelCopy.setWeights(weightCopies);
      return new NeuralNetwork(
        modelCopy,
        this.input_nodes,
        this.hidden_nodes,
        this.output_nodes
      );
    });
  }

  mutate(rate) {
    tf.tidy(() => {
      const weights = this.model.getWeights();
      const mutatedWeights = [];

      for (let i = 0; i < weights.length; i++) {
        let tensor = weights[i];
        let shape = weights[i].shape;
        let values = tensor.dataSync().slice();
        for (let j = 0; j < values.length; j++) {
          if (random(1) < rate) {
            values[j] += randomGaussian();
          }
        }
        mutatedWeights[i] = tf.tensor(values, shape);
      }

      this.model.setWeights(mutatedWeights);
    });
  }

  crossover(partner) {
    return tf.tidy(() => {
      const weights = this.model.getWeights();
      const partnerWeights = partner.model.getWeights();
      const crossWeights = [];

      for (let i = 0; i < weights.length; i++) {
        let shape = weights[i].shape;
        let values = weights[i].dataSync().slice();
        let pValues = partnerWeights[i].dataSync().slice();
        for (let j = 0; j < values.length; j++) {
          if (random(1) < 0.5) {
            values[j] = pValues[j];
          }
        }
        crossWeights[i] = tf.tensor(values, shape);
      }

      this.model.setWeights(crossWeights);
    });
  }

  dispose() {
    this.model.dispose();
  }

  predict(inputs) {
    return tf.tidy(() => {
      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs);
      const outputs = ys.dataSync();
      // console.log(outputs);
      return outputs;
    });
  }

  createModel() {
    if (this.hidden_nodes == 0) {
      return tf.sequential({
        layers: [
          tf.layers.dense({
            inputShape: [this.input_nodes],
            units: this.output_nodes,
            activation: "softmax",
          }),
        ],
      });
    } else {
      return tf.sequential({
        layers: [
          tf.layers.dense({
            inputShape: [this.input_nodes],
            units: this.hidden_nodes,
            activation: "relu",
          }),
          tf.layers.dense({
            units: this.output_nodes,
            activation: "softmax",
          }),
        ],
      });
    }
  }
}
