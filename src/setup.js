import { NUM_PARTICLES, SCR_WIDTH, SCR_HEIGHT } from './constants';

function onWindowResize(event) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

const container = document.createElement( 'div' );
document.body.appendChild( container );
export const renderer = new THREE.WebGLRenderer();
export const camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 5000 );
camera.position.z = 1400;
export const scene = new THREE.Scene();
var circleGeometry = new THREE.CircleBufferGeometry( 1, 6 );
export const geometry = new THREE.InstancedBufferGeometry();
geometry.index = circleGeometry.index;
geometry.attributes = circleGeometry.attributes;
export const translateArray = new Float32Array( NUM_PARTICLES * 3 );
// randomize particle positions
for ( var i = 0, i3 = 0, l = NUM_PARTICLES; i < l; i ++, i3 += 3 ) {
    translateArray[ i3 + 0 ] = Math.random() * 2 - 1;
    translateArray[ i3 + 1 ] = Math.random() * 2 - 1;
    translateArray[ i3 + 2 ] = 0.0;
}
geometry.addAttribute( 'translate', new THREE.InstancedBufferAttribute( translateArray, 3 ) );
export const material = new THREE.RawShaderMaterial( {
    uniforms: {
        map: { value: new THREE.ImageUtils.loadTexture( 'resources/metaball.png' ) },
    },
    vertexShader: document.getElementById( 'vshader' ).textContent,
    fragmentShader: document.getElementById( 'fshader' ).textContent,
    depthTest: true,
    depthWrite: true,
    transparent: true,
} );
const mesh = new THREE.Mesh( geometry, material );
mesh.scale.set( SCR_WIDTH, SCR_HEIGHT, 1 );
scene.add( mesh );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );
window.addEventListener( 'resize', onWindowResize, false );