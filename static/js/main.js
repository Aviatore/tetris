const container = document.getElementById('container');
const width = 14;
const height = 14;
const xElements = 9;
const yElements = 19;
const brickMargin = (30 * width) / 200;
const marginTop = (-30 * width) / 200;
const outline = (28 * width) / 200;
let loop;
let lock = false;
let squashed = false;
let rows = [];
const pointsPerLine = 100;  // Amount of points per removed line
const pointsMultiplicate = 0.5;  // The value added to every additional removed line number
const placeholderXElements = 3;
const placeholderYElements = 3;
const dotMainBoardPrefix = 'M';
const dotPlaceholderBoardPrefix = 'P';
const mediumButtonLeft = document.querySelector('#medium-button-left')
const mediumButtonRight = document.querySelector('#medium-button-right')
const mediumButtonLow = document.querySelector('#medium-button-low')
const bigButton = document.querySelector('#big-button')
let keyPadLock = false;
let pause = false;
let currentRows = 0
let currentLevel = 1
let speed = 1000

let gamePause = false;
let pauseBlink;


document.addEventListener('DOMContentLoaded', onLoad);


function fillDots(container, rowLen, colLen, prefix) {
    for (let row = 0; row <= rowLen; row++) {
        let newRow = document.createElement('DIV');

        for (let column = 0; column <= colLen; column++) {
            let newDiv = document.createElement('DIV');

            newDiv.style.border = `${outline}px solid #9aa680`;
            newDiv.style.backgroundColor = '#879571';
            newDiv.style.outline = `${outline}px solid #879571`;
            newDiv.style.width = `${width}px`;
            newDiv.style.height = `${height}px`;
            newDiv.style.margin = `${brickMargin}px`;
            newDiv.style.marginTop = `${marginTop}px`;
            newDiv.style.boxSizing = 'border-box';
            newDiv.style.lineHeight = '0';
            newDiv.style.display = 'inline-block';

            newDiv.id = `${prefix}:${column}:${row}`;

            // isMarked - accepts two values:
            // true - the pixel of the "saved" brick is turned-on
            // false - the pixel of the "saved" brick is turned-off
            newDiv.isMarked = false;

            // isMarkedB - accepts two values:
            // true - the pixel of the moving brick is turned-on
            // false - the pixel of the moving brick is turned-off
            newDiv.isMarkedB = false;

            newRow.appendChild(newDiv);
        }

        container.appendChild(newRow);
    }
}


function onLoad() {
    fillDots(container, yElements, xElements, dotMainBoardPrefix);

    drawBrick(); // Puts the brick on the game board

    document.addEventListener('keydown', e => {
        if (!keyPadLock) {
            switch (e.key) {
                case "ArrowDown":
                    mediumButtonLow.classList.add('medium-button-low');
                    break;
                case "ArrowUp":
                    bigButton.classList.add('big-button');
                    rotate();
                    break;
                case "ArrowLeft":
                    mediumButtonLeft.classList.add('medium-button-left');
                    break;
                case "ArrowRight":
                    mediumButtonRight.classList.add('medium-button-right');
                    break;
                case "i":
                    pauseTheGame();
            }

            if (!detectColission(e.key) && !lock) {
                loops(e.key);
            }
        }
    });

    // Define actions after releasing any key
    document.addEventListener('keyup', e => {
        // Remove box-shadow from buttons
        mediumButtonLeft.classList.remove('medium-button-left');
        mediumButtonRight.classList.remove('medium-button-right');
        mediumButtonLow.classList.remove('medium-button-low');
        bigButton.classList.remove('big-button');

        lock = false;
    });

    // Fill with dots/pixels the small board for displaying the next brick
    let placeholder = document.getElementById('placeholder');
    fillDots(placeholder, placeholderYElements, placeholderXElements, dotPlaceholderBoardPrefix);

    [brick.next.type, brick.next.item] = randomBrick(); // Generate next random brick
    randomRotation(); // Randomly rotate the next brick

    drawBrickPlaceHolder(); // Draw a symbol of the next brick on the small board

    get_highscore(); // Get current high-score from the database using AJAX
}

function adjustLevel(rows, level) {
    if (keyPadLock) {return} // Prevent start a loop during the screen clearing

    let goalID = document.querySelector('#goal');
    let levelID = document.querySelector('#level');

    goalID.innerHTML = `${rows} / ${level * 5}`;
    levelID.innerHTML = level;

    speed = 1000 - (currentLevel * 90);  // Set a new speed
    clearInterval(loop);  // Stop current game loop
    loop = setInterval(loops, speed);  // Start a game loop with a new interval
}

function levelUp(rows, level) {
    if (rows >= level * 5) {
        currentRows = 0;
        currentLevel++;
    }
}

function randomRotation() {
    let numberOfTimes = Math.floor(Math.random() * 4);

    for (let time = 0; time < numberOfTimes; time++) {
        rotateRight('placeholder');
    }
}

let bricks = [
    [
        [0,1,0],
        [0,1,0],
        [1,1,0]
    ],
    [

        [0,1,0],
        [1,1,1],
        [0,0,0],
    ],
    [
        [1,1],
        [1,1]
    ],
    [
        [0,0,0,0],
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
    ],
    [
        [0,1,0],
        [1,1,0],
        [1,0,0]
    ]
];

// Returns a random brick array and its index
function randomBrick() {
    let index = Math.floor(Math.random() * bricks.length);
    console.log(index);
    return [...[index, bricks[index]]];
}

// Define the brick object
let brick = {
    item: [
        [0,1,0],
        [0,1,0],
        [1,1,0]
    ],
    next: {         // The place for storage of the next brick
        item: [],
        type: null,
    },
    type: 0,        // Index of the brick that has only two different shapes during rotation
    stage: 0,       // Accepts two values (0 or 1) that differentiate one of the two possible brick shapes
    pos: {          // Coordinates of the top-left brick pixel
        x: 4,
        y: -3
    }
};

// ----- ANIMATED CLEAR SCREEN -----
let rowLen;
let colLen;
let deepness = 0;  // Number of filled layers
let dir;

// The function returns a Promise object that runs an f() function
// that turns on/off the dot after the specified amount of time (10 ms)
function drawLine(f, dot, mode, timeout) {
    return new Promise(resolve => {
        setTimeout(function() {
            resolve(f(dot, mode));
        }, timeout)
    });
}

// The main function that controls the clear-screen animation
async function clearScreenController() {
    // --- Fill-up the screen with pixels ---
    rowLen = yElements;
    colLen = xElements;
    deepness = 0;
    dir = 'up';

    keyPadLock = true;  // Set the variable keyPadLock to true preventing from reading key strokes

    // The loop that controls filling-up the screen with dots/pixels
    while (deepness < 5) {  // 5 is the half of the gamepad width
        await gameOverClearScreen('on');
    }

    // --- Clear the screen ---
    rowLen = yElements;
    colLen = xElements;
    dir = 'up';
    deepness = 0;

    // The loop that controls filling-up the screen with empty dots/pixels
    while (deepness < 5) {
        await gameOverClearScreen('off');
    }

    keyPadLock = false;  // Set the variable keyPadLock to false allowing reading keystrokes

    // --- Reset the speed, game level and launch the game loop ---
    speed = 1000;
    let lvl = document.getElementById('level');
    lvl.innerText = '0';
    loop = setInterval(loops, speed);
}

// The function that asynchronously fills-up a line with pixels in the specified direction
async function gameOverClearScreen(mode) {
    deepness = xElements - colLen;
    console.log(`deepness: ${deepness}`);

    if (dir === 'up') {
        for (let row = rowLen; row >= deepness; row--) {
            let id = `${dotMainBoardPrefix}:${deepness}:${row}`;
            let dot = document.getElementById(id);
            if (dot == null) {console.log(`${id} is null`)} else {console.log(id)}

            if (!dot.isMarked && mode === 'on') {
                await drawLine(switchOffB, dot, mode, 10);
            } else if (mode === 'off') {
                await drawLine(switchOffB, dot, mode, 10);
            }
        }
        dir = 'right';
    } else if (dir === 'down') {
        for (let row = deepness + 1; row < rowLen + 1; row++) {
            let id = `${dotMainBoardPrefix}:${colLen}:${row}`;
            let dot = document.getElementById(id);

            if (!dot.isMarked && mode === 'on') {
                await drawLine(switchOffB, dot, mode, 10);
            } else if (mode === 'off') {
                await drawLine(switchOffB, dot, mode, 10);
            }
        }
        rowLen--;
        colLen--;
        dir = 'left';
    } else if (dir === 'left') {
        for (let col = colLen; col >= deepness; col--) {
            let id = `${dotMainBoardPrefix}:${col}:${rowLen + 1}`;
            let dot = document.getElementById(id);

            if (!dot.isMarked && mode === 'on') {
                await drawLine(switchOffB, dot, mode, 10);
            } else if (mode === 'off') {
                await drawLine(switchOffB, dot, mode, 10);
            }
        }
        dir = 'up';
    } else if (dir === 'right') {
        for (let col = deepness + 1; col < colLen + 1; col++) {
            let id = `${dotMainBoardPrefix}:${col}:${deepness}`;
            // console.log(id);
            let dot = document.getElementById(id);

            if (!dot.isMarked && mode === 'on') {
                await drawLine(switchOffB, dot, mode, 10);
            } else if (mode === 'off') {
                await drawLine(switchOffB, dot, mode, 10);
            }
        }
        dir = 'down';
    }
}
// ----- ANIMATED CLEAR SCREEN - END -----


// ----- ANIMATED CLEAR LINE -----
async function clearLinesAnim(rows) {
    pause = true;  // Set the variable to true preventing execution of the loops() function (brick will not move until the line clearing is completed)
    const offset = 4;  // The column index of the pixel from which the line clearing begins

    let score = document.getElementById("current-score");
    let rowNum = 1;
    for (let row of rows) {
        for (let col = offset; col >= 0; col--) {
            let idLeft = `${dotMainBoardPrefix}:${col}:${row}`;  // The left pixel ID
            let idRight = `${dotMainBoardPrefix}:${xElements - col}:${row}`;  // The right pixel ID

            let dotLeft = document.getElementById(idLeft);
            let dotRight = document.getElementById(idRight);

            let drawDotLeft = drawLine(switchOffB, dotLeft, 'off', 50);
            let drawDotRight = drawLine(switchOffB, dotRight, 'off', 50);

            // Wait until both promises finish
            await Promise.all([drawDotLeft, drawDotRight]);
        }

        // Set the current score to the h1 element that displays the score
        score.innerText = Number(score.innerText) + (rowNum * pointsPerLine);
        rowNum += pointsMultiplicate;
    }
    pause = false;  // Set the variable to false allowing execution of the loops() function (brick can now move)
}
// ----- ANIMATED CLEAR LINE - END -----

// The function "saves" brick position on the screen
function placeBrick() {
    for (let row = 0; row < brick.item.length; row++) {
        for (let col = 0; col < brick.item[0].length; col++) {
            let id = `${dotMainBoardPrefix}:${brick.pos.x + col}:${brick.pos.y + row}`;  // The ID of the pixel
            let dot = document.getElementById(id);

            if (dot !== null) {
                if (dot.isMarkedB) {
                    dot.isMarked = true;
                }
            }
        }
    }

    // Detection of the game over
    if (brick.pos.y < 0) {
        console.log('Game over!');
        drawBrick();

        clearScreenController();  // Clear screen (animation)

        clearInterval(loop);  // Stop the game loop

        let score = document.getElementById("current-score");
        get_highscore(Number(score.innerText));  // Save the score using AJAX
        score.innerText = '0';
    }

    // Update current brick
    brick.type = brick.next.type;
    brick.item = [...brick.next.item];
    brick.stage = 0;
    brick.pos.x = 4;
    brick.pos.y = brick.item.length * -1;

    [brick.next.type, brick.next.item] = randomBrick();  // Generate next random brick
    randomRotation();  // Randomly rotate the new brick
    drawBrickPlaceHolder();  // Draw next brick on the small board
}

// The function detects collisions
// The 'direction' argument stores the current key stroke value
function detectColission(direction) {
    for (let row = 0; row < brick.item.length; row++) {
        for (let col = 0; col < brick.item[0].length; col++) {
            let xOffset = 0;
            let yOffset = 0;

            if (direction === 'ArrowLeft') {xOffset = -1}
            else if (direction === 'ArrowRight') {xOffset = 1}
            else if (direction === 'ArrowDown') {yOffset = 1}

            let id = `${dotMainBoardPrefix}:${brick.pos.x + col}:${brick.pos.y + row}`;
            let dot = document.getElementById(id);

            let nextId = `${dotMainBoardPrefix}:${brick.pos.x + col + xOffset}:${brick.pos.y + row + yOffset}`;
            let nextDot = document.getElementById(nextId);

            if (direction === 'ArrowLeft' && dot !== null) {
                if ((brick.pos.x + col === 0 && dot.isMarkedB) ||
                    (dot.isMarkedB && nextDot.isMarked)) {
                    console.log(`1 ${dot.id}`);
                    return true;
                }
            } else if (direction === 'ArrowRight' && dot !== null) {
                if ((brick.pos.x + col === xElements && dot.isMarkedB) ||
                    (dot.isMarkedB && nextDot.isMarked)) {
                    console.log(`2 col: ${col} row: ${row} posX: ${brick.pos.x} id: ${id}`);
                    return true;
                }
            } else if (direction === 'ArrowDown' && dot !== null) {
                if ((brick.pos.y + row === yElements && dot.isMarkedB) ||
                    (dot.isMarkedB && nextDot.isMarked)) {

                    placeBrick();
                    console.log(`3 ${dot.id} ${dot.isMarkedB} ${nextId}`);

                    isLineFull();  // Check if there are full lines

                    levelUp(currentRows, currentLevel);  // Update the game level
                    adjustLevel(currentRows, currentLevel);  // Adjust the game speed (game loop interval)

                    return true;
                }
            }
        }
    }

    return false;
}

// The function updates the brick coordinates according to the direction (key stroke value)
function move(direction) {
    if (direction === 'ArrowLeft') {
        brick.pos.x--;
    } else if (direction === 'ArrowRight') {
        brick.pos.x++;
    } else if (direction === 'ArrowDown') {
        brick.pos.y++;
    }
}

// The function rotates the brick clockwise
// The argument 'brickType' possible values:
// 'main' - defines the brick on the main game board
// 'placeholder' - defines the next brick
function rotateRight(brickType) {
    let newItem = [];
    let prefix;
    let brickItem;
    let brickPos;

    // Setting variables according to the 'brickType' value
    if (brickType === 'main') {
        prefix = dotMainBoardPrefix;
        brickItem = brick.item;
        brickPos = brick.pos;
    } else if (brickType === 'placeholder') {
        prefix = dotPlaceholderBoardPrefix;
        brickItem = brick.next.item;
        brickPos = {x: 0, y: 0};
    }

    for (let col = 0; col <= brickItem[0].length - 1; col++) {
        let tmp = []

        for (let row = brickItem.length - 1; row >= 0; row--) {
            let id = `${prefix}:${brickPos.x + col}:${brickPos.y + row}`;
            let dot = document.getElementById(id);

            if (dot !== null) {
                // Prevents rotation if the new pixel coordinates refers to the pixel that is already turned-on (cannot rotate the brick if there is no space left)
                if (dot.isMarked) {
                    return;
                }
            }

            tmp.push(brickItem[row][col]);
        }

        newItem.push(tmp);
    }

    if (brickType === 'main') {
        brick.item = [...newItem];
    } else if (brickType === 'placeholder') {
        brick.next.item = [...newItem];
    }
}

// The function rotates the brick counter clockwise
function rotateLeft() {
    let newItem = [];

    for (let col = brick.item[0].length - 1; col >= 0 ; col--) {
        let tmp = [];

        for (let row = 0; row <= brick.item.length - 1; row++) {
            let id = `${dotMainBoardPrefix}:${brick.pos.x + col}:${brick.pos.y + row}`;
            let dot = document.getElementById(id);

            // Prevents rotation if the new pixel coordinates refers to the pixel that is already turned-on (cannot rotate the brick if there is no space left)
            if (dot !== null) {
                if (dot.isMarked) {
                    return;
                }
            }

            tmp.push(brick.item[row][col]);
        }
        newItem.push(tmp);
    }

    brick.item = [...newItem];
}

// The function controls the brick rotation
function rotate() {
    // Solve the problem with brick rotation at the edge
    // When there is no space to rotate the brick, the brick position is shifted to the left or right
    if (brick.pos.x + brick.item[0].length - 1 > xElements) {
        brick.pos.x = xElements - (brick.item[0].length - 1);
    }

    if (brick.pos.x < 0) {
        brick.pos.x = 0;
    }

    if (brick.pos.y + brick.item.length - 1 > yElements) {
        brick.pos.y = yElements - (brick.item.length - 1);
    }

    // Controls rotation direction of the specific bricks having only two possible shapes
    if ([3, 4].includes(brick.type)) {
        if (brick.stage === 0) {
            console.log(`right, ${brick.type}`);
            rotateRight('main');
            brick.stage = 1;
        } else {
            console.log(`left, ${brick.type}`);
            rotateLeft();
            brick.stage = 0;
        }
    } else {
        rotateRight('main');
    }

    console.log(`brick index: ${brick.type}`);
}

// The function switch the moving brick pixel on/off
function switchDot(dot, x) {
    if (x === 'off') {
        dot.style.backgroundColor = '#879571';
        dot.style.outlineColor = '#879571';
        dot.isMarkedB = false;
    } else if (x === 'on') {
        dot.style.backgroundColor = '#000';
        dot.style.outlineColor = '#000';
        dot.isMarkedB = true;
    }
}

// The function switch the 'saved' brick pixel on/off
function switchOffB(dot, x) {
    if (x === 'off') {
        dot.style.backgroundColor = '#879571';
        dot.style.outlineColor = '#879571';
        dot.isMarked = false;
    } else if (x === 'on') {
        dot.style.backgroundColor = '#000';
        dot.style.outlineColor = '#000';
        dot.isMarked = true;
    }
}

// The function draws the brick on the game board
function drawBrick(direction=null) {
    clear();  // Remove the 'moving' brick from the game board

    for (let row = 0; row < brick.item.length; row++) {
        for (let col = 0; col < brick.item[0].length; col++) {
            let xOffset;
            let yOffset;

            if (direction === 'ArrowLeft') {xOffset = -1}
            else if (direction === 'ArrowRight') {xOffset = 1}
            else if (direction === 'ArrowDown') {yOffset = 1}

            let id = `${dotMainBoardPrefix}:${brick.pos.x + col}:${brick.pos.y + row}`;
            let dot = document.getElementById(id);

            let nextId = `${dotMainBoardPrefix}:${brick.pos.x + col + xOffset}:${brick.pos.y + row + yOffset}`;
            let nextDot = document.getElementById(nextId);

            if (brick.item[row][col] === 0 && dot !== null) {
                if (nextDot !== null) {
                    if (!nextDot.isMarked) {
                        switchDot(dot, 'off');
                    }
                }

            } else if (brick.item[row][col] === 1 && dot !==null) {
                switchDot(dot, 'on');
            }
        }
    }
}

// The function draws the next brick on the small board
function drawBrickPlaceHolder() {
    clearPlaceHolder();  // Clears the small board

    for (let row = 0; row < brick.next.item.length; row++) {
        for (let col = 0; col < brick.next.item[0].length; col++) {
            let id = `${dotPlaceholderBoardPrefix}:${col}:${row}`;
            console.log(id);
            let dot = document.getElementById(id);

            if (brick.next.item[row][col] === 0) {
                switchDot(dot, 'off');
            } else if (brick.next.item[row][col] === 1) {
                switchDot(dot, 'on');
            }
        }
    }
}

// The function controls pausing the game
function pauseTheGame() {
    let mug = document.getElementById('mug');
    let pauseTxt = document.getElementById('pause');

    if (!gamePause) {
        gamePause = true;
        mug.style.color = '#000';

        pauseBlink = setInterval(blinkPause, 500);  // Starts blinking the 'PAUSE' text

        clearInterval(loop);  // Stops the game loop
    } else if (gamePause) {
        gamePause = false;
        mug.style.color = '#879571';

        clearInterval(pauseBlink);  // Stops blinking the 'PAUSE' text

        if (pauseTxt.classList.contains('pauseOn')) {
            pauseTxt.classList.remove('pauseOn');
            pauseTxt.classList.add('pauseOff');
        }

        loop = setInterval(loops, 1000);  // Starts the game loop
    }
}

// The function toggles the display of the 'PAUSE' text
function blinkPause() {
    let pauseTxt = document.getElementById('pause');

    if (pauseTxt.classList.contains('pauseOff')) {
        pauseTxt.classList.remove('pauseOff');
        pauseTxt.classList.add('pauseOn');
    } else {
        pauseTxt.classList.remove('pauseOn');
        pauseTxt.classList.add('pauseOff');
    }
}

// The function removes 'moving' brick from the game board
function clear() {
    for (let row = 0; row < yElements + 1; row++) {
        for (let col = 0; col < xElements + 1; col++) {
            let id = `${dotMainBoardPrefix}:${col}:${row}`;
            let dot = document.getElementById(id);

            if (dot !== null) {
                dot.isMarkedB = false;
            }

            if (!dot.isMarked) {
                switchDot(dot, 'off');
            }
        }
    }
}

// The function clears the small board displaying the next brick
function clearPlaceHolder() {
    for (let row = 0; row < placeholderYElements + 1; row++) {
        for (let col = 0; col < placeholderXElements + 1; col++) {
            let id = `${dotPlaceholderBoardPrefix}:${col}:${row}`;
            let dot = document.getElementById(id);

            switchDot(dot, 'off');
        }
    }
}


function isLineFull() {
    let rows_tmp = [];  // Array stores indexes of rows with full lines

    for (let row = 0; row < yElements + 1; row++) {
        let counts = 0;  // Count switched-on pixels in a row

        for (let col = 0; col < xElements + 1; col++) {
            let id = `${dotMainBoardPrefix}:${col}:${row}`;
            let dot = document.getElementById(id);

            if (dot.isMarked) {counts++}
        }

        // If the number of switched-on pixels are equal to the width of the game board, add the row index to the array
        if (counts === xElements + 1) {
            rows_tmp.push(row);
        }
    }

    // Handling the selected rows with full lines
    if (rows_tmp.length > 0) {
        lock = true;  // Set the value of the 'lock' variable to true preventing moving the brick by the player until he/she releases the key
        console.log(`row Ids: ${rows}`);

        // Launch the function that animates removal of the lines
        (async () => {clearLinesAnim(rows_tmp)})();

        squashed = true;  // Set the 'squashed' variable to true to allow remove empty lines created by the clearLinesAnim() function
        rows = rows_tmp;  // Save the row indexes to the global variable
        currentRows += rows_tmp.length  // Count up the total number of removed lines

        return
    }

    squashed = false;
    rows = rows_tmp;
}

// The function removes empty lines created by the clearLinesAnim() function
function squash(rows) {
    for (let row of rows) {
        for (let rowIndex = row; rowIndex >= 0; rowIndex--) {
            for (let col = 0; col < xElements + 1; col++) {
                let idPrev = `${dotMainBoardPrefix}:${col}:${rowIndex - 1}`;
                let id = `${dotMainBoardPrefix}:${col}:${rowIndex}`;
                let dot = document.getElementById(id);
                let dotPrev = document.getElementById(idPrev);

                if (dotPrev !== null) {
                    if (dotPrev.isMarked) {
                        switchOffB(dot, 'on');
                    } else {
                        switchOffB(dot, 'off');
                    }
                } else {
                    switchOffB(dot, 'off');
                }
            }
        }
    }
}

// The game loop
function loops(direction = null) {
    if (pause) {
        console.log('pause');
        return;
    }
    if (squashed) {
        squash(rows);
        squashed = false;

        brick.pos.x = 4;
        brick.pos.y = brick.item.length * -1;

        return;
    }

    if (direction !=null && !lock) {
        move(direction)
        drawBrick(direction);
    }
    else {
        if (squashed) {
            squash(rows);
            squashed = false;
        } else {
            if (!detectColission('ArrowDown')) {
                move('ArrowDown')
                drawBrick('ArrowDown');
            }
        }
    }
}

// The function handles the saving/retrieving score from the server using AJAX
function get_highscore(score=null) {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("load", e => {
        if (xhr.status === 200) {

            let h1_highscore = document.getElementById("high-score");
            let highscore = JSON.parse(xhr.response);
            console.log(`highscore: ${highscore.highscore}`);
            h1_highscore.innerText = highscore.highscore;
        }
    });

    if (score === null) {
        xhr.open("GET", "/highscore", true);
    } else {
        xhr.open("GET", `/highscore/${score}`, true);
    }

    xhr.send();
}

loop = setInterval(loops, speed);
