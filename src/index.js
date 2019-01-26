import * as THREE from 'three';
import {
    renderer,
    material,
    geometry,
    translateArray,
    scene,
    camera,
} from './setup';
import Simulation from './simulation';

let simulation = new Simulation(translateArray);

function animate() {
    requestAnimationFrame( animate );
    render();
}
function render() {
    simulation.updateParticles(translateArray);
    // TODO: Find out if there's a better way to update the translate buffer
    geometry.addAttribute( 'translate', new THREE.InstancedBufferAttribute( translateArray, 3 ) );
    renderer.render(scene, camera);
}

animate();