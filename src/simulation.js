import { Vector2 } from 'three';
import {
  NUM_PARTICLES,
  SCR_WIDTH,
  SCR_HEIGHT,
  G,
  REST_DENS,
  GAS_CONST,
  GAUSS_SD,
  H,
  HSQ,
  MASS,
  VISC,
  DT,
  POLY6,
  SPIKY_GRAD,
  VISC_LAP,
  EPS,
  BOUND_DAMPING,
  MOUSE_SCALE,
} from './constants';

let MOUSEX = 0;
let MOUSEY = 0;
let MOUSEDOWN = false;
let mouseV = new Vector2(0.0, 0.0);
let mousePos = new Vector2(0.0, 0.0);

document.body.onmousedown = () => {
  MOUSEDOWN = true;
  mousePos = new Vector2(MOUSEX, MOUSEY);
};

document.body.onmousemove = (event) => {
  // Convert to particle space coords
  const dx = window.innerWidth - SCR_WIDTH;
  const dy = window.innerHeight - SCR_HEIGHT;
  MOUSEX = event.pageX - (dx / 2);
  MOUSEY = SCR_HEIGHT - (event.pageY - (dy / 2));
};

document.body.onmouseup = () => {
  MOUSEDOWN = false;
  mouseV = new Vector2(0.0, 0.0);
};

// TODO: figure out a better way to do this
// position array has positions in format (x, y, z) from ranges -1 -> 1
let positionArray = null;

const getGaussPdf = (dist) => {
  const d = dist / SCR_WIDTH;
  return 1.0 / (GAUSS_SD * Math.sqrt(2.0 * Math.PI)) * Math.exp(-0.5 * ((d / GAUSS_SD) ** 2.0));
};

class Particle {
  constructor(index) {
    // TODO: figure out best way to get position for this particle
    this.index = index;
    this.pos = new Vector2(0.0, 0.0);
    this.v = new Vector2(0.0, 0.0);
    this.f = new Vector2(0.0, 0.0);
    this.rho = 0.0;
    this.p = 0.0;
    this.neighbors = [];
    this.updatePosition();
  }

  // TODO: Check this against Airbnb style
  updatePosition = () => {
    const { pos, index } = this;
    pos.x = ((positionArray[index * 3] + 1) / 2) * SCR_WIDTH;
    pos.y = ((positionArray[index * 3 + 1] + 1) / 2) * SCR_HEIGHT;
  }

  updateBuffer = () => {
    const { pos, index, v } = this;
    positionArray[index * 3] = ((pos.x / SCR_WIDTH) * 2) - 1;
    positionArray[index * 3 + 1] = ((pos.y / SCR_HEIGHT) * 2) - 1;
    // Using z coordinate as velocity
    positionArray[index * 3 + 2] = v.length();
  }

  hash2d = () => {
    const { pos } = this;
    const x = Math.floor(pos.x / H);
    const y = Math.floor(pos.y / H);
    return x + y * SCR_HEIGHT;
  }
}

export default class Simulation {
  constructor(translateArray) {
    positionArray = translateArray;
    this.particles = [];
    this.map = {};
    for (let i = 0; i < NUM_PARTICLES; ++i) {
      this.particles.push(new Particle(i));
    }
  }

  getNeighbors = (particle) => {
    const { map, particles } = this;
    const hash = particle.hash2d();
    const neighbors = map[hash];
    return neighbors
      .map(ni => particles[ni])
      .filter(n => n.index !== particle.index)
      .filter(n => particle.pos.clone().sub(n.pos).lengthSq() < HSQ);
  }

  updateParticles = () => {
    this.handleMouse();
    this.updateNeighbors();
    this.computeDensityPressure();
    this.computeForces();
    this.integrate();
    this.updateParticleBuffers();
  }

  handleMouse = () => {
    if (MOUSEDOWN) {
      const currentPos = new Vector2(MOUSEX, MOUSEY);
      mouseV = currentPos.clone().sub(mousePos);
      mousePos = currentPos;
    }
  }

  updateNeighbors = () => {
    const { particles, getNeighbors } = this;
    this.map = {};
    for (const [i, particle] of particles.entries()) {
      const hash = particle.hash2d();
      if (hash in this.map) {
        this.map[hash].push(i);
      } else {
        this.map[hash] = [i];
      }
    };
    particles.forEach((p) => {
      p.neighbors = getNeighbors(p);
    });
  }

  computeDensityPressure = () => {
    const { particles } = this;
    particles.forEach((p) => {
      p.rho = 0.0;
      p.neighbors.forEach((n) => {
        const r2 = n.pos.clone().sub(p.pos).lengthSq();
        p.rho += MASS * POLY6 * ((HSQ - r2) ** 3.0);
      });
      p.rho += MASS * POLY6 * (HSQ ** 3.0);
      p.p = GAS_CONST * (p.rho - REST_DENS);
    });
  }

  computeForces = () => {
    const { particles } = this;
    particles.forEach((p) => {
      const fpress = new Vector2(0.0, 0.0);
      const fvisc = new Vector2(0.0, 0.0);
      p.neighbors.forEach((n) => {
        const rij = n.pos.clone().sub(p.pos);
        const r = rij.length();
        let temp = -MASS * (p.p + n.p) / (2.0 * n.rho) * SPIKY_GRAD * ((H - r) ** 2.0);
        fpress.add(rij.normalize().multiplyScalar(temp));
        temp = VISC * MASS / n.rho * VISC_LAP * (H - r);
        fvisc.add(n.v.clone().sub(p.v).multiplyScalar(temp));
      });
      const fgrav = new Vector2(0.0, G * p.rho);
      p.f = fpress.add(fvisc).add(fgrav);

      // Mouse Input
      if (MOUSEDOWN) {
        const temp = (mousePos.clone().sub(p.pos)).length();
        const temp2 = mouseV.clone().multiplyScalar(MOUSE_SCALE * getGaussPdf(temp));
        p.f.add(temp2);
      }
    });
  }

  integrate = () => {
    const { particles } = this;
    particles.forEach((p) => {
      const temp = p.f.clone().multiplyScalar(DT).divideScalar(p.rho);
      p.v.add(temp);
      p.pos.add(p.v.clone().multiplyScalar(DT));
      if (p.pos.x - EPS < 0.0) {
        p.v.x *= BOUND_DAMPING;
        p.pos.x = EPS;
      }
      if (p.pos.x + EPS > SCR_WIDTH) {
        p.v.x *= BOUND_DAMPING;
        p.pos.x = SCR_WIDTH - EPS;
      }
      if (p.pos.y - EPS < 0.0) {
        p.v.y *= BOUND_DAMPING;
        p.pos.y = EPS;
      }
      if (p.pos.y + EPS > SCR_HEIGHT) {
        p.v.y *= BOUND_DAMPING;
        p.pos.y = SCR_HEIGHT - EPS;
      }
    });
  }

  updateParticleBuffers = () => {
    const { particles } = this;
    particles.forEach(particle => particle.updateBuffer());
  }
}
