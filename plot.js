import Plotly from 'plotly.js-dist';

// let start = -500;
// let end = 500;
// let kordsObj = {};
// for (let i = start; i < end; i++) {
//     for (let j = start; j < end; j++) {
//         let s = Math.sqrt(i * i + j * j).toFixed(4).toString();
//         // let s = Math.sqrt(i * i + j * j).toString();
//         if (!kordsObj[s]) {
//             kordsObj[s] = ([{ x: i, y: j }]);
//         } else {
//             kordsObj[s].push({ x: i, y: j });
//         }
//     }
// }
// let lenArr = [];
// Object.keys(kordsObj).reverse().forEach(key => {
//     lenArr.push(kordsObj[key].length);
// });
// console.log(Math.max(...lenArr));

let el = document.createElement("div");
el.id = "plot";
document.body.appendChild(el);

Plotly.d3.csv('https://raw.githubusercontent.com/plotly/datasets/master/3d-scatter.csv', function (err, rows) {
    let start = -4;
    let end = 5;

    let kordsObj = {};
    for (let i = start; i < end; i++) {
        for (let j = start; j < end; j++) {
            let s = Math.sqrt(i * i + j * j).toFixed(4).toString();
            if (!kordsObj[s]) {
                kordsObj[s] = {
                    kord: [{x: i, y: j, z: 0}],
                    color: `rgba(${i - start}, ${j - start}, 217, 0.14)`
                };
            } else {
                kordsObj[s].kord.push({x: i, y: j, z: 0});
            }
        }
    }

    function unpack(rows, key) {
        return rows.map(function (row) {
            return row[key];
        });
    }

    function genData(kordsObj) {
        let traces = [];
        Object.keys(kordsObj).forEach(key => {
            traces.push({
                x: unpack(kordsObj[key].kord, 'x'),
                y: unpack(kordsObj[key].kord, 'y'),
                z: unpack(kordsObj[key].kord, 'z'),
                mode: 'markers',
                marker: {
                    size: 15,
                    line: {
                        color: kordsObj[key].color,
                        width: 0.2
                    },
                    opacity: 0.8
                },
                type: 'scatter2d'
            });
        });

        return traces;
    }

    Plotly.newPlot('plot', genData(kordsObj), {
        margin: {
            l: 0,
            r: 0,
            b: 0,
            t: 0
        }
    });
    // Plotly.newPlot('myDiv', [], layout);
});

// console.log(kordsObj)
