import css from '../css/css.css'
import Icon from '../css/sprite/cos-201901241518.svg';
import Data from './data.xml';

var component = function () {
    var div = document.createElement("div")
    div.textContent = "hi"

    // div.className="hello" //css.hello
    div.classList.add('hello');



    var myIcon = new Image();
    myIcon.src = Icon;

    div.appendChild(myIcon);
    // div.className=css.hello

    console.log(Data)

    return div
}

document.body.appendChild(component())