const POPULATION_SIZE = 40;
let simulationSpeed = 1;
const MIN_MUTATION_RATE = 0.01;
const MAX_MUTATION_RATE = 0.1;

let state = "player-drive";
let generation_num = 1;
let population_alive = POPULATION_SIZE;

let saved_nn;

let population = [];
let walls = [];

let stats_padding, stats_x1, stats_y1, stats_x2, stats_y2;
let counter = 0;
let fps = 0;

/********************************************************************
 *********************************************************************
 *********************************************************************/

function preload() {
  yellowCarImg = loadImage("img/yellowcar.png");
  redCarImg = loadImage("img/redcar.png");
  blueCarImg = loadImage("img/bluecar.png");
}

// Setup is ran once at the beginning of the page being loaded
function setup() {
  var canvas = createCanvas(
    windowWidth,
    document.getElementById("sketch-holder").offsetHeight
  );
  canvas.parent("sketch-holder");

  /*
  This one line increases the speed of the simulation by 2-3x. 

  CPU is dramatically faster than webgl in this case because my models are extremely small and 
  the overhead of transferring data to the GPU is surprisingly large.
  */
  tf.setBackend("cpu");

  imageMode(CENTER);
  rectMode(CORNERS);

  // Draw outer walls
  x = 50;
  walls.push(new Wall(x, x, width - x, x));
  walls.push(new Wall(x, height - x, width - x, height - x));
  walls.push(new Wall(width - x, x, width - x, height - x));
  walls.push(new Wall(x, x, x, height - x));

  // Draw inner walls
  x = 350;
  walls.push(new Wall(x, x, width - x, x));
  walls.push(new Wall(x, height - x, width - x, height - x));
  walls.push(new Wall(width - x, x, width - x, height - x));
  walls.push(new Wall(x, x, x, height - x));

  // Dimensions for stats box when training
  stats_padding = 10;
  stats_x1 = 25;
  stats_y1 = height - 160;
  stats_x2 = stats_x1 + 200;
  stats_y2 = stats_y1 + 140;

  player = new PlayerVehicle();
}

/********************************************************************
 *********************************************************************
 *********************************************************************/

// Draw is ran every frame
function draw() {
  for (let n = 0; n < simulationSpeed; n++) {
    background(60);
    counter += 1;

    for (let wall of walls) {
      wall.show();
    }

    if (state == "player-drive") {
      player.update();
      player.show();
    }

    if (state == "generation_training") {
      let total_speed = 0;

      for (let i = 0; i < POPULATION_SIZE; i++) {
        population[i].update();
        population[i].show();
        total_speed += population[i].getVel();
      }

      draw_stats_box(total_speed);
    }

    if (state == "race") {
      population[0].update();
      population[0].show();
      player.update();
      player.show();
    }
  }
}

/********************************************************************
 *********************************************************************
 *********************************************************************/

function draw_stats_box(total_speed) {
  // Draw box around stats
  fill(0, 99);
  noStroke();
  rect(
    stats_x1 - stats_padding,
    stats_y1 - stats_padding,
    stats_x2 + stats_padding,
    stats_y2 + stats_padding
  );

  // Draw stats at bottom left of screen
  if (population_alive == 0) average_speed = 0;
  else average_speed = total_speed / population_alive;

  if (counter % 100 == 0) fps = round(frameRate());

  textSize(20);
  fill(255);
  textAlign(LEFT);
  noStroke();
  let s =
    `Generation: ${generation_num}\n` +
    `Population: ${POPULATION_SIZE}\n` +
    `Alive: ${population_alive}\n` +
    `Average Speed: ${round(average_speed, 2)}\n` +
    `Frame Rate: ${fps}`;
  text(s, stats_x1, stats_y1, stats_x2, stats_y2);
}

// `Mutation Rate: ${(MUTATION_RATE * 100).toFixed(2)}%\n` +

function initialize_random_population() {
  update_alert("");
  state = "generation_training";
  generation_num = 1;
  population = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    population.push(new AIVehicle());
  }
  population_alive = POPULATION_SIZE;
}

function race_saved_vehicle() {
  if (!saved_nn) {
    console.log("No saved vehicle!");
    update_alert("No saved vehicle!");
  } else {
    state = "race";
    population = [];
    player = new PlayerVehicle();
    population.push(new AIVehicle(saved_nn));
    population_alive = 1;
  }
}

function load_trained_model() {
  if (!trained_nn) {
    console.log("Trained model files missing!");
    update_alert("Trained model files missing!");
  } else {
    update_alert("");
    state = "race";
    population = [];
    player = new PlayerVehicle();
    population.push(new AIVehicle(trained_nn));
    saved_nn = trained_nn;
    population_alive = 1;
  }
}

function get_chosen_vehicles() {
  // Get list of user selected vehicles
  chosen_vehicles = [];
  if (state == "player-drive") {
    console.log("Initialize population first!");
    update_alert("Initialize population first!");
  }
  if (state == "generation_training") {
    for (let i = 0; i < POPULATION_SIZE; i++) {
      if (population[i].selected) {
        chosen_vehicles.push(population[i]);
      }
    }
  }
  if (state == "race") {
    if (population[0].selected) chosen_vehicles.push(population[0]);
  }
  return chosen_vehicles;
}

function new_generation() {
  if (state == "player-drive") {
    console.log("Initialize population first!");
    update_alert("Initialize a population first!");
    return;
  }

  chosen_vehicles = get_chosen_vehicles();
  // User did not select any vehicles
  if (chosen_vehicles.length == 0) {
    console.log("No cars selected!");
    update_alert("Click the best performing cars first!");
    return;
  }

  // If only one vehicle is selected, copy and mutate its neural network for the entire population
  // The chosen parent lives unmutated in the next generation (elitism)
  if (chosen_vehicles.length == 1) {
    population[0] = new AIVehicle(chosen_vehicles[0].getNeuralNetwork());
    for (let i = 1; i < POPULATION_SIZE; i++) {
      let child_nn = chosen_vehicles[0].getNeuralNetwork();
      variableMutation = map(
        i,
        0,
        POPULATION_SIZE,
        MIN_MUTATION_RATE,
        MAX_MUTATION_RATE
      );
      child_nn.mutate(variableMutation);
      population[i] = new AIVehicle(child_nn);
    }
  }
  // If two or more vehicles are selected, randomly pick two chosen vehicles and cross and mutate their neural networks
  // Two of the chosen parents live unmutated in the next generation (elitism)
  else {
    population[0] = new AIVehicle(chosen_vehicles[0].getNeuralNetwork());
    population[1] = new AIVehicle(chosen_vehicles[1].getNeuralNetwork());
    for (let i = 2; i < POPULATION_SIZE; i++) {
      let parent_1 =
        chosen_vehicles[Math.floor(Math.random() * chosen_vehicles.length)];
      let parent_2 =
        chosen_vehicles[Math.floor(Math.random() * chosen_vehicles.length)];
      let nn_1 = parent_1.getNeuralNetwork();
      let nn_2 = parent_2.getNeuralNetwork();
      nn_1.crossover(nn_2);
      variableMutation = map(
        i,
        0,
        POPULATION_SIZE,
        MIN_MUTATION_RATE,
        MAX_MUTATION_RATE
      );
      nn_1.mutate(variableMutation);
      population[i] = new AIVehicle(nn_1);
    }
  }

  update_alert("");
  state = "generation_training";
  generation_num++;
  population_alive = POPULATION_SIZE;
}

function save_selected_vehicle() {
  if (state == "player-drive") {
    console.log("Initialize a population first!");
    update_alert("Initialize a population first!");
  }

  if (state == "generation_training" || state == "race") {
    chosen_vehicles = get_chosen_vehicles();

    if (chosen_vehicles.length == 0) {
      console.log("No vehicle selected!");
      update_alert("No car selected, click on a car!");
    } else {
      saved_nn = chosen_vehicles[0].getNeuralNetwork();
      update_alert("");
    }
  }
}

function mouseClicked() {
  if (state == "generation_training") {
    for (let i = 0; i < POPULATION_SIZE; i++) {
      population[i].checkIfMouseOver();
    }
  }

  if (state == "race") {
    population[0].checkIfMouseOver();
  }
}

function keyPressed() {
  key = key.toUpperCase();
  switch (key) {
    case "I":
      initialize_random_population();
      break;
    case "G":
      new_generation();
      break;
    case "S":
      save_selected_vehicle();
      break;
    case "R":
      race_saved_vehicle();
      break;
  }
}

function update_alert(text) {
  $("#alert-div").text(text);
}
