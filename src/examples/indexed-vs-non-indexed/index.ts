import { Renderer, Camera, Transform, Geometry, Program, Mesh } from '../../';

const vertex = /* glsl */ `
            precision highp float;
            precision highp int;

            attribute vec2 uv;
            attribute vec3 position;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;

            varying vec2 vUv;

            void main() {
                vUv = uv;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

const fragment = /* glsl */ `
            precision highp float;
            precision highp int;

            uniform float uTime;

            varying vec2 vUv;

            void main() {
                gl_FragColor.rgb = 0.5 + 0.3 * sin(vUv.yxx + uTime) + vec3(0.2, 0.0, 0.1);
                gl_FragColor.a = 1.0;
            }
        `;

const renderer = new Renderer();
const gl = renderer.gl;
document.body.appendChild(gl.canvas);
gl.clearColor(1, 1, 1, 1);

const camera = new Camera(gl, { fov: 15 });
camera.position.z = 15;

function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
}
window.addEventListener('resize', resize, false);
resize();

const scene = new Transform();

// 4 vertices, using 6 indices to designate 2 triangles using the default gl.TRIANGLES draw mode
const indexedGeometry = new Geometry(gl, {
    position: {
        size: 3,
        data: new Float32Array([
            -0.5,
            0.5,
            0, // vertex 0
            -0.5,
            -0.5,
            0, // vertex 1
            0.5,
            0.5,
            0, // vertex 2
            0.5,
            -0.5,
            0, // vertex 3
        ]),
    },
    uv: {
        size: 2,
        data: new Float32Array([
            0,
            1, // vertex 0
            1,
            1, // vertex 1
            0,
            0, // vertex 2
            1,
            0, // vertex 3
        ]),
    },

    // the indices attribute must use the name 'index' to be treated as an ELEMENT_ARRAY_BUFFER
    index: { data: new Uint16Array([0, 1, 2, 1, 3, 2]) },
});

// To recreate the same square using non-indexed geometry, 6 vertices need to be passed in, including 2 duplicates.
// If only the original 4 vertices were supplied, only one triangle would be drawn.
const nonIndexedGeometry = new Geometry(gl, {
    position: {
        size: 3,
        data: new Float32Array([
            -0.5,
            0.5,
            0, // vertex 0
            -0.5,
            -0.5,
            0, // vertex 1
            0.5,
            0.5,
            0, // vertex 2
            -0.5,
            -0.5,
            0, // vertex 1
            0.5,
            -0.5,
            0, // vertex 3
            0.5,
            0.5,
            0, // vertex 2
        ]),
    },
    uv: {
        size: 2,
        data: new Float32Array([
            0,
            1, // vertex 0
            1,
            1, // vertex 1
            0,
            0, // vertex 2
            1,
            1, // vertex 1
            1,
            0, // vertex 3
            0,
            0, // vertex 2
        ]),
    },
});

const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
        uTime: { value: 0 },
    },
});

const indexedMesh = new Mesh(gl, { geometry: indexedGeometry, program });
indexedMesh.setParent(scene);
indexedMesh.position.y = 0.9;

const nonIndexedMesh = new Mesh(gl, { geometry: nonIndexedGeometry, program });
nonIndexedMesh.setParent(scene);
nonIndexedMesh.position.y = -0.9;

requestAnimationFrame(update);
function update(t) {
    requestAnimationFrame(update);

    program.uniforms.uTime.value = t * 0.001;
    renderer.render({ scene, camera });
}

document.getElementsByClassName('Info')[0].innerHTML = 'Indexed vs Non-Indexed';
document.title = 'OGL • Indexed vs Non-Indexed';
