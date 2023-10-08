export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 750;
export const CHECKPOINT_SIZE = 80;
export const ATTEMPT_FRAMERATE = 60;

export const DRAW_RAYS = false;
export const DRAW_CHECKPOINTS = false;

// Elitism: Keep n best cars from previous generation
export const NUM_OF_ELITES = 2;

// Decouples neural network prediction from animation
// Calculates a forward pass for every car every n frames
export const FORWARD_PASS_SKIP_FRAMES = 3;

// Number of rays to cast from each car
export const NUM_RAYS = 6;

/* 
The AI evolves extremely quickly with this configuration. The AI is 
forced to have foot on gas to encourage fast driving + drifting.

Input: [x velocity, y velocity, ...ray distances]
Output: [steer left, steer right]
*/
const inputLayerSize = 2 + NUM_RAYS;
export const LAYER_SIZES = [inputLayerSize, 6, 2];
