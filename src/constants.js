export const NUM_PARTICLES = 1000;
export const SCR_WIDTH = 900;
export const SCR_HEIGHT = 900;
export const G = -10000 * 9.8
export const REST_DENS = 1000.0;
export const GAS_CONST = 1500.0;
export const H = 10.0;
export const HSQ = H * H;
export const MASS = 65.0;
export const VISC = 250.0;
export const DT = 0.0008;

/// smoothing kernels defined in Müller and their gradients
export const POLY6 = 315.0 / (65 * Math.PI * Math.pow(H, 9));
export const SPIKY_GRAD = -45.0 / (Math.PI * Math.pow(H, 6));
export const VISC_LAP = 45.0 / (Math.PI * Math.pow(H, 6));

/// simulation parameters
export const EPS = H;
export const BOUND_DAMPING = -0.5;