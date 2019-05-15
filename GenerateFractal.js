let c = document.getElementById("canvas_1");
let ctx = c.getContext("2d");

let start_x = c.width / 10;
let start_y = c.height - c.height / 10;

let start_base_length = c.width - (c.width / 10 * 2);

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

let pointsAndAngles = [];
let flipped = false;

function makeUsableAngle(angle) {
    return angle * Math.PI / 180;
}

//generate a shape that starts at x, y and is at the angle given
function returnShapePoints(x, y, angle)
{
    //calculate first endpoint
    let endpoint_x1 = x + (current_base_length / 2) * Math.cos(makeUsableAngle(angle) + makeUsableAngle(-60 * (flipped ? -1 : 1)));
    let endpoint_y1 = y + (current_base_length / 2) * Math.sin(makeUsableAngle(angle) + makeUsableAngle(-60 * (flipped ? -1 : 1)));

    //calculate second endpoint
    let endpoint_x2 = endpoint_x1 + (current_base_length / 2) * Math.cos(makeUsableAngle(angle) + makeUsableAngle(0));
    let endpoint_y2 = endpoint_y1 + (current_base_length / 2) * Math.sin(makeUsableAngle(angle) + makeUsableAngle(0));

    //calculate third endpoint
    let endpoint_x3 = endpoint_x2 + (current_base_length / 2) * Math.cos(makeUsableAngle(angle) + makeUsableAngle(60 * (flipped ? -1 : 1)));
    let endpoint_y3 = endpoint_y2 + (current_base_length / 2) * Math.sin(makeUsableAngle(angle) + makeUsableAngle(60 * (flipped ? -1 : 1)));

    //return the four points for the current shape
    return [new pointAndAngle(x, y, angle + -60 * (flipped ? -1 : 1)), new pointAndAngle(endpoint_x1, endpoint_y1, angle + 0), new pointAndAngle(endpoint_x2, endpoint_y2, angle + 60 * (flipped ? -1 : 1)), new pointAndAngle(endpoint_x3, endpoint_y3, 0)];
}

//new start here
let current_base_length = start_base_length;
let num_iterations = 1;
ctx.translate(start_x, start_y);

function clearBackground()
{
    ctx.clearRect(0 - start_x, 0 - start_y, c.width, c.height);
}

function increment()
{
    clearBackground();
    if(num_iterations === 10)//anything more than 10 and it doesn't appear much different
        num_iterations = 0;
    num_iterations++;
    generateFractal();
}

function findHighestY()//returns the highest y value on the canvas (which will be the lowest negative)
{
    let current_highest = pointsAndAngles[0][0].y;
    for(let i = 0; i < pointsAndAngles.length; i++)
        for(let j = 0; j < pointsAndAngles[i].length; j++)
            if(pointsAndAngles[i][j].y < current_highest)
                current_highest = pointsAndAngles[i][j].y;
    return current_highest;
}

function findLowestY()//returns the lowest y value on the canvas (which will be the highest positive)
{
    let current_lowest = pointsAndAngles[0][0].y;
    for(let i = 0; i < pointsAndAngles.length; i++)
        for(let j = 0; j < pointsAndAngles[i].length; j++)
            if(pointsAndAngles[i][j].y > current_lowest)
                current_lowest = pointsAndAngles[i][j].y;
    return current_lowest;
}

function findLeftmostX()//returns the leftmost x value on the canvas (lowest value)
{
    let current_leftmost = pointsAndAngles[0][0].x;
    for(let i = 0; i < pointsAndAngles.length; i++)
        for(let j = 0; j < pointsAndAngles[i].length; j++)
            if(pointsAndAngles[i][j].x < current_leftmost)
                current_leftmost = pointsAndAngles[i][j].x;
    return current_leftmost;
}

function findRightmostX()//returns the rightmost x value on the canvas (highest value)
{
    let current_rightmost = pointsAndAngles[0][0].x;
    for(let i = 0; i < pointsAndAngles.length; i++)
        for(let j = 0; j < pointsAndAngles[i].length; j++)
            if(pointsAndAngles[i][j].x > current_rightmost)
                current_rightmost = pointsAndAngles[i][j].x;
    return current_rightmost;
}

function generateFractal()
{
    ctx.moveTo(0, 0);

    flipped = false;

    current_base_length = start_base_length;

    pointsAndAngles.push([new pointAndAngle(0, 0, 0)]);//start with the first point to generate the first shape

    for(let i = 0; i < num_iterations; i++)
    {
        let current_shapes = pointsAndAngles.length;
        for(let j = 0; j < current_shapes; j++)
            for(let k = 0; k < pointsAndAngles[j].length; k++)
                if((k  + 1) % 4 !== 0)//skip every fourth point, I use them to draw to but not to generate a shape
                {
                    pointsAndAngles.push(returnShapePoints(pointsAndAngles[j][k].x, pointsAndAngles[j][k].y, pointsAndAngles[j][k].angle));
                    flipped = !flipped;
                }

        //do after each layer
        for(let j = 0; j < current_shapes; j++)//remove the last iteration's shapes
            pointsAndAngles.shift();
        current_base_length /= 2;
    }

    //generate gradient of equal proportions from top center to bottom center
    let gradient = ctx.createLinearGradient((findLeftmostX() + findRightmostX()) / 2, findHighestY(), (findLeftmostX() + findRightmostX()) / 2, findLowestY());
    let colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
    for(let i = 0; i < colors.length; i++)
        gradient.addColorStop(1 / colors.length * i, colors[i]);
    ctx.strokeStyle = gradient;

    //connect the dots (points)
    ctx.beginPath();//this is needed to remove the line
    ctx.lineWidth = 1;
    for(let i = 0; i < pointsAndAngles.length; i++)
        for(let j = 0; j < pointsAndAngles[i].length; j++)
            ctx.lineTo(pointsAndAngles[i][j].x, pointsAndAngles[i][j].y);
    ctx.stroke();

    pointsAndAngles = [];
}

generateFractal();