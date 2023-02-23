//Cameron McConnell

// html
let gl
let canvas
let factorSlider
let factorOutput
let scaleFactor
let kftSlider
let kftOutput
let inputNumCubes
let intermedNumCubes

// drawing
let numCubes = 8
let numDraw = 36

// vertices and colors
let cubeColor = []
let cubeVertices = []
let unitVectors = []

// model view
let modelView
let mvMatrix

// transpose, rotation, & kft
let kft = 0.0
let kftDelta
let theta = 360 * 2
let thetaDelta = 3

// stop animation
let clickedCenter = false

// cube
let vertices = [
	vec3( 0.0, 0.0,  0.0),
	vec3( 0.0, 1.0,  0.0 ),
	vec3( 1.0, 1.0,  0.0 ),
	vec3( 1.0, 0.0,  0.0 ),
	vec3( 0.0, 0.0, -1.0 ),
	vec3( 0.0, 1.0, -1.0),
	vec3( 1.0, 1.0, -1.0 ),
	vec3( 1.0, 0.0, -1.0 )
]

// colors
let vertexColors = [
    [ 0.5, 0.3, 0.0, 1.0 ],   
    [ 1.0, 0.4, 0.3, 1.0 ],   
    [ 1.0, 1.0, 0.2, 1.0 ],   
    [ 0.3, 1.0, 0.5, 1.0 ],   
    [ 0.1, 0.1, 0.3, 1.0 ],   
    [ 0.7, 0.3, 1.0, 1.0 ],  
    [ 0.0, 0.7, 0.6, 1.0 ],  
    [ 0.2, 1.0, 1.0, 1.0 ]   
]

// given function
function createCube()
{   
    quad( 1, 0, 3, 2 )
    quad( 2, 3, 7, 6 )
    quad( 3, 0, 4, 7 )
    quad( 6, 5, 1, 2 )
    quad( 4, 5, 6, 7 )
    quad( 5, 4, 0, 1 )
	
}

// create triangles for cubes
function quad(a, b, c, d) 
{

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices
    
    //vertex color assigned by the index of the vertex
    
    var indices = [ a, b, c, a, c, d ];

    console.log("CreateCube: indices = ",indices);

    for ( var i = 0; i < indices.length; ++i ) {
        cubeVertices.push( vertices[indices[i]] );
        // solid colored faces -- use the first vertex index as color index (all unique, so okay)
        cubeColor.push(vertexColors[a]);
        
    }
}

window.onload = function init()
{
    canvas = document.getElementById("gl-canvas")

    gl = WebGLUtils.setupWebGL(canvas)

    // get slider scale and set default values
    factorSlider = document.getElementById("scale-slider")
    factorOutput = document.getElementById("scale-value")
    factorOutput.innerHTML = factorSlider.value
    scaleFactor = factorSlider.value

    // update scale factor using function
    factorSlider.oninput = function() {
        factorOutput.innerHTML = this.value
        scaleFactor = this.value
    }

    // get kft slider and set default values
    kftSlider = document.getElementById("kft-slider")
    kftOutput = document.getElementById("kft-value")
    kftOutput.innerHTML = kftSlider.value
    kftDelta = Number(kftSlider.value)

    // update kft using function
    kftSlider.oninput = function () {
        kftOutput.innerHTML = this.value
        kftDelta = Number(this.value)
    }

    // check for mouse down and invert boolean if true
    canvas.addEventListener("mousedown", function(){
        let screenX = event.clientX - canvas.offsetLeft
        let screenY = event.clientY - canvas.offsetTop

        let posX = 2*screenX/canvas.width-1
        let posY = 2*(canvas.height-screenY)/canvas.height-1

        if ((posX < scaleFactor * 0.5 && posX > scaleFactor * -0.5) 
        && (posY < scaleFactor * 0.5 && posY > scaleFactor * -0.5))
        {
            clickedCenter = !clickedCenter
        }
    })

    inputNumCubes = document.getElementById("num-cubes")
    intermedNumCubes = inputNumCubes.value

    inputNumCubes.oninput = function() {
        intermedNumCubes = inputNumCubes.value
        if (intermedNumCubes < 8)
            intermedNumCubes = 9
    }

    createCube()

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // enable z buffer
    gl.enable(gl.DEPTH_TEST)

    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program)

    let cBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeColor), gl.STATIC_DRAW)

    let vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor)

    let vBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW)

    let vPosition = gl.getAttribLocation(program, "vPosition")
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vPosition)

    // get model view from glsl
    modelView = gl.getUniformLocation(program,"modelView")
    mvMatrix = mat4()

    // render center cube
    render1()

    // render animating cubes
    render2()
}

function render1()   
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // center and use scale factors
    mvMatrix = mult(scalem(scaleFactor,scaleFactor,scaleFactor),translate(-0.5,-0.5,0.1))

    gl.uniformMatrix4fv(modelView,false,flatten(mvMatrix))

    gl.drawArrays(gl.TRIANGLES, 0, numDraw)

    requestAnimFrame(render1)
}

function render2()
{
    // check to see if kft is 0 and generate new random vectors for each square
    if (parseFloat(kft) == parseFloat(0.0))
    {
        unitVectors = []
        numCubes = intermedNumCubes
        getUnitVectors(numCubes)
    }

    // increment kft based on kft slider value
    kft += kftDelta

    // set kft to 0 based on being greater than one or the center cube is clicked
    if (kft > 1.0 || clickedCenter)
    {
        kft = 0.0
    }

    // calc rotation, translation, and scaling
    for (let i = 0; i < numCubes; i++)
    {
        let tr = [kft*unitVectors[i][0],kft*unitVectors[i][1],kft*unitVectors[i][2]]

        let m = mult(scalem(scaleFactor,scaleFactor,scaleFactor),translate(-0.5+tr[0],-0.5+tr[1],tr[2]))
        let mvMatrix = mult(m,rotate(theta * kft,unitVectors[i][0],unitVectors[i][1],unitVectors[i][2]))
        gl.uniformMatrix4fv(modelView,false,flatten(mvMatrix))

        gl.drawArrays(gl.TRIANGLES,0,numDraw)
    }

    requestAnimFrame(render2)
}

// generates new random vectors for n cubes
function getUnitVectors(numCubes)
{
    for (let i = 0; i < numCubes; i++)
    {
        let unitV = vec3((Math.random() * (50-10) + 10) * (Math.round(Math.random()) ? 1 : -1),
                        (Math.random() * (50-5) + 5) * (Math.round(Math.random()) ? 1 : -1),
                        (Math.random() * (20-15) + 15) * (Math.round(Math.random()) ? 1 : -1))

        unitVectors.push(unitV)
    }

}