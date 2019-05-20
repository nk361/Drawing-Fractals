let c = document.getElementById("canvas1");
let ctx = c.getContext("2d");

ctx.canvas.width = window.innerWidth - 15;
ctx.canvas.height = window.innerHeight - 50;

let startX = c.width / 2 - c.height / 2;
let startY = c.height - c.height / 10;

let startBaseLength = c.height;

//new start here
let numIterations = 10;
ctx.translate(startX, startY);

//to get the point when given start point, distance, and angle
//x2 = x1 + distance * cos(angle)
//y2 = y1 + distance * sin(angle)

class pointAndAngle
{
    constructor(x, y, angle)
    {
        this.x = x;
        this.y = y;
        this.angle = angle;
    }
}

function clearBackground()
{
    ctx.clearRect(0 - startX, 0 - startY, c.width, c.height);
}

let pointsAndAngles = [];
let highsAndLows;

function findHighsAndLows()//returns highest y (which will be the lowest negative), lowest y (which will be the highest positive), leftmost x, rightmost x and it is more efficient to do all four in one pass
{
    let currentHighest = pointsAndAngles[0][0].y, currentLowest = pointsAndAngles[0][0].y, currentLeftmost = pointsAndAngles[0][0].x, currentRightmost = pointsAndAngles[0][0].x;
    for(let i = 0; i < pointsAndAngles.length; i++)
        for(let j = 0; j < pointsAndAngles[i].length; j++)
        {
            if(pointsAndAngles[i][j].y < currentHighest)
                currentHighest = pointsAndAngles[i][j].y;
            else if(pointsAndAngles[i][j].y > currentLowest)
                currentLowest = pointsAndAngles[i][j].y;
            if(pointsAndAngles[i][j].x < currentLeftmost)
                currentLeftmost = pointsAndAngles[i][j].x;
            else if(pointsAndAngles[i][j].x > currentRightmost)
                currentRightmost = pointsAndAngles[i][j].x;
        }
    return [currentHighest, currentLowest, currentLeftmost, currentRightmost];
}

function degreesToRadians(angle)
{
    return angle * Math.PI / 180;
}

let currentBaseLength = startBaseLength;
let flipped = false;

//generate a shape that starts at x, y and is at the angle given
function returnShapePoints(x, y, angle)
{
    //calculate first endpoint
    let endpointX1 = x + (currentBaseLength / 2) * Math.cos(degreesToRadians(angle) + degreesToRadians(-60 * (flipped ? -1 : 1)));
    let endpointY1 = y + (currentBaseLength / 2) * Math.sin(degreesToRadians(angle) + degreesToRadians(-60 * (flipped ? -1 : 1)));

    //calculate second endpoint
    let endpointX2 = endpointX1 + (currentBaseLength / 2) * Math.cos(degreesToRadians(angle) + degreesToRadians(0));
    let endpointY2 = endpointY1 + (currentBaseLength / 2) * Math.sin(degreesToRadians(angle) + degreesToRadians(0));

    //calculate third endpoint
    let endpointX3 = endpointX2 + (currentBaseLength / 2) * Math.cos(degreesToRadians(angle) + degreesToRadians(60 * (flipped ? -1 : 1)));
    let endpointY3 = endpointY2 + (currentBaseLength / 2) * Math.sin(degreesToRadians(angle) + degreesToRadians(60 * (flipped ? -1 : 1)));

    //return the four points for the current shape
    return [new pointAndAngle(x, y, angle + -60 * (flipped ? -1 : 1)), new pointAndAngle(endpointX1, endpointY1, angle + 0), new pointAndAngle(endpointX2, endpointY2, angle + 60 * (flipped ? -1 : 1)), new pointAndAngle(endpointX3, endpointY3, 0)];
}

function generatePoints()
{
    pointsAndAngles = [];//clears already used points

    flipped = false;

    currentBaseLength = startBaseLength;

    pointsAndAngles.push([new pointAndAngle(0, 0, 0)]);//start with the first point to generate the first shape

    for(let i = 0; i < numIterations; i++)
    {
        let currentShapes = pointsAndAngles.length;
        for(let j = 0; j < currentShapes; j++)
            for(let k = 0; k < pointsAndAngles[j].length; k++)
                if((k  + 1) % 4 !== 0)//skip every fourth point, I use them to draw to but not to generate a shape
                {
                    pointsAndAngles.push(returnShapePoints(pointsAndAngles[j][k].x, pointsAndAngles[j][k].y, pointsAndAngles[j][k].angle));
                    flipped = !flipped;
                }

        //do after each layer
        for(let j = 0; j < currentShapes; j++)//remove the last iteration's shapes
            pointsAndAngles.shift();
        currentBaseLength /= 2;
    }

    //get them with one pass and save them for reuse every time new points have been generated
    highsAndLows = findHighsAndLows();
}

function addWaterMark(highsAndLows)
{
    ctx.globalAlpha = 0.5;
    ctx.font = "25px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText("@lolnk361", (highsAndLows[2] + highsAndLows[3]) / 2, -((highsAndLows[2] + highsAndLows[3]) / 2) + 80, 120);
    ctx.globalAlpha = 1;
}

let gradientAngle = 0;

function generateGradient(highsAndLows)
{
    //calculate gradient rotation points
    let gradientX1 = ((highsAndLows[2] + highsAndLows[3]) / 2) + (highsAndLows[3] - ((highsAndLows[2] + highsAndLows[3]) / 2)) * Math.cos(degreesToRadians(-90 + gradientAngle));
    let gradientY1 = ((highsAndLows[0] + highsAndLows[1]) / 2) + (highsAndLows[1] - ((highsAndLows[0] + highsAndLows[1]) / 2)) * Math.sin(degreesToRadians(-90 + gradientAngle));
    let gradientX2 = ((highsAndLows[2] + highsAndLows[3]) / 2) + (highsAndLows[3] - ((highsAndLows[2] + highsAndLows[3]) / 2)) * Math.cos(degreesToRadians(90 + gradientAngle));
    let gradientY2 = ((highsAndLows[0] + highsAndLows[1]) / 2) + (highsAndLows[1] - ((highsAndLows[0] + highsAndLows[1]) / 2)) * Math.sin(degreesToRadians(90 + gradientAngle));

    //generate gradient of equal proportions from top center to bottom center
    let gradient = ctx.createLinearGradient(gradientX1, gradientY1, gradientX2, gradientY2);

    let colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
    for(let i = 0; i < colors.length; i++)
        gradient.addColorStop(1 / colors.length * i, colors[i]);//the first parameter is where the color will start in the gradient
    ctx.strokeStyle = gradient;
}

function drawFractal()
{
    //connect the dots (points)
    ctx.beginPath();//this is needed to remove the line
    ctx.lineWidth = 1;
    for(let i = 0; i < pointsAndAngles.length; i++)
        for(let j = 0; j < pointsAndAngles[i].length; j++)
            ctx.lineTo(pointsAndAngles[i][j].x, pointsAndAngles[i][j].y);
    ctx.stroke();
}

function increment()
{
    if(numIterations === 10)//anything more than 10 and it doesn't appear much different
        numIterations = 0;
    numIterations++;
    clearBackground();
    generatePoints();
    ctx.fillStyle = "black";
    ctx.fillRect(0 - startX, 0 - startY, c.width, c.height);
    addWaterMark(highsAndLows);
    generateGradient(highsAndLows);
    drawFractal();
}

let gradientOn = false;

function toggleGradientMovement()
{
    gradientOn = !gradientOn;
}

//Initial generation and drawing
generatePoints();
ctx.fillStyle = "black";
ctx.fillRect(0 - startX, 0 - startY, c.width, c.height);
addWaterMark(highsAndLows);
generateGradient(highsAndLows);
drawFractal();

function generateFractal()
{
    //redraw with new gradient, using old points
    if(gradientOn)
    {
        gradientAngle++;

        if(gradientAngle === 359)
            gradientAngle = 0;

        //Only need to redraw while the gradient is changing
        ctx.moveTo(0, 0);
        clearBackground();
        ctx.fillStyle = "black";
        ctx.fillRect(0 - startX, 0 - startY, c.width, c.height);
        addWaterMark(highsAndLows);
        generateGradient(highsAndLows);
        drawFractal();
    }

    window.requestAnimationFrame(generateFractal);
}

window.requestAnimationFrame(generateFractal);