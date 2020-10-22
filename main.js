var container;
var container;
var width = 20;
var height = 20;
// container = document.getElementById('container');


window.addEventListener('load', onLoad);

function onLoad() {
    container = document.getElementById('container');


    for (let row=0; row <= height; row++) {
        let newRow = document.createElement('DIV');
        newRow.style.marginBottom = '0';
        newRow.style.marginTop = '0';
        newRow.style.paddingTop = '0';
        newRow.style.paddingBottom = '0';
        newRow.style.boxSizing = 'margin-block';


        for (let column=0; column <= width; column++) {
            let newDiv = document.createElement('DIV');
            // newDiv.style.border = '1px solid black';
            newDiv.style.width = '20px';
            newDiv.style.height = '20px';
            newDiv.style.marginBottom = '0';
            newDiv.style.marginTop = '-5px';
            newDiv.style.paddingTop = '-5px';
            newDiv.style.paddingBottom = '0';
            newDiv.style.boxSizing = 'margin-block';
            newDiv.style.display = 'inline-block';

            if (column == 0) {
                newDiv.style.borderLeft = '1px solid black';
                if (row == 0) {
                    newDiv.style.borderTop = '1px solid black';
                }
            } else if (column == width) {
                newDiv.style.borderRight = '1px solid black';
                if (row == height) {
                    newDiv.style.borderBottom = '1px solid black';
                }
            }

            newRow.appendChild(newDiv);
        }

        container.appendChild(newRow);
    }



    // container.appendChild(newDiv);
    // container.parentNode.appendChild(newDiv);
    //
    // console.log(container.parentNode.nodeName);
}