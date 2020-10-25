var container;
var container;
var width = 20;
var height = 20;
var xElements = 20;
var yElements = 20;
var brickMargin = (30 * width) / 200;
var marginTop = (-5 * width) / 200;
var outline = (20 * width) / 200;
// container = document.getElementById('container');


document.addEventListener('DOMContentLoaded', onLoad);

function onLoad() {
    container = document.getElementById('container');

    for (let row=0; row <= yElements; row++) {
        let newRow = document.createElement('DIV');

        for (let column=0; column <= xElements; column++) {
            let newDiv = document.createElement('DIV');
            newDiv.style.border = `${outline}px solid #9aa680`;
            newDiv.style.backgroundColor = '#879571';
            newDiv.style.outline = `${outline}px solid #879571`;
            newDiv.style.width = `${width}px`;
            newDiv.style.height = `${height}px`;
            newDiv.style.margin = `${brickMargin}px`;
            newDiv.style.marginTop = `${marginTop}px`;
            // newDiv.style.paddingTop = '-2px';
            newDiv.style.boxSizing = 'border-box';
            newDiv.style.lineHeight = '0';

            newDiv.style.display = 'inline-block';
            newDiv.id = `${column}:${row}`;

            newRow.appendChild(newDiv);
        }

        container.appendChild(newRow);
    }

    drawSnake();

    document.addEventListener('keydown', e => {
        switch (e.key) {
            case "ArrowDown":
                move('down');
                break;
            case "ArrowUp":
                move('up');
                break;
            case "ArrowLeft":
                move('left');
                break;
            case "ArrowRight":
                move('right');
                break;
        }

        drawSnake();
    })
}

snake = {
    pos: [{x:5,y:5},{x:6,y:5},{x:7,y:5},{x:8,y:5},{x:9,y:5},{x:10,y:5}]
}

function move(direction) {
    let newX;
    let newY;

    if (direction === 'up') {
        newY = snake.pos[snake.pos.length - 1].y - 1;
        newX = snake.pos[snake.pos.length - 1].x;
    } else if (direction === 'down') {
        newY = snake.pos[snake.pos.length - 1].y + 1;
        newX = snake.pos[snake.pos.length - 1].x;
    } else if (direction === 'left') {
        newY = snake.pos[snake.pos.length - 1].y;
        newX = snake.pos[snake.pos.length - 1].x - 1;
    } else if (direction === 'right') {
        newY = snake.pos[snake.pos.length - 1].y;
        newX = snake.pos[snake.pos.length - 1].x + 1;
    }

    let newBrick = {
        x: newX,
        y: newY
    }
    snake.pos.push(newBrick);
    let elemToRemId = snake.pos.shift();
    clear(`${elemToRemId.x}:${elemToRemId.y}`);
}

function drawSnake() {
    for (let element of snake.pos) {
        let id = `${element.x}:${element.y}`;
        let brick = document.getElementById(id);

        brick.style.backgroundColor = '#000';
        brick.style.outlineColor = '#000';

    }
}

function clear(id) {

    let brick = document.getElementById(id);
    brick.style.backgroundColor = '#879571';
    brick.style.outlineColor = '#879571';
}

function loop() {

}