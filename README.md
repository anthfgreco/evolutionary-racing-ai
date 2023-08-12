<div align="center">
  <img src="https://img.shields.io/github/last-commit/anthfgreco/evolutionary-racing-ai" 
       alt="GitHub Last Commit"/>
  <img src="https://img.shields.io/github/repo-size/anthfgreco/evolutionary-racing-ai" 
       alt"GitHub Repo Size"/>
</div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/anthfgreco/evolutionary-racing-ai">
    <img src="favicon\android-chrome-192x192.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Evolutionary Racing AI</h3>

  <p align="center">
    Watch cars learn to drive using neuro-evolution.
  </p>
  <p align="center">
    Demo: <a href="https://evolutionary-racing-ai.vercel.app/">evolutionary-racing-ai.vercel.app</a>
  </p>
</div>

## About

The aim of this project is to visualize the evolution process of a car learning to drive. The neural network of the car is trained using [neuro-evolution](https://en.wikipedia.org/wiki/Neuroevolution), a genetic algorithm that uses a fitness function to determine the best neural networks.

### Built With

- [React](https://reactjs.org/) for user interface, changing simulation variables, and displaying stats
- [p5.js](https://p5js.org/) for racing visualization
- [TensorFlow.js](https://www.tensorflow.org/js) for neural networks
- [Base Web](https://baseweb.design/) for styling and React UI components
- [Vite](https://vitejs.dev/) for snappy React development

## Development

- Clone or fork project then navigate to the project folder
- Install dependencies with `npm install`
- Run development server with `npm run dev`

## Roadmap

- [x] Drifting physics
- [x] Migrate from ml5.js to TensorFlow.js
- [x] Drivable car to race against computer
- [x] Load pre-trained neural net
- [x] Explanation + helper text below canvas
- [x] Control panel to change simulation variables
- [x] Port to React
- [ ] Option to change map to see if car can generalize or if it overfit
  - [ ] Use different maps each generation to prevent overfitting
- [ ] Buttons for racing current best AI and pre-trained AI
- [ ] Graph or table of best fitness over time
- [ ] Publish to GitHub Pages or Vercel
