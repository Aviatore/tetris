var container;
var container;
var width = 20;
var height = 20;
var xElements = 30;
var yElements = 30;
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
            newDiv.isMarked = false;

            newRow.appendChild(newDiv);
        }

        container.appendChild(newRow);
    }

    drawBrick();

    document.addEventListener('keydown', e => {
        switch (e.key) {
            case "ArrowDown":
                move('down');
                break;
            case "ArrowUp":
                rotate();
                break;
            case "ArrowLeft":
                move('left');
                break;
            case "ArrowRight":
                move('right');
                break;
        }

        drawBrick(e.key);
    })
}

let brick = {
    item: [
        [0,1,0],
        [0,1,0],
        [1,1,0]
    ],
    pos: {
        x: 5,
        y: 5
    }
};

function move(direction) {
    if (direction === 'left' && brick.pos.x > 0) {
        brick.pos.x--;
    } else if (direction === 'right' && brick.pos.x < xElements) {
        brick.pos.x++;
    } else if (direction === 'down' && brick.pos.x + brick.item.length < yElements) {
        brick.pos.y++;
    }
}

function rotate() {
    let newItem = [];

    for (let col = 0; col <= brick.item[0].length - 1; col++) {
        let tmp = []
        for (let row = brick.item.length - 1; row >= 0; row--) {
            tmp.push(brick.item[row][col]);

        }
        newItem.push(tmp);

    }
    brick.item = [...newItem];
}

function switchDot(dot, x) {
    if (x === 'off') {
        dot.style.backgroundColor = '#879571';
        dot.style.outlineColor = '#879571';
    } else if (x === 'on') {
        dot.style.backgroundColor = '#000';
        dot.style.outlineColor = '#000';
        dot.isMarked = true;
    }
}

function toggleDot(dot) {
    if (dot.style.backgroundColor == '#879571') {
        dot.style.backgroundColor = '#000';
        dot.style.outlineColor = '#000';
    } else {
        dot.style.backgroundColor = '#879571';
        dot.style.outlineColor = '#879571';
    }
}

function switchOff(dot) {
    if (dot.isMarked) {
        dot.style.backgroundColor = '#879571';
        dot.style.outlineColor = '#879571';
    }
}

function drawBrick(direction=null) {
    let id = `${brick.pos.x}:${brick.pos.y}`;

    for (let row = 0; row < brick.item.length; row++) {
        for (let col = 0; col < brick.item[0].length; col++) {
            // console.log(`col: ${col}, row: ${row}`)
            if (direction == 'ArrowRight' && brick.item[row][col] === 1 && col == 0 ||
                direction == 'ArrowLeft' && brick.item[row][col] === 1 && col == brick.item[0].length - 1 ||
                direction == 'ArrowDown' && brick.item[row][col] === 1 && row == 0) {
                let id;

                switch (direction) {
                    case 'ArrowRight':
                        id = `${(brick.pos.x + col) - 1}:${brick.pos.y + row}`;
                        break;
                    case 'ArrowLeft':
                        id = `${(brick.pos.x + col) + 1}:${brick.pos.y + row}`;
                        break;
                    case 'ArrowDown':
                        id = `${(brick.pos.x + col)}:${brick.pos.y + row - 1}`;
                        break;
                }

                // console.log(`id: ${id}, dir: ${direction}`);
                let dot = document.getElementById(id);
                switchOff(dot);
            }

            let id = `${brick.pos.x + col}:${brick.pos.y + row}`;
            let dot = document.getElementById(id);
            // console.log(id);
            if (brick.item[row][col] === 0) {
                switchDot(dot, 'off');
            } else if (brick.item[row][col] === 1) {
                switchDot(dot, 'on');
            }
        }
    }
}

function clear(id) {

    let brick = document.getElementById(id);
    brick.style.backgroundColor = '#879571';
    brick.style.outlineColor = '#879571';
}

function loop() {

}