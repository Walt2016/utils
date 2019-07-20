import css from '../css/css.css'
import Icon from '../css/sprite/cos-201901241518.svg';
import Data from './data.xml';
import printMe from './print.js';
import Vue from 'vue'
import App from './App.vue'

new Vue({
    render: h => h(App),
  }).$mount('#app')


// var component = function () {
//     var div = document.createElement("div")
//     div.textContent = "hi"

//     // div.className="hello" //css.hello
//     div.classList.add('hello');



//     var myIcon = new Image();
//     myIcon.src = Icon;

//     div.appendChild(myIcon);
//     // div.className=css.hello

//     console.log(Data)

//     var btn = document.createElement('button');
//     btn.innerHTML = 'Click me and check the console!';
//     btn.onclick = printMe;

//     div.appendChild(btn);

//     return div
// }

// document.body.appendChild(component())