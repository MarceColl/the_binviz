const React = require('react')
const glm = require('gl-matrix')
const twgl = require('twgl.js')

const data_manager = require('../data_manager')

function loadShaderFromDOM(gl, id) {
    var shaderScript = document.getElementById(id);

    // If we don't find an element with the specified id
    // we do an early exit
    if (!shaderScript) {
      return null;
    }

    // Loop through the children for the found DOM element and
    // build up the shader source code as a string
    var shaderSource = "";
    var currentChild = shaderScript.firstChild;
    while (currentChild) {
      if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
        shaderSource += currentChild.textContent;
      }
      currentChild = currentChild.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
}

function setupShaders(gl) {
    let vertexShader = loadShaderFromDOM(gl, "shader-vs");
    let fragmentShader = loadShaderFromDOM(gl, "shader-fs");

    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Failed to setup shaders");
    }
    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "a_position");

    return shaderProgram
}

function throwOnGLError(err, funcName, args) {
    throw WebGLDebugUtil.glEnumToString(err) + " was caused by call to: " + funcName;
};

function rand(min, max) {
    if (max === undefined) {
        max = min;
        min = 0;
    }

    return min + Math.random() * (max - min);
}

class Vis3D extends React.Component {
    constructor(props) {
        super(props)

        this.renderImage = this.renderImage.bind(this)
        this.gl = undefined
        this.vertex_buffer = undefined
        this.shaderProgram = undefined
    }

    componentDidMount() {
        requestAnimationFrame(this.renderImage)
    }

    setupBuffers(gl) {
        const arrays = {
            position: [
                -0.5, -0.5, 0.0,
                -0.5, 0.5, 0.0,
                0.5, -0.5, 0.0,
                -0.5, 0.5, 0.0,
                0.5, 0.5, 0.0,
                0.5, -0.5, 0.0,
            ]
        }

        this.vertex_buffer = twgl.createBufferInfoFromArrays(gl, arrays)

    }

    newData() {
        this.data = data_manager.get_all_data()
        this.refs.file_selector.height = window.innerHeight
        this.refs.detail_selector.height = window.innerHeight
        this.bytes_per_line = this.data.byteLength/this.refs.file_selector.height
        this.updateCanvas()
    }

    setupRenderer() {
        this.gl = this.refs.canvas.getContext('webgl')
        twgl.addExtensionsToContext(this.gl)

        if (!this.gl.drawArraysInstanced || !this.gl.createVertexArray) {
            console.error("need drawArrays Instanced and createVertexArray")
            return
        }

        this.programInfo = twgl.createProgramInfo(this.gl, ["shader-vs", "shader-fs"])

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0)

        this.m4 = twgl.m4;
        const m4 = this.m4;

        if (this.refs.canvas === undefined) {
            return
        }

        if(this.gl === undefined) {
        }


        this.numInstances = 10;
        this.instanceWorlds = new Float32Array(this.numInstances * 16);
        const instanceColors = [];
        const r = 5;

        for (let i = 0; i < this.numInstances; ++i) {
            const mat = new Float32Array(this.instanceWorlds.buffer, i * 16 * 4, 16);
            m4.translation([rand(-r, r), rand(-r, r), rand(-r, r)], mat);
            m4.scale(mat, [0.01, 0.01, 0.01], mat)
            instanceColors.push(0, rand(1), 0);
        }

        const arrays = twgl.primitives.createXYQuadVertices();

        Object.assign(arrays, {
            instanceWorld: {
                numComponents: 16,
                data: this.instanceWorlds,
                divisor: 1
            },
            instanceColor: {
                numComponents: 3,
                data: instanceColors,
                divisor: 1
            }
        })

        this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, arrays);
        this.vertexArrayInfo = twgl.createVertexArrayInfo(this.gl, this.programInfo, this.bufferInfo);

        this.uniforms = {
            u_lightWorldPos: [1, 8, -30],
            u_lightColor: [1, 1, 1, 1],
            u_ambient: [0.0, 0.7, 0, 1],
            u_specular: [1, 1, 1, 1],
            u_shininess: 50,
            u_specularFactor: 1
        }
    }

    renderImage(time) {
        if (this.gl === undefined) {
            this.setupRenderer()
        }

        const data = data_manager.get_current_analysis()

        if (data === undefined) {
            requestAnimationFrame(this.renderImage)
            return
        }

        const gl = this.gl
        const m4 = this.m4
        const uniforms = this.uniforms
        const programInfo = this.programInfo
        const vertexArrayInfo = this.vertexArrayInfo

        const numInstances = data.length

        if (data_manager.has_changed()) {
            let i = 0
            const buffer = new Float32Array(numInstances * 16);
            for (const key in data) {
                if (key === 'length') continue;

                let x = Math.floor(key/1000000)
                let y = Math.floor(key/1000) - (x * 1000)
                let z = Math.floor(key) - (x * 1000000 + y * 1000)

                x = ((x - 128)/256) * 8
                y = ((y - 128)/256) * 8
                z = ((z - 128)/256) * 8

                const mat = new Float32Array(buffer.buffer, i * 16 * 4, 16);
                m4.translation([x, y, z], mat);
                // m4.scale(mat, [1, 1, 1], mat)
                m4.scale(mat, [0.01, 0.01, 0.01], mat)
                i += 1
            }

            twgl.setAttribInfoBufferFromArray(gl,
                this.bufferInfo.attribs.instanceWorld,
                buffer)
        }


        const r = 5;

        const width = document.getElementById('vis').clientWidth
        const height = document.getElementById('vis').clientHeight
        this.refs.canvas.width = width
        this.refs.canvas.height = height


        time *= 0.001;
        // twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.DEPTH_TEST)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        const fov = 30 * Math.PI / 180
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
        const zNear = 0.5
        const zFar = 500
        const projection = m4.perspective(fov, aspect, zNear, zFar);
        const radius = 25;
        const speed = time * .1;
        const eye = [Math.sin(speed) * radius, Math.sin(speed * .7) * 10, Math.cos(speed) * radius]
        const target = [0, 0, 0]
        const up = [0, 1, 0]

        const camera = m4.lookAt(eye, target, up)
        const view = m4.inverse(camera)
        uniforms.u_viewProjection = m4.multiply(projection, view)
        uniforms.u_viewInverse = camera

        gl.useProgram(programInfo.program)

        twgl.setBuffersAndAttributes(gl, programInfo, vertexArrayInfo)
        twgl.setUniforms(programInfo, uniforms)
        twgl.drawBufferInfo(gl, vertexArrayInfo, gl.TRIANGLES, vertexArrayInfo.numelements, 0, numInstances)

        requestAnimationFrame(this.renderImage)
    }

    render() {
        return (
            <canvas ref="canvas" id="3d_vis"></canvas>
        )
    }
}

module.exports = Vis3D
