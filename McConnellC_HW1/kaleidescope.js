// webgl and canvas
let canvas
let gl

// attributes and uniforms of vertex shader
let vCenter
let vTheta
let vPosition

// rotation
let radianAngle = (3.149/4)/60.0
let theta = 0.0
let theta2 = 0.0

// centers for translation
let centers = [
	[0,0.8],
	[0.8,0],
	[0,-0.8],
	[-0.8,0],
	[-0.7,0.4],
	[-0.4,0.7],
	[0.4,0.7],
	[0.7,0.4],
	[0.7,-0.4],
	[0.4,-0.7],
	[-0.4,-0.7],
	[-0.7,-0.4]
];

window.onload = function init()
{
    // set up webgl using canvas
    canvas = document.getElementById("gl-canvas")

    gl = WebGLUtils.setupWebGL(canvas)
    if ( !gl ) { alert("WebGL isn't available") }

    // draw to whole canvas
    gl.viewport(0, 0, canvas.width, canvas.height)

    // background color white
    gl.clearColor(1.0, 1.0, 1.0, 1.0)

    // set up shaders and define them to be used
    let program = initShaders(gl, "vertex-shader", "fragment-shader")
    gl.useProgram(program)

    // used for drawing geometry
    let vertices = [
        vec2(0,0.2), vec2(-0.067,0.133), vec2(0.067,0.133),
		vec2(-0.067,0.133), vec2(-0.133,0.067), vec2(0,0.067),
		vec2(0.067,0.133), vec2(0,0.067), vec2(0.133,0.067),
		vec2(-0.133,0.067), vec2(0,0.067), vec2(-0.067,0),
		vec2(0,0.067), vec2(0.133,0.067), vec2(0.067,0),
		vec2(-0.133,0.067), vec2(-0.2,0), vec2(-0.133,-0.067),
		vec2(0.133,0.067), vec2(0.2,0), vec2(0.133,-0.067),
		vec2(-0.067,0), vec2(-0.133,-0.067), vec2(0,-0.067),
		vec2(0.067,0), vec2(0,-0.067), vec2(0.133,-0.067),
		vec2(-0.133,-0.067), vec2(0,-0.067), vec2(-0.067,-0.133),
		vec2(0,-0.067), vec2(0.133,-0.067), vec2(0.067,-0.133),
		vec2(-0.067,-0.133), vec2(0.067,-0.133), vec2(0,-0.2)
    ]

    // fetch uniform variables from vertex shader
    vCenter = gl.getUniformLocation(program, "vCenter")

	vTheta = gl.getUniformLocation(program,"vTheta")

    // create buffer to store vertices in GPU
    let bufferId = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW)

    // fetch attribute and bind to vertices buffer
    vPosition = gl.getAttribLocation(program, "vPosition")
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vPosition)

    // render prototype
    render1();
	
    // render instances
    render2();
}

function render1()
{
    // clear background
    gl.clear(gl.COLOR_BUFFER_BIT)

    // send origin of 0,0 for prototype
	gl.uniform2fv(vCenter, [0,0])
    
    // change theta value to continue rotating clockwise
    // pass to uniform vTheta
    theta -= radianAngle
	gl.uniform1f(vTheta, theta)

    // draw vertices into triangles
	gl.drawArrays(gl.TRIANGLES, 0, 3)
	gl.drawArrays(gl.TRIANGLES, 3, 3)
	gl.drawArrays(gl.TRIANGLES, 6, 3)
	gl.drawArrays(gl.TRIANGLES, 9, 3)
	gl.drawArrays(gl.TRIANGLES, 12, 3)
	gl.drawArrays(gl.TRIANGLES, 15, 3)
	gl.drawArrays(gl.TRIANGLES, 18, 3)
	gl.drawArrays(gl.TRIANGLES, 21, 3)
	gl.drawArrays(gl.TRIANGLES, 24, 3)
	gl.drawArrays(gl.TRIANGLES, 27, 3)
	gl.drawArrays(gl.TRIANGLES, 30, 3)
	gl.drawArrays(gl.TRIANGLES, 33, 3)

    // repeat drawing
	requestAnimFrame(render1)
}

function render2()
{
    // counter-clockwise calculation
    theta2 += radianAngle

    // draw instace using every center in the centers array
	for (let center of centers)
	{
        // send center and theta value to vertex shader
		gl.uniform2fv(vCenter, center)
		gl.uniform1f(vTheta, theta2)
	
        // draw triangles
		gl.drawArrays(gl.TRIANGLES, 0, 3) 
		gl.drawArrays(gl.TRIANGLES, 3, 3)
		gl.drawArrays(gl.TRIANGLES, 6, 3)
		gl.drawArrays(gl.TRIANGLES, 9, 3)
		gl.drawArrays(gl.TRIANGLES, 12, 3)
		gl.drawArrays(gl.TRIANGLES, 15, 3)
		gl.drawArrays(gl.TRIANGLES, 18, 3)
		gl.drawArrays(gl.TRIANGLES, 21, 3)
		gl.drawArrays(gl.TRIANGLES, 24, 3)
		gl.drawArrays(gl.TRIANGLES, 27, 3)
		gl.drawArrays(gl.TRIANGLES, 30, 3)
		gl.drawArrays(gl.TRIANGLES, 33, 3)
	}

	requestAnimFrame(render2)
}