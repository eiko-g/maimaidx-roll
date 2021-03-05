'use strict';
// 打乱数组，来自：https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
// 逼乎相关讨论：https://www.zhihu.com/question/68330851
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

let a = [], b = [];
for (let i = 1; i <= 100; i++) {
    a[i] = i;
    b[i] = 0;
}

console.log('a', a);
console.log('b', b);

console.time('随机过程');
for (let i = 0; i < 1000 * a.length; i++) {
    shuffleArray(a);
    b[a[0]]++;
}
console.timeEnd('随机过程');

console.time('打印过程');
let table = document.querySelector('#table');
for (let ten = 0; ten < (a.length / 10 - 1); ten++) {
    let str = '';
    str += '<tr>';
    for (let one = 1; one <= 10; one++) {
        str += `
        <th>b${ten * 10 + one}</th>
        `
    }
    str += '</tr>';
    str += '<tr>';
    for (let one = 1; one <= 10; one++) {
        str += `
        <td>${b[ten * 10 + one]}</td>
        `
    }
    str += '</tr>';
    table.innerHTML += str;
}
console.timeEnd('打印过程');

let td = document.querySelectorAll('td');
td.forEach(td => {
    if (Number(td.innerText) > 1050) {
        td.style.backgroundColor = 'rgb(250, 161, 161)';
    } else if (Number(td.innerText) < 950) {
        td.style.backgroundColor = 'rgb(241, 240, 160)';
    }
})