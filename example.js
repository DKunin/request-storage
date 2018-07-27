// import requestStorage from './index.js';
import requestStorage from './index.js';

requestStorage.init();

const resultNode = document.querySelector('.result');

requestStorage
    .getFeature('http://www.mocky.io/v2/5b59e7232f0000aa2a5f963c')
    .then(result => {
        console.log('result 1', result);
    });

requestStorage
    .getFeature('http://www.mocky.io/v2/5b5ae6e73100005c009a8930')
    .then(result => {
        console.log('result 2', result);
    });

const buttonNode = document.querySelector('button');

buttonNode.addEventListener('click', function() {
    requestStorage
        .getFeature('http://www.mocky.io/v2/5b5ae5e13100002d119a892b')
        .then(result => {
            console.log('result 3', result);
        });
});

setInterval(function() {
    resultNode.innerText = JSON.stringify(requestStorage.getFeatures());
}, 1000);
