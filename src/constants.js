export const NUM_PARTICLES = 2000;
export const MOUSE_SCALE = 20000.0;
export const SCR_WIDTH = 400;
export const SCR_HEIGHT = 400;
export const G = -10000 * 9.8;
export const REST_DENS = 1000.0;
export const GAS_CONST = 1500.0;
export const H = 6.0;
export const HSQ = H * H;
export const MASS = 65.0;
export const VISC = 250.0;
export const DT = 0.0008;
export const GAUSS_SD = 0.05;

// smoothing kernels defined in Müller and their gradients
export const POLY6 = 315.0 / (65.0 * Math.PI * (H ** 9.0));
export const SPIKY_GRAD = -45.0 / (Math.PI * (H ** 6.0));
export const VISC_LAP = 45.0 / (Math.PI * (H ** 6.0));

// simulation parameters
export const EPS = H;
export const BOUND_DAMPING = -0.5;
