// import requestStorage from './index.js';
import requestStorage from './index.js';

requestStorage.init();

const resultNode = document.querySelector('.result');

requestStorage
    .getFeature('http://www.mocky.io/v2/5b59e7232f0000aa2a5f963c')
    .then(console.log);

setInterval(function() {
    resultNode.innerText = JSON.stringify(requestStorage.getFeatures());
}, 1000);
