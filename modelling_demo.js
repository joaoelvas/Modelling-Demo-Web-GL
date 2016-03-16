var gl;

var canvas;

// GLSL programs
var program;

// Render Mode
var WIREFRAME=1;
var FILLED=2;
var renderMode = WIREFRAME;

var projection;
var modelView;
var view;

var d = 0; // direcção direita ou esquerda
var r = 0; // rotação da grua 
var v = 0; // rotação do braço 
var o = 1; // estençao do braço 

matrixStack = [];

function pushMatrix()
{
    matrixStack.push(mat4(modelView[0], modelView[1], modelView[2], modelView[3]));
}

function popMatrix() 
{
    modelView = matrixStack.pop();
}

function multTranslation(t) {
    modelView = mult(modelView, translate(t));
}

function multRotX(angle) {
    modelView = mult(modelView, rotateX(angle));
}

function multRotY(angle) {
    modelView = mult(modelView, rotateY(angle));
}

function multRotZ(angle) {
    modelView = mult(modelView, rotateZ(angle));
}

function multMatrix(m) {
    modelView = mult(modelView, m);
}
function multScale(s) {
    modelView = mult(modelView, scalem(s));
}

function initialize() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    
    program = initShaders(gl, "vertex-shader-2", "fragment-shader-2");
    
    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    
    setupProjection();
    setupView();
}

function setupProjection() {
    projection = perspective(60, 1, 0.1, 100);
    //projection = ortho(-1,1,-1,1,0.1,100);
}

function setupView() {
    view = lookAt([0,0,5], [0,0,0], [0,1,0]);
    //view = lookAt([0,5,0], [0,0,0], [0,0,-1]);
    //view = lookAt([5,0,0], [0,0,0], [0,1,0]);
    modelView = mat4(view[0], view[1], view[2], view[3]);
}

function setMaterialColor(color) {
    var uColor = gl.getUniformLocation(program, "color");
    gl.uniform3fv(uColor, color);
}

function sendMatrices()
{
    // Send the current model view matrix
    var mView = gl.getUniformLocation(program, "mView");
    gl.uniformMatrix4fv(mView, false, flatten(view));
    
    // Send the normals transformation matrix
    var mViewVectors = gl.getUniformLocation(program, "mViewVectors");
    gl.uniformMatrix4fv(mViewVectors, false, flatten(normalMatrix(view, false)));  

    // Send the current model view matrix
    var mModelView = gl.getUniformLocation(program, "mModelView");
    gl.uniformMatrix4fv(mModelView, false, flatten(modelView));
    
    // Send the normals transformation matrix
    var mNormals = gl.getUniformLocation(program, "mNormals");
    gl.uniformMatrix4fv(mNormals, false, flatten(normalMatrix(modelView, false)));  
}

function draw_sphere(color)
{
    setMaterialColor(color);
    sendMatrices();
    sphereDrawFilled(gl, program);
}

function draw_cube(color)
{
    setMaterialColor(color);
    sendMatrices();
    cubeDrawFilled(gl, program);
}

function draw_cylinder(color)
{
    setMaterialColor(color);
    sendMatrices();
    cylinderDrawFilled(gl, program);
}

document.onkeydown = handleKeyDown;

function handleKeyDown(event) {
        var code = event.keyCode;
/*
        Esquerda, direita (mexe o carro)
        Q, W (roda o cilindro da base)
        Cima, baixo (move o braço de cima)
        O, P (esticar)
*/
    switch(code) {
        case(37): 
            if(d > -1.8)
                d-=0.05; //Esquerda
            break;
        case(38): 
            if(v < 200)
                v+=10; //Cima
            break;
        case(39): 
            if(d < 1.8)
                d+=0.05; //Direita
            break;
        case(40):
             if(v > -1950)
                v-=10; //Baixo
            break;
        case(79):   // O esticar o braço 
            if (o < 1.4)
                o +=0.05;
            break;
        case(80):   // P encolher o braço 
            if(o > 0.95)
                o -=0.05;
            break;
        case(81):   // Q rodar braço 
            r +=5;
            break;
        case(87):   // W
            r -=5;
            break;
        default: break;
    }
}



function draw_scene()
{
   //Base (Cubo)
    pushMatrix();

        multTranslation([0,-3.6,0]);
        multScale([4.5,3,3]);
        multRotX(90);
        draw_cube([0.5,0.5,0.5]);

    popMatrix();
    
    multTranslation([d,-0.3,0.5]); //Direita e esquerda
    pushMatrix();
    
//Base (Cubo)
        pushMatrix();
        multTranslation([0,-1.35,0]);
            pushMatrix(); 
                multScale([1,0.15,0.9]);
                draw_cube([1,0,0]);
            popMatrix();

//Roda direita (cilindro)
            pushMatrix();
                multTranslation([0.25,-0.1,0]);
                multScale([0.2,0.2,1]);
                multRotY(90);
                multRotZ(90);
                draw_cylinder([1.0, 1.0, 0.0]);
            popMatrix();

//Roda esquerda (cilindro)
            pushMatrix();
                multTranslation([-0.25,-0.1,0]);
                multScale([0.2,0.2,1]);
                multRotY(90);
                multRotZ(90);
                draw_cylinder([1.0, 1.0, 0.0]);   
            popMatrix();

//Base da grua (cilindro)
            pushMatrix();
                multRotY(r);    //rotaçao da grua
                pushMatrix();
                    multTranslation([0,0.2,0]);           
                    multScale([0.3,0.15,0.3]);
                    draw_cylinder([0, 1.5, 0.5]);    
                popMatrix();

//carro (Cubo)
                pushMatrix();
                    multTranslation([0,1,0]);
                    multScale([0.15,1.5,0.15]);
                    draw_cube([1,0,0]);
                popMatrix();

//Eixo (cilindro)
                pushMatrix();
                    multTranslation([0,1.7,0]);
                    multRotZ(v/10); //rotaçao do braço
                    pushMatrix();
                        multScale([0.2,0.2,0.2]);
                        multRotX(90);
                        draw_cylinder([0, 1.5, 0.5]);
                    popMatrix();
    
//braco grua (Cubo)
                    pushMatrix();
                        multTranslation([0.6,0,0]);
                        multScale([1.1,0.15,0.15]);
                        draw_cube([1,0,0]);
    
                    popMatrix();
//Extensao da grua (Cubo)
                    pushMatrix();
                        multTranslation([o,0,0]); // extensao do braco
                        multScale([0.5,0.1,0.1]);
                        draw_cube([1,0,0]);
                    popMatrix();
                popMatrix();
            popMatrix();
        popMatrix();
    popMatrix();

}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    
    setupView();
    
    // Send the current projection matrix
    var mProjection = gl.getUniformLocation(program, "mProjection");
    gl.uniformMatrix4fv(mProjection, false, flatten(projection));
        
    draw_scene();
    
    requestAnimFrame(render);
}


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    initialize();
            
    render();
}
