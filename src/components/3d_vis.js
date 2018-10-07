const React = require('react')
const glm = require('gl-matrix')

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
    vertexShader = loadShaderFromDOM(gl, "shader-vs");
    fragmentShader = loadShaderFromDOM(gl, "shader-fs");
    
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Failed to setup shaders");
    }
    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition"); 

    console.log('shader setup')
    return shaderProgram
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

    setupBuffers() {
        this.vertex_buffer = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer)
        const quad = [
            -0.5, -0.5, 0.0,
            -0.5, 0.5, 0.0,
            0.5, -0.5, 0.0,
            -0.5, 0.5, 0.0,
            0.5, 0.5, 0.0,
            0.5, -0.5, 0.0
        ]
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(quad), this.gl.STATIC_DRAW)
        this.vertex_buffer.itemSize = 3
        this.vertex_buffer.numberOfItems = 6

        console.log('Buffers setup')
    }

    renderImage() {
        if (this.refs.canvas === undefined) {
            return
        }

        if(this.gl === undefined) {
            this.gl = this.refs.canvas.getContext('webgl')
            this.shaderProgram = setupShaders(this.gl)
            this.setupBuffers()

            this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
        }

        const width = document.getElementById('vis').clientWidth
        const height = document.getElementById('vis').clientHeight
        this.refs.canvas.width = width
        this.refs.canvas.height = height

        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)

        this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,
            this.vertex_buffer.itemSize, this.gl.FLOAT, false, 0, 0)
        
        this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute)

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertex_buffer)
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertex_buffer.numberOfItems)

        requestAnimationFrame(this.renderImage)
    }

    render() {
        return (
            <canvas ref="canvas" id="3d_vis"></canvas>
        )
    }
}

module.exports = Vis3D