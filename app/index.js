import  css from  '../css/css.css'

var component=function(){
    var div=document.createElement("div")
    div.textContent="hi hello"

    // div.className="hello" //css.hello
    div.classList.add('hello');
    // div.className=css.hello
    return div
}

document.body.appendChild(component())