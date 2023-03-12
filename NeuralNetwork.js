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

  mutate(mutationProbability, mutationAmount) {
    tf.tidy(() => {
      const weights = this.model.getWeights();
      const mutatedWeights = [];

      for (let i = 0; i < weights.length; i++) {
        const tensor = weights[i];
        const shape = tensor.shape;

        // Gene mutation probability
        const mask = tf.randomUniform(shape).less(mutationProbability);

        // Gene mutation amount (with .mul(rate))
        const noise = tf.randomNormal(shape).mul(mutationAmount); //.mul(rate);

        // Add noise where mask is true
        const mutated = tf.where(mask, tensor.add(noise), tensor);

        mutatedWeights.push(mutated);
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
        const shape = weights[i].shape;

        const mask = tf.randomUniform(shape).less(0.5);

        // Combine genes from this model and partner model
        const cross = tf.where(mask, partnerWeights[i], weights[i]);

        crossWeights.push(cross);
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
