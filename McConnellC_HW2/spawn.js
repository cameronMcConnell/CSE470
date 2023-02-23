// html
let gl
let canvas
let factorSlider
let factorOutput
let scaleFactor
let kftSlider
let kftOutput
let kftStep
let stepSize

// drawing
let numVertices = 8;
let numTriangles = 12;
let numCubes = 8
let numDraw = 36

// vertices and colors
let cubeColor = []
let cubeVertices = []
let unitVectors = []
let centers = []
let fractionsOfVector = []
let kftArray = []

let vCenter
let vScale

let x
let y
let z

let kft = 0.0

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
	
function createCube()
{   
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
	
}

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

    factorSlider = document.getElementById("scale-slider")
    factorOutput = document.getElementById("scale-value")
    factorOutput.innerHTML = factorSlider.value
    scaleFactor = factorSlider.value

    factorSlider.oninput = function() {
        factorOutput.innerHTML = this.value
        scaleFactor = this.value
    }

    kftSlider = document.getElementById("kft-slider")
    kftOutput = document.getElementById("kft-value")
    kftOutput.innerHTML = kftSlider.value
    kftStep = Number(kftSlider.value)
    stepSize = 1.0 / (1.0 / kftStep) 

    kftSlider.oninput = function () {
        kftOutput.innerHTML = this.value
        kftStep = Number(this.value)
        stepSize = 1.0 / (1.0 / kftStep) 
    }

    createCube()

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

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

    vCenter = gl.getUniformLocation(program, "vCenter")
    vScale = gl.getUniformLocation(program,"vScale")


    render1()

    render2()
}

function render1()   
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.uniform3fv(vCenter, [0.0,0.0,0.0])
    gl.uniform1f(vScale,scaleFactor)

    gl.drawArrays(gl.TRIANGLES, 0, numDraw)

    requestAnimFrame(render1)
}

function render2()
{
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    if (parseFloat(kft) == parseFloat(0.0))
    {
        unitVectors = []
        centers = []
        fractionsOfVector = []
        getUnitVectors(numCubes)
        for (let i = 0; i < numCubes; i++)
        {
            centers.push([0.0,0.0,0.0])
        }
    }

    kft += stepSize

    if (kft > 1.0)
        kft = 0.0
    
    gl.uniform1f(vScale,scaleFactor)

    // need to pass new center in this loop to draw new cubes
    // if the values in newCenters exceeds one, we need to get
    // new unit vectors.
    for (let i = 0; i < numCubes; i++)
    {
        gl.uniform3fv(vCenter, [centers[i][0] = kft * unitVectors[i][0],
            centers[i][1] += stepSize * unitVectors[i][1], centers[i][2] += stepSize *unitVectors[i][2]])
        
        gl.drawArrays(gl.TRIANGLES,0,numDraw)
    }

    requestAnimFrame(render2)
}

function getUnitVectors(numCubes)
{
    for (let i = 0; i < numCubes; i++)
    {
        let unitV = vec3((Math.random() - 0.5)*2,
                        (Math.random()-0.5)*2,
                        (Math.random()-0.5)*2)
        //let unitVNorm = Math.sqrt(unitV[0]**2 + unitV[1]**2 + unitV[2])
        console.log("UnitV before: ", unitV)
        for (let j = 0; j < 3; j++)
        {
            let val = unitV[j] / 3
            //let val = unitV[j] / unitVNorm
            unitV[j] = val
        }
        console.log("UnitV After:", unitV)
        unitVectors.push(unitV)
    }

}