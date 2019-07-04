;

function _package(namespaces, root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(namespaces, factory)
    } else if (typeof exports === 'object') {
        exports = module.exports = factory()
    } else {
        root[namespaces] = factory()
    }
};

//工具 html //htmlUtils
_package("_", this, function () {
    'use strict'
    var _ = {
        createClass: function () {
            function defineProperties(target, props) {
                for (var key in props) {
                    if (target.hasOwnProperty(key)) {
                        console.log(_.type(target) + " hasOwnProperty " + key)
                    } else {
                        //不覆盖已有属性
                        var descriptor = {
                            key: key,
                            value: props[key],
                            enumerable: false,
                            configurable: true,
                            writable: true
                        }
                        //defineProperty在IE8下只能对DOM对象使用
                        // Object.defineProperty(target, key, descriptor);
                        //ie8
                        target[key] = props[key]
                    }
                }
            }
            return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }(),
        //类型
        //ie8中  Object.prototype.toString.call(undefined) =[boject object]
        //其他 Object.prototype.toString.call(undefined) =[boject undefined]
        type: function (o) {
            if (o === null) return 'null';
            if (o === undefined) return "undefined"; //兼容ie8
            var s = Object.prototype.toString.call(o);
            var t = s.match(/\[object (.*?)\]/)[1].toLowerCase();
            return t === 'number' ? isNaN(o) ? 'nan' : !isFinite(o) ? 'infinity' : t : t;
        },
        //继承私有属性 不包括原型方法 
        extend: function (obj) {
            var len = arguments.length;
            if (len > 1) obj = obj || {};
            for (var i = 1; i < len; i++) {
                var source = arguments[i];
                if (source) {
                    for (var prop in source) {
                        if (source.hasOwnProperty(prop)) {
                            if (_.type(source[prop]) === "array") {
                                obj[prop] = _.extend([], source[prop]);
                            } else if (_.type(source[prop]) === "object") {
                                obj[prop] = _.extend({}, source[prop]);
                            } else {
                                obj[prop] = source[prop];
                            }
                        }
                    }
                }
            }
            return obj;
        },
        //全局鼠标事件
        globalClick: function (callback) {
            // _.removeEvent("click", document); //先删除   ，最后绑定一次有效
            // _.addEvent("click", document, callback)

            _.event(document, {
                click: callback,
            })
        },
        isDOM: function (obj) {
            if (typeof HTMLElement === 'object') {
                return obj instanceof HTMLElement;
            }
            return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
        },
        selectorType: function (cls) {
            var type = "tag"
            switch (true) {
                case /^\.\w+/.test(cls):
                    type = "class"
                    break;
                case /^#\w+/.test(cls):
                    type = "id"
                    break;
                case _.isDOM(cls):
                    type = "dom"
            }
            return type;
        },
        closest: function (el, cls) {
            if (_.isDOM(cls)) {
                if (!el.parentNode) {
                    return null
                } else if (el == cls) {
                    return el;
                } else {
                    return _.closest(el.parentNode, cls)
                }
            } else { //string
                if (!el.parentNode) { //document  ie8不支持parentNode
                    return null
                } else if (cls.indexOf(".") === 0 && _.indexOf(el.className.split(" "), cls.substring(1)) >= 0) {
                    return el;
                } else if (cls.indexOf("#") === 0 && el.id.toLowerCase() === cls.substring(1).toLowerCase()) {
                    return el;
                } else if (el.tagName.toLowerCase() === cls.toLowerCase()) {
                    return el
                } else {
                    return _.closest(el.parentNode, cls)
                }
            }
        },
        sortBy: function (key, asc, type) {
            return function (a, b) {
                if (type === "number") {
                    return asc ? a[key] - b[key] : b[key] - a[key]
                } else {
                    return asc ? String(a[key]).localeCompare(String(b[key]), 'zh-CN') : String(b[key]).localeCompare(String(a[key]), 'zh-CN')
                }
            }
        },
        obj2arr: function (obj) {
            var keys = [],
                vals = [],
                typs = [];
            for (var key in obj) {
                vals.push(obj[key])
                keys.push(key)
                typs.push(_.type(obj[key]))
            }
            return {
                keys: keys,
                vals: vals,
                typs: typs
            }
        },
        autoId: function (ele) {
            if (!ele.id) {
                var id = "_" + Math.random().toString(16).slice(2)
                ele.setAttribute("id", id);
            }
            return ele;
        },
        queryAll: function (selectors, rootEle) {
            if (_.type(rootEle) === "string") {
                rootEle = _.query(rootEle)
            }
            if (rootEle) {
                rootEle = _.autoId(rootEle)
                return document.querySelectorAll("#" + rootEle.id + " " + selectors)
            }
            return document.querySelectorAll(selectors)
        },
        query: function (selectors, rootEle) {
            if (_.type(rootEle) === "string") {
                rootEle = _.query(rootEle)
            }
            if (rootEle) {
                rootEle = _.autoId(rootEle)
                return document.querySelector("#" + rootEle.id + " " + selectors)
            }
            return document.querySelector(selectors)
        },
        append: function (el, child) {
            var _createTextNode = function (t) {
                if (_.indexOf(["string", "number", "date"], _.type(t)) >= 0) {
                    t = document.createTextNode(t)
                }
                return t
            }
            var _append = function (el, child) {
                if (_.type(child) === "array") {
                    _.forEach(child, function (t) {
                        t = _createTextNode(t)
                        el && el.appendChild(t)
                    })
                } else {
                    child = _createTextNode(child)
                    el && el.appendChild(child)
                }
                return el
            }
            if (!el) {
                el = document.body
            } else if (_.type(el) === "string") {
                el = _.query(el)
            }
            return _append(el, child)
        },
        replace: function (el, newEl) {
            el.parentNode.replaceChild(newEl, el)
            return el;
        },
        empty: function (el) {
            if (_.type(el) === "string") {
                el = _.query(el)
            }
            el.innerText = "";
            return el;
        },
        get: function (el, prop) {
            if (!el) return;
            if (prop === "class") { //IE8不能通过class名获取元素
                return el.className
            }
            if (el.tagName === "input" && prop === "value") {
                return el[prop]
            }
            if (["tagName"].indexOf(prop) >= 0) { //,"name","id"
                return el[prop]
            }
            return el.getAttribute(prop)
        },
        set: function (el, key, val) {
            if (!el) return;
            var _set = function (el, key, val) {
                if (key === "class") { //IE6/7不支持setAttribute('class',xxx)方式设置元素的class。 
                    el.className = val || ""
                } else {
                    el.setAttribute(key, val || "")
                }
            }
            var len = arguments.length
            if (len === 3) {
                _set(el, key, val)
            } else if (len == 2) {
                if (_.type(key) === "object") {
                    var options = key
                    for (var k in options) {
                        _set(el, k, options[k])
                    }
                } else {
                    _set(el, key, "")
                }
            }
        },
        has: function (el, prop) {
            return el.hasAttribute(prop)
        },
        remove: function (el, prop) {
            if (!el) return;
            var _remove = function (el, prop) {
                if (prop) {
                    el.removeAttribute(prop)
                } else if (_.isDOM(el)) {
                    el.parentNode.removeChild(el)
                }
            }
            if (_.type(el) === "nodelist") {
                _.forEach(el, function (t) {
                    _remove(t, prop)
                })
            } else {
                _remove(el, prop)
            }
        },
        toggle: function (el, prop) {
            if (!el) return;
            if (_.has(el, prop)) {
                _.remove(el, prop)
            } else {
                _.set(el, prop)
            }
        },
        //兼容IE ，nodeList.forEach
        forEach: function (arr, callback) {
            if (!arr) return;
            for (var i = 0; i < arr.length; i++) {
                callback(arr[i], i)
            }
        },
        //兼容ie8
        trim: function (str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
        },
        //兼容ie8
        map: function (arr, callback) {
            var arr2 = []
            for (var i = 0; i < arr.length; i++) {
                arr2[arr2.length] = callback(arr[i])
            }
            return arr2;
        },
        //兼容ie8
        indexOf: function (arr, val) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == val) {
                    return i
                }
            }
        },
        fast: function () {
            var len = arguments.length,
                args = new Array(len), //fast then Array.prototype.slice.call(arguments)
                times = 10000;
            while (len--) args[len] = arguments[len];
            var last = args[args.length - 1];
            if (_.type(last) === "number") {
                times = last;
                args.pop();
            }
            var _run = function (fn, times) {
                var word = 'run ' + fn.name + '{} ' + times + ' time' + (times > 1 ? 's' : '');
                console.time(word);
                while (times--) fn.apply(this, args);
                console.timeEnd(word);
            }
            _.forEach(args, function (t) {
                t && _run.call(this, t, times);
            });
        },
        start: function (tag, options) {
            var sb = [];
            sb.push('<');
            sb.push(tag);
            for (var key in options) {
                sb.push(' ' + key + '="' + options[key] + '"');
            }
            sb.push('>');
            return sb.join('');
        },
        end: function (tag) {
            return '</' + tag + '>';
        },
        //字符串拼接 方式
        wrap: function (tag, text, options) {
            var i = tag.indexOf(" ");
            if (i > 0) {
                var leftTag = tag.substring(0, i)
                return _.wrap(leftTag, _.wrap(tag.substring(i + 1), text, options))
            }
            return text === null ? _.start(tag, options) : _.start(tag, options) + text + _.end(tag);
        },
        css: function (el, opt) { //todo
            var args = Array.prototype.slice.call(arguments),
                len = args.length;
            var needpre = function (str) {
                var reg = RegExp(['transform', 'transition', 'animation', 'box-shadow', 'flex'].join('|')) ////,'@keyframes'
                return reg.test(str);
            }
            var autoprefixer = function (key, val) {
                // var self = this;
                if (needpre(key)) {
                    ['-webkit-', '-moz-', '-o-', ''].forEach(function (t) {
                        el.style[t + key] = val;
                    })
                } else {
                    el.style[key] = val;
                }
            }
            var keys = ['font-size', 'line-height', 'border-radius', 'border-width', 'padding', 'margin'];
            _.forEach(['padding', 'margin', ''], function (pre) {
                keys = keys.concat(['top', 'left', 'bottom', 'right'].map(function (t) {
                    return pre ? pre + '-' + t : t;
                }))
            });
            _.forEach(['max', 'min', ''], function (pre) {
                keys = keys.concat(['width', 'height'].map(function (t) {
                    return pre ? pre + '-' + t : t;
                }))
            });

            //单位
            var autounit = function (key, val) {
                if (/^0$/.test(val)) return val;
                return !!~keys.indexOf(key) ? ("" + val).replace(/^\d+(\.\d+)?$/, function (match) {
                    return match + "px";
                }) : val;
            }

            if (len === 2) {
                if (_.type(opt) === "object") {
                    for (var key in opt) {
                        // css()
                        var val = opt[key];
                        val = autounit(key, val)
                        el.style[key] = val;
                        // autoprefixer.call(el, key, val);
                    }
                }
            } else if (len === 3) {
                // prop, val
                el.style[opt] = args[2];
                // autoprefixer.call(el, opt, arguments[1]);
            }
            return el;
        },
        isShow: function (el) {
            //display:none  el.offsetWidth ==0  不占空间
            //opacity:0 el.offsetWidth>0  占空间
            el = _.isDOM(el) ? el : _.query(el);
            return el.offsetWidth > 0 || el.offsetHeight > 0;
        },
        isHide: function (el) {
            el = _.isDOM(el) ? el : _.query(el);
            return el.offsetWidth <= 0 && el.offsetHeight <= 0;
        },
        //创建DOm 方式
        //ie 8中
        // var a={"class":1}错误（缺少标识符、字符串或数字） var a={"class":1}正确
        createEle: function (tag, text, props, events) {
            var _createEle = function (tag, text) {
                var ele = document.createElement(tag)
                return _.append(ele, text);
            }
            var _appendProps = function (ele, props) {
                for (var key in props) {
                    // _.set(ele, key, props[key])
                    if (tag.toLowerCase() === "input" && key === "checked") {
                        if (props[key]) {
                            ele.setAttribute(key, props[key])
                        }
                    } else {
                        ele.setAttribute(key, props[key])
                    }
                }
                return ele;
            }
            // var i = tag.indexOf(" ");
            // if (i > 0) {
            //     var leftTag = tag.substring(0, i)
            //     return _.createEle(leftTag, _.createEle(tag.substring(i + 1), text, props, events))
            // }
            var tags = _.trim(tag).split(" ");
            //自动补齐层级关系
            // var _autoFixTag = function (tags, child) {
            //     switch (_.type(child)) {
            //         case "string":
            //         case "number":
            //         case "date":

            //                 var lastTag = tags[tags.length - 1];
            //                 switch (lastTag) {
            //                     case "tr":
            //                         tags[tags.length] = "td"
            //                         break;
            //                     case "thead":
            //                         tags[tags.length] = "tr"
            //                         tags[tags.length] = "th"
            //                         break;
            //                     case "tbody":
            //                         tags[tags.length] = "tr"
            //                         tags[tags.length] = "td"
            //                         break;
            //                     case "ul":
            //                         tags[tags.length] = "li"
            //                         break;
            //                     case "table":
            //                         tags[tags.length] = "body"
            //                         tags[tags.length] = "tr"
            //                         tags[tags.length] = "td"
            //                         break;
            //                     default:
            //                         break;
            //                 }
            //             break;

            //         case "array":
            //             child.forEach(function(t){

            //             })
            //             break;
            //     }

            //     return tags;
            // }
            // tags = _autoFixTag(tags, text);
            var len = tags.length;
            var ele, parent;
            if (len == 1) {
                ele = _createEle(tag, text)
            } else {
                _.forEach(tags, function (t, i) {
                    var tmp = _createEle(t)
                    if (i == 0) { //first child
                        parent = ele = tmp
                    }
                    if (i + 1 == len) { //last child
                        tmp = _createEle(t, text)
                        _.append(parent, tmp)
                    }
                    if (i > 0 && i < len) {
                        _.append(parent, tmp)
                        parent = tmp
                    }
                })
            }
            _appendProps(ele, props);
            _.event(ele, events)
            return ele;
        },
        btn: function (text, props, events) {
            //ie8 props.class缺少标识符
            if (props && props["class"]) {
                props["class"] = "btn " + props["class"];
            }
            return _.div(text, _.extend({
                "class": "btn"
            }, props), events)
        },
        btnGroup: function (text, props, events) {
            if (props && props["class"]) {
                props["class"] = "btn-group " + props["class"]
            }
            return _.div(text, _.extend({
                "class": "btn-group"
            }, props), events)
        },
        stringify: function (el) {
            var str = el.tagName.toLowerCase();
            str += el.id ? "#" + el.id : "";
            str += el.className ? "." + el.className.replace(/\s+/g, ".") : "";
            return str;
        },
        inStyle: function (obj) {
            return ["width", "height", "top", "left"].map(function (t) {
                return obj[t] ? t + ":" + obj[t] : null
            }).join(";")
            // return JSON.stringify(obj).replace(/\"/g,"").replace(/,/g,";").replace(/{/,"").replace(/}/,"")
        },
        //小图标
        icon: function (str, props, events) {
            return _.div(str,
                _.extend({
                    "class": "icon"
                }, props), events)
        },
        img: function (options) {
            if (_.type(options) === "object") {
                return _.createEle("img", "", _.extend({
                    src: options.url
                }, options))
            }
            return _.createEle("img", "", {
                src: options
            })
        },
        checkbox: function (options) {
            if (_.type(options) === "string") {
                options = {
                    label: options
                }
            }
            var label;
            if (options && options.label) {
                label = _.div(options.label, {
                    "class": "label"
                })
            }
            var checkbox = _.createEle("input", "", _.extend({
                type: "checkbox",
                "class": "checkbox"
            }, options), {
                click: function (e) {
                    var el = e.target,
                        table = _.closest(el, ".dataintable");
                    var numb = _.queryAll("input[type='checkbox']:checked", table).length
                    var optPanel = _.query(".optPanel", table)
                    if (optPanel) {
                        if (numb === 0) {
                            optPanel.style.overflow = "hidden"
                            // optPanel.style.bottom = '-55px';
                        } else {
                            // optPanel.style.bottom = '-0px';
                            optPanel.style.overflow = "visible"
                            // var HistoryCountSpan=_.query(".HistoryCountSpan")
                            // HistoryCountSpan.innerText = numb
                        }
                    }
                }
            })
            if (label) {
                return _.div([checkbox, label], {
                    "class": "input-group"
                });
            } else {
                return checkbox
            }
        },
        select: function (arr, handleChange) {
            var ops = _.map(arr, function (t) {
                var label, value;
                if (_.type(t) === "string") {
                    label = t;
                    value = t;
                } else {
                    label = t.label;
                    value = t.value || t.label || ""
                }
                return _.createEle("option", label, {
                    value: value
                })
            })
            return _.createEle("select", ops, {
                "class": "select"
            }, {
                change: function (e) {
                    console.log(this.value)
                    // console.log(e.target)
                    handleChange && handleChange(this.value)
                }
            })
        },
        //输入域
        input: function (text, props, events) {
            return _.createEle("input", "",
                _.extend({
                    value: text,
                    type: "text",
                }, props), events
            )
        },
        //div输入域
        divInput: function (text, props, events) {
            return _.div(text,
                _.extend({
                    "class": "textInput_item",
                    contenteditable: true,
                }, props), events
            )
        },
        rangeInput: function (options) {
            var label = _.div(options.label || "", {
                "class": "label"
            });
            var cssname = "rangeInput";
            var cssname_group = "input-group"
            var cssname_item = "rangeInput_item";
            var cssname_to = "rangeInput_to";
            var type = options.type || "contenteditable";
            var from, to;
            if (type === "input") {
                from = _.input("", _.extend({
                    name: "from",
                    "class": cssname_item
                }, options.from));
                to = _.input("", _.extend({
                    name: "to",
                    "class": cssname_item
                }, options.to))
            } else {
                from = _.divInput("", _.extend({
                    name: "from",
                    "class": cssname_item
                }, options.from));
                to = _.divInput("", _.extend({
                    name: "to",
                    "class": cssname_item
                }, options.to))
            }
            var _enter = function (e) {
                e.preventDefault()
                var el = e.target;
                if (_.closest(el, "." + cssname_item)) {
                    to.focus()
                }

            }
            var group = _.div([from, _.div("to", {
                "class": cssname_to
            }), to], {
                "class": cssname_group
            })

            _.shortcut({
                enter: _enter
            })
            return _.div([label, group], {
                "class": cssname
            })
        },
        listInput: function (options) {
            var label = _.div(options.label || "", {
                "class": "label"
            })
            var size = options.size || 1;
            var ipts = []
            var cssname = "listInput";
            var cssname_group = "listInput_group"
            var cssname_item = "listInput_item";

            var id = options.id || "b0_list_1";
            var tagType = options.tagType || "divInput";
            var groupId = options.groupId
            var type = options.type || cssname;

            var _id = function (i) {
                return [groupId, type, i].join("_")
            }
            var _nextId = function (id) {
                var arr = id.split("_")
                var n = Number(arr.pop()) + 1
                arr.push(n)
                return arr.join("_")
            }
            //失去焦点
            var _blur = function (e) {
                var el = e.target || e;
                // if (!_.has(el, "update") && el.innerText) {
                _.remove(el, "contenteditable");
                _.append(el, _.icon("x", {}, {
                    click: function () {
                        _.remove(el)
                        if (_.queryAll("." + cssname_item, inputGroup).length == 0) {
                            _.append(_item(_id(0)), inputGroup)
                        }
                    }
                }))
                // }
                // var dialog=_.query("#dialog_officecode")
                // _.hide(dialog)
            }
            //建议对话框
            var _suggestionDialog = function (el) {
                var dialog = _.query("#dialog_officecode")
                var p = _.pos(el)
                _.css(dialog, {
                    position: "absolute",
                    top: p.y + p.height,
                    left: p.x
                })
                _.set(dialog, "source", el.id)
                _.show(dialog)
            }
            var _focus = function (e) {
                var el = e.target;
                _.set(el, "update")
                _suggestionDialog(el)
            }
            var _nextItem = function (el) {
                var id = el.id
                var nextId = _nextId(id) //_id(1)
                var next = _.query("#" + nextId)
                if (!next) { //创建新输入框
                    next = _item(nextId)
                    var group = _.closest(el, "." + cssname_group)
                    _.append(group, next)
                }
                _beUpdate(next)
                _beActive(next)
                _beFocus(next)
            }

            var _item = function (id) {
                switch (tagType) {
                    case "input":
                        return _.input("", {
                            "class": cssname_item,
                            name: "item",
                            id: id
                        })
                        break;
                    default:
                        return _.divInput("", {
                            "class": cssname_item,
                            name: "item",
                            id: id,
                        }, {
                            blur: _blur,
                            focus: _focus,
                            next: _nextItem
                        })
                }
            }
            for (var i = 0; i < size; i++) {
                ipts.push(_item(_id(i)))
            }
            var inputGroup = _.div(ipts, {
                "class": cssname_group
            })

            var _beUpdate = function (el) {
                _.set(el, "contenteditable", true)
                var icon = _.query(".icon", el)
                _.remove(icon)
            }
            var _inActive = function () {
                var els = _.queryAll("." + cssname_item + "[active]") //inputGroup
                _.remove(els, "active");
            }

            var _beActive = function (el) {
                _inActive()
                _.set(el, "active");
            }

            var _beFocus = function (el) {
                // el.focus()
                var val = el.innerText
                setTimeout(function () {
                    el.focus();
                    el.value = '';
                    el.value = val;
                }, 0)
            }


            //回车事件
            var _enter = function (e) {
                var el = e.target;
                var dialog = _.query("#dialog_officecode")
                if (_.isShow(dialog)) {
                    var li = _.query("li[active]", dialog)
                    el.innerText = _.get(li, "code")
                    _.hide(dialog)
                }
                if (_.closest(el, "." + cssname_item)) {
                    e.preventDefault();
                    // if (!el.innerText) return;
                    if (el.innerText) {
                        _nextItem(el);
                    }
                }
            }

            //点击事件
            var handleActive = function (e) {
                var el = e.target;
                console.log(el)
                if (el.className === cssname_item) {
                    _beActive(el)
                } else {
                    _inActive()
                }
            }
            //左箭头 快捷键  变可编辑
            var _leftArrow = function (e) {
                console.log(e.target)
                var el = _.query("." + cssname_item + "[active]")
                if (!el) return;
                _beUpdate(el)
                _beFocus(el)
            }

            //控制dialog选择
            var _downArrow = function (e) {
                var dialog = _.query("#dialog_officecode")
                if (_.isShow(dialog)) {
                    var li = _.query("li[active]", dialog) || _.query("li", dialog)
                    var nextLi = li.nextSibling;
                    _.remove(li, "active");
                    _.set(nextLi, "active")
                }
            }
            var _upArrow = function (e) {
                var dialog = _.query("#dialog_officecode")
                if (_.isShow(dialog)) {
                    var li = _.query("li[active]", dialog) || _.query("li", dialog)
                    var preLi = li.previousSibling
                    _.remove(li, "active");
                    _.set(preLi, "active")
                }

            }
            //快捷键
            _.shortcut({
                enter: _enter,
                leftArrow: _leftArrow,
                downArrow: _downArrow,
                upArrow: _upArrow
            })
            //全局点击
            _.globalClick(handleActive)

            return _.div([label, inputGroup], { //[label].concat(ipts)
                "class": cssname
            }, {
                click: handleActive
            })
        },
        selectInput: function (options) {
            var label = options.label;
            var arr = options.options
            var cssname = "selectInput"
            return _.div([_.div(label, {
                "class": "label"
            }), _.select(arr)], {
                "class": cssname
            });
        },
        textInput: function (label) {
            var cssname = "textInput"
            return _.div([_.div(label, {
                "class": "label"
            }), _.divInput("")], {
                "class": cssname
            });
        },
        tips: function (label, content) {
            var cssname = "tips"
            return _.div([_.div(label, {
                "class": "label"
            }), _.div(content, {
                "class": "content"
            })], {
                "class": cssname
            })
        },
        //遍历dom，操作
        traversalWidth: function (el) {
            var children = el.children,
                len = children.length;
            for (var i = 0; i < len; i++) {
                var t = children[i]
                if (parseInt(getComputedStyle(t)["width"]) > 1000) {
                    // t.setAttribute("witdh","100%")
                    t.style.width = "100%"
                    _.traversalWidth(t)
                }
            }
        },
        //允许一次加多个样式
        //去重
        addClass: function (el, cls) {
            var arr1 = el.className.split(" ")
            var arr2 = cls.split(" ")
            var obj = {}
            arr1.forEach(function (t) {
                obj[t] = 1
            })
            arr2.forEach(function (t) {
                obj[t] = 1
            })
            var keys = []
            for (var key in obj) {
                keys.push(key)
            }
            el.className = keys.join(" ")
            return el;
        },
        removeClass: function (el, cls) {
            var arr1 = el.className.split(" ")
            var arr2 = cls.split(" ")
            var obj = {}
            arr1.forEach(function (t) {
                if (arr2.indexOf(t) === -1) {
                    obj[t] = 1
                }
            })
            var keys = []
            for (var key in obj) {
                keys.push(key)
            }
            el.className = keys.join(" ")
            return el;
        },
        show: function (el) {
            if (!_.isDOM(el)) {
                el = _.query(el)
            }
            _.removeClass(el, "hide")
            _.addClass(el, "show")
        },
        hide: function (el) {
            if (!_.isDOM(el)) {
                el = _.query(el)
            }
            _.removeClass(el, "show")
            _.addClass(el, "hide")
        },
        click: function (el, callback) {
            // _.addEvent("click", el, callback)

            _.event({
                click: callback
            }, el)
        },
        hasClass: function (el, cls) {
            var arr = el.className.split(" ")
            return arr.indexOf(cls) >= 0
        },
        getStyle: function (el, attr) {
            if (el.currentStyle) {
                return el.currentStyle[attr];
            } else {
                return getComputedStyle(el, false)[attr];
            }
        }
    };
    //ie8 对象不支持forEach
    _.forEach(["div", "ul", "li", "tbody", "tfoot", "thead", "td", "tr", "th", "table", "textarea", "i", "span", "colgroup", "col", "a"], function (t) {
        _[t] = function (text, props, events) {
            return _.createEle(t, text, props, events)
        }
    });

    return _;
});


//获取位置坐标
_package("pos", _, function () {
    function Position(e) {
        if (!(this instanceof Position)) return new Position(e);

        if (_.type(e) === "mouseevent") {
            return this.mouseEventPos(e)
        }
        if (_.isDOM(e)) {
            return this.domPos(e)
        }
        return this.domPos(e.target)
    }

    return _.createClass(Position, {
        mouseEventPos: function (e) {
            var x = e.clientX;
            var y = e.clientY;
            return {
                x: x,
                y: y
            }
        },
        domPos: function (el) {
            function Pos(x, y, el) {
                // if (_.isDocument(el)) el = document.doctype ? window.document.documentElement : document.body;
                this.x = x;
                this.y = y;
                this.time = +new Date();
                this.el = el;
                this.width = el.clientWidth; //不包括边框   el.offsetWidth包括边框;
                this.height = el.clientHeight; //el.offsetHeight;
                this.scrollTop = el.scrollTop;
                this.scrollHeight = el.scrollHeight;
                this.offsetHeight = el.offsetHeight;
                this.top = y;
                this.left = x;
                this.right = x + this.width;
                this.bottom = y + this.height;
            }

            function _pos(el) {
                var pos = new Pos(el.offsetLeft, el.offsetTop, el);
                var target = el.offsetParent;
                while (target) {
                    pos.x += target.offsetLeft;
                    pos.y += target.offsetTop;
                    target = target.offsetParent
                }
                // if (offsetPos) {
                //     pos.x -= offsetPos.x;
                //     pos.y -= offsetPos.y;
                // }
                return pos;
            }
            return _pos(el);
        }
    })
});


//事件
_package("event", _, function () {
    function Event(el, events) {
        if (!(this instanceof Event)) return new Event(el, events);
        if (!el) {
            el = document;
        }
        this.el = el;
        if (!el.events) el.events = {}
        this.handlers = el.events
        if (_.type(events) === "object") {
            for (var type in events) {
                this.add(type, events[type])
            }
        }
    }
    return _.createClass(Event, {
        // createEvent: function () {
        //     var dom = document.querySelector('#id')
        //     document.addEventListener('alert', function (event) {
        //         console.log(event)
        //     }, false);

        //     // 创建
        //     var evt = document.createEvent("HTMLEvents");
        //     // 初始化
        //     evt.initEvent("alert", false, false);

        //     // 触发, 即弹出文字
        //     dom.dispatchEvent(evt);
        // },
        //进行基于 DOM 的数据存储
        //store events
        store: function (type, listener) {
            var handlers = this.handlers;
            if (typeof handlers[type] === "undefined") {
                handlers[type] = []
            }
            handlers[type].push(listener)
        },
        //delete event
        delStore: function (type, listener) {
            var handlers = this.handlers;
            if (typeof handlers[type] === "undefined") {
                handlers[type] = []
            }
            if (listener == undefined) {
                handlers[type].length = 0;
            } else {
                var i = handlers[type].length;
                while (i--) {
                    if (handlers[type][i] === listener) {
                        handlers[type].splice(i, 1);
                    }
                }
            }
        },
        //trigger event
        fire: function (type) {
            var el = this.el;
            var handlers = this.handlers;
            var _fire = function (type) {
                _.forEach(handlers[type], function (t) {
                    t(el)
                })
            }
            if (_.type(type) === "array") {
                _.forEach(type, function (typ) {
                    _.forEach(handlers[typ], function (t) {
                        t(el)
                    })
                })
            } else {
                _fire(type)
            }
            return this;
        },
        add: function (type, listener) {
            var el = this.el;
            if (window.addEventListener) {
                el.addEventListener(type, listener, false);
            } else {
                el.attachEvent('on' + type, listener);
            }
            this.store(type, listener)
        },
        remove: function (type, listener) {
            var el = this.el;
            if (window.removeEventListener) {
                el.removeEventListener(type, listener, {
                    passive: false
                }); //false
            } else {
                el.detachEvent('on' + type, listener);
            }
            this.delStore(type, listener)
        },
        clear: function (type) {
            var handlers = this.handlers;
            var _this = this;
            for (var key in handlers) {
                _.forEach(handlers[key], function (t) {
                    if (type === "") {
                        _this.remove(t.type, t.listener)
                    } else {
                        if (t.type === type) {
                            _this.remove(t.type, t.listener)
                        }
                    }
                });
            }
        }

    })
});


//快捷键
_package("shortcut", _, function () {
    var keycodeMap = {
        backspace: 8,
        tab: 9,
        clear: 12,
        enter: 13,
        shift: 16,
        control: 17,
        alt: 18,
        capeLock: 20,
        esc: 27,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        leftarrow: 37,
        uparrow: 38,
        rightarrow: 39,
        downarrow: 40,
        insert: 45,
        delete: 46,
        numLock: 144
    }
    var Shortcut = function (el, events) {
        if (!(this instanceof Shortcut)) return new Shortcut(el, events);
        this.events = events;
        this.el = el || document;
        var _this = this;
        var _bind = function (el) {
            _.event(el, {
                keydown: _this.init.bind(_this),
            })
        }
        if (_.type(el) === "array") {
            _.forEach(el, function (t) {
                _bind(t)
            })
        } else {
            _bind(el)
        }
    }
    return _.createClass(Shortcut, {
        init: function (e) {
            var events = this.events;
            // var el = this.el;
            var keyCode = 0,
                e = e || event;
            keyCode = e.keyCode || e.which || e.charCode; //支持IE、FF 
            // var target = e.target;
            for (var key in events) {
                if (keyCode === keycodeMap[key]) {
                    events[key] && events[key](e)
                }
            }
        }
    })
});


//日期
_package("time", _, function () {
    function Time(dateValue) {
        if (!(this instanceof Time)) return new Time(dateValue);
        var t = this.date = this.constructor.toDate(dateValue);
        this.year = t.getFullYear();
        this.month = t.getMonth() + 1;
        this.day = t.getDate(); //日期 day_of_month
        this.hour = t.getHours();
        this.minute = t.getMinutes();
        this.second = t.getSeconds();
        this.msecond = t.getMilliseconds(); //毫秒 
        this.day_of_week = t.getDay() === 0 ? 7 : t.getDay(); //  星期几   What day is today
        // 中国的概念是周一是每周的开始, 周日12pm是每周结束.

        this.time = t.getTime();
        this.quarter = (t.getMonth() + 3) / 3 << 0; // //季度 
    }
    return _.createClass(Time, {
        // 转化为指定格式的String 
        // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
        // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
        // 例子： 
        // (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
        // (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
        format: function (fmt) {
            var self = this;
            fmt = fmt || "yyyy-MM-dd hh:mm:ss.S";
            var date = this.date
            var o = {
                "y+|Y+": this.year, //年份4位特殊处理
                "M+": this.month,
                "d+|D+": this.day,
                "h+|H+": this.hour,
                "m+": this.minute,
                "s+": this.second,
                "q+": this.quarter,
                "S": this.msecond,
            };
            Object.keys(o).forEach(function (k, i) {
                var v = '' + o[k];
                fmt = fmt.replace(new RegExp(k, 'g'), function (t) {
                    return i === 0 ? v.substr(4 - t.length) : t[1] ? self.constructor.zerofill(v) : v;
                })
            });
            return fmt;
        },
        //设置当前时间  ，保持当前日期不变
        set: function (str) {
            if (this.constructor.isTimeString(str)) str = this.format("yyyy-MM-dd") + " " + str;
            return this.constructor.toDate(str);
        },
        //当前时间
        setCurTime: function () {
            return this.set(this.constructor().format("HH:mm:ss"));
        },
        add: function (interval, number, date) {
            return this.constructor.add(interval, number, date)
        },
        utc: function () {
            return Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.msecond)
        },
        //时区
        zone: function () {
            return (this.time - this.utc()) / 3600000;
        },
        diff: function (interval, date1) {
            return this.constructor.diff(interval, this.date, date1)
        },

        //
        // weekOfMonth: function() {

        // },

        //一年中的第几周 WEEK_OF_Year WEEKNUM
        // 以周一为周首，周日为周末  以完整的一周计算，可能第一周不足7天
        //此处按7天一周计算 
        week: function (dateStr) {
            var day_of_year = 0;
            var d = dateStr ? this.constructor(dateStr) : this;
            if (!d) return "";
            var years = d.year,
                month = d.month - 1,
                day = d.day,
                days = [31, 28, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            //4年1闰
            if (Math.round(years / 4) === years / 4) days[1] = 29;
            days.forEach(function (t, i) {
                if (i <= month) day_of_year += day + (i === 0 ? 0 : days[i - 1]);
            });
            return Math.ceil(day_of_year / 7);
        }
    }, {
        //_.time.toDate("09:30:00")
        //_.time.toDate(timeRange[0].begin.format("yyyy-MM-dd") + " " + (new Date()).format(" HH:mm:ss"))
        // 指定时间  hh:mm:ss     默认当天日期  
        // 指定日期  yyyy-MM-dd   默认时间 00:00:00  (非当前时间)  
        toDate: function (str) {
            if (str == null) {
                return new Date();
            } else if (_.type(str) === "date") {
                return new Date(+str); //new
            } else if (/^\d*$/.test(str)) {
                return new Date(+str);
            } else if (_.type(str) == "string") {
                if (this.isTimeString(str)) str = this().format("yyyy-MM-dd") + " " + str;
                return new Date(Date.parse(str.replace(/-/g, "/")));
            }
            return str;
        },
        // 时间格式 hh:mm:ss 
        isTimeString: function (str) {
            return /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.test(str);
        },

        set: function (date, time) {
            return this.toDate(time ? date + ' ' + time : date);
            // var self = this;

            // if (this.isTimeString(time)) {
            //     //时间补0
            //     time = time.replace(/\d{1,2}/g, function(t) {
            //         return self.zerofill(t)
            //     });
            //     // str.replace(reg, function(t, h, m, s) {
            //     //     console.log(t + ":----")
            //     //     console.log("h:" + h)
            //     //     console.log("m:" + m)
            //     //     console.log("s:" + s)
            //     //     return self.zerofill(t)
            //     // })
            //     //(new Date()).format("yyyy-MM-dd")
            //     date += ' ' + time;
            // }

            // return new Date(Date.parse(date.replace(/-/g, "/")));
        },
        //补0
        zerofill: function (n) {
            n = '' + n;
            return n[1] ? n : '0' + n;
        },
        //时长 格式化
        durationFormat: function (duration) {
            var self = this;
            if (typeof duration !== 'number' || duration < 0) return "00:00";
            var hour = duration / 3600 << 0;
            duration %= 3600;
            var minute = duration / 60 << 0;
            duration %= 60;
            var second = duration << 0;
            var arr = [minute, second];
            if (hour > 0) arr.unshift(hour);
            return arr.map(function (n) {
                return self.zerofill(n)
            }).join(':');
        },

        //映射短名字
        shortNameMap: function (s) {
            s = ('' + s).toLowerCase();
            var m = {
                "y": "year",
                "m": "month",
                "d": "day",
                "w": "week",
                "h": "hour",
                "n": "minute",
                "min": "minute",
                "s": "second",
                "l": "msecond",
                "ms": "msecond",
            };
            return s in m ? m[s] : s;
        },
        //时间间隔
        diff: function (interval, date1, date2) {
            var t1 = this(date1),
                t2 = this(date2),
                _diff = t1.time - t2.time,
                seconds = 1000,
                minutes = seconds * 60,
                hours = minutes * 60,
                days = hours * 24,
                years = days * 365;

            switch (this.shortNameMap(interval)) {
                case "year":
                    result = t1.year - t2.year; //_diff/years
                    break;
                case "month":
                    result = (t1.year - t2.year) * 12 + (t1.month - t2.month);
                    break;
                case "day":
                    result = Math.round(_diff / days);
                    break;
                case "hour":
                    result = Math.round(_diff / hours);
                    break;
                case "minute":
                    result = Math.round(_diff / minutes);
                    break;
                case "second":
                    result = Math.round(_diff / seconds);
                    break;
                case "msecond":
                    result = _diff;
                    break;
                case "week":
                    result = Math.round(_diff / days) % 7;
                    break;
                default:
                    result = "invalid";
            }
            return result;
        },
        add: function (interval, number, date) {
            var date = this.toDate(date);
            switch (this.shortNameMap(interval)) {
                case "year":
                    return new Date(date.setFullYear(date.getFullYear() + number));
                case "month":
                    return new Date(date.setMonth(date.getMonth() + number));
                case "day":
                    return new Date(date.setDate(date.getDate() + number));
                case "week":
                    return new Date(date.setDate(date.getDate() + 7 * number));
                case "hour":
                    return new Date(date.setHours(date.getHours() + number));
                case "minute":
                    return new Date(date.setMinutes(date.getMinutes() + number));
                case "second":
                    return new Date(date.setSeconds(date.getSeconds() + number));
                case "msecond":
                    return new Date(date.setMilliseconds(date.getMilliseconds() + number));
            }
            return date;
        }

    })
});


//菜单
_package("nav", _, function () {
    var Nav = function (options) {
        if (!(this instanceof Nav)) return new Nav(options);

        var options = this.options = _.extend({
            menu: [{
                    label: "配置管理",
                    url: "github.com",
                    children: [{
                        label: "配置管理1",
                        url: "g.cn"
                    }]
                },
                {
                    label: "配置管理2",
                    children: [{
                        label: "配置管理21"
                    }]
                }
            ],
            info: {
                text: ""
            }
        }, options)
        var el = _.query(options.el);
        var menu = options.menu;
        var logo = options.logo;
        var info = options.info;
        var genLink = function (t) {
            return t.url ? _.a(t.label, {
                href: t.url
            }) : t.label
        }
        var url = location.href;
        var cls = {
            0: "index-nav-frame-line",
            1: "index-nav-frame-line-center",
            2: "index-nav-frame-line-li"
        }
        var checkActive = function (t) {
            if (url.indexOf(encodeURI(t.url)) >= 0) {
                return true;
            }
            var children = t.children
            if (children) {
                for (var i = 0; i < children.length; i++) {
                    if (checkActive(children[i])) {
                        return true
                    }
                }
            }
        }

        var lines = menu.map(function (t, i) {
            var children = t.children
            var lineCenter = [];
            if (children) {
                var lis = children.map(function (t) {
                    if (t.hide) return null;
                    return _.div(genLink(t), {
                        "class": cls["2"]
                    })
                })
                lineCenter = _.div(lis, {
                    "class": cls["1"]
                })
            }
            // var active = url.indexOf(t.url) >= 0 ? " active" : "";
            var active = checkActive(t) ? " active" : "";
            return _.div([genLink(t)].concat(lineCenter), {
                "class": cls["0"] + active,
                tabindex: "-1"
            }, {
                click: function (e) {
                    _.queryAll("." + cls["0"]).forEach(function (t) {
                        t.className = cls["0"]
                    })
                    this.className = cls["0"] + " active"
                }
            })
        })
        var logo = _.div(_.img(logo), {
            "class": "nav-small",
            style: _.inStyle(logo),
            tabindex: "-1"
        })

        var info = _.div(info.text, {
            "class": "index-nav-info"
        })

        var navIndex = _.div([logo].concat(lines).concat([info]), {
            "class": "index-nav"
        })
        el.appendChild(navIndex)
    }
    return _.createClass(Nav, {

    });
});


_package("grid", _, function () {
    function Grid(options) {
        if (!(this instanceof Grid)) return new Grid(options);
        this.config = _.extend(this.getGridConfig(), options)
        this.tname = options.tname || ""
        this.tbl = options.tbl || []
        this.rs = options.rs || []
        this.events = options.events || {};
        this.count = this.length;
        this.outputType = options.outputType
        if (!this.outputType && this.config.fixedhead) {
            this.outputType = "fixedhead"
        }
        this.typs = [];
        this.fmts = [];
        this.props = [];
        this.offset = 0;
        if (this.config.check) this.offset++;
        if (this.config.seq) this.offset++;
        return this.grid = this._output()
    }
    return _.createClass(Grid, {
        getGridConfig: function () {
            var gridConfig = [{
                    label: "显示字段别名",
                    checked: true,
                    name: "label"
                }, {
                    label: "显示序号列",
                    checked: true,
                    name: "seq"
                },
                {
                    label: "显示选择列",
                    checked: true,
                    name: "check"
                },
                {
                    label: "合计数字列",
                    checked: true,
                    name: "statistic"
                },
                {
                    label: "固定表头",
                    checked: false,
                    name: "fixedhead"
                },
                {
                    label: "显示tfoot",
                    checked: true,
                    name: "showTFoot"
                }
                // {
                //     label: "允许多表查询",
                //     checked: true,
                //     name: "showMultisql"
                // }
            ];
            var config = {}
            gridConfig.forEach(function (t) {
                var ipt = _.query("input[name='" + t.name + "']")
                var key = t.name; //.toLowerCase();
                config[key] = ipt ? ipt.checked : t.checked;
            })
            return config
        },
        _output: function () {
            var _this = this;
            this.shortcut();
            var colgroup = this._colGroup();
            var thead = this._thead();
            var tbody = this._tbody();
            var tfoot = this.tfoot;
            var tname = this.tname;
            var optPanel = this._optPanel();
            var fixedfoot = this.config.fixedfoot;
            switch (this.outputType) {
                case "colgroup":
                    return colgroup;
                    break;
                case "thead":
                    return thead;
                    break;
                case "tbody":
                    return tbody;
                    break;
                case "tfoot":
                    return tfoot;
                    break;
                case "fixedhead":
                    var cols = colgroup
                    if (fixedfoot) { //表尾固定
                        return _.div([
                            _.div(_.table([cols, thead], {
                                tablename: tname
                            }), {
                                "class": "table-fixed-head"
                            }),
                            _.div(_.table([cols.cloneNode(true), tbody], {
                                tablename: tname
                            }), {
                                "class": "table-fixed-body"
                            }),
                            _.div(_.table([cols.cloneNode(true), tfoot], {
                                tablename: tname
                            }), {
                                "class": "table-fixed-foot"
                            })
                        ], {
                            "class": "dataintable",
                            tablename: tname
                        })

                    }
                    return _.div([
                        _.div(_.table([cols, thead], {
                            tablename: tname
                        }), {
                            "class": "table-fixed-head"
                        }),
                        _.div(_.table([cols.cloneNode(true), tbody, tfoot], {
                            tablename: tname
                        }), {
                            "class": "table-fixed-body"
                        })
                    ], {
                        "class": "dataintable",
                        tablename: tname
                    })
                    break;
                default:
                    return _.div([_.table([colgroup, thead, tbody, tfoot], {
                        tablename: tname
                    }), optPanel], {
                        "class": "dataintable",
                        tablename: tname
                    }, {
                        click: function (e) {
                            _this.activeGrid(e.target)
                        }
                    });
            }
        },
        _colGroup: function () {
            //定义列宽
            var tbl = this.tbl;
            var offset = this.offset
            var config = this.config
            var defWidth = (100 - 5 * offset) / tbl.length + "%"
            var colgroup = tbl.map(function (t) {
                return _.col("", {
                    style: "width: " + (t.width ? t.width : defWidth) + ";"
                })
            })
            if (config.seq) colgroup.unshift(_.col("", {
                style: "width: 5%;"
            }));
            if (config.check) colgroup.unshift(_.col("", {
                style: "width: 5%;"
            }));
            // //滚动条占位
            // colgroup.push(_.col("", {
            //     style: "width: 40px;"
            // }));
            return _.colgroup(colgroup)
        },
        _row: function (r, i) {
            var _this = this;
            var config = this.config;
            var tfoot = this.tfoot;
            var props = this.props;
            var fmts = this.fmts;
            var typs = this.typs;
            var offset = this.offset;
            var count = this.count
            var cell = typs.map(function (t, j) {
                var typ = t; //typs[j]
                var fmt = fmts[j]
                var prop = props[j]
                var val = r[prop]
                //计算
                switch (typ) {
                    case "number":
                        var colIndex = j + offset;
                        //数据行累加计算
                        if (i > 0 && val) {
                            tfoot[colIndex] += parseFloat(val);
                        }
                        //最后一行，处理小数
                        if (i === count) {
                            //保留1位并去掉多余0
                            _this.tfoot[colIndex] = parseFloat(_this.tfoot[colIndex]
                                .toFixed(1))
                        }
                        break;
                    case "date":
                        t = [_.createEle("i", "", {
                            "class": "date"
                        }), fmt ? _time(val).format(fmt) : val]

                        break;
                }
                return _.td(val, {
                    "class": typ,
                    prop: prop
                });
            });
            if (config.seq) cell.unshift(_.td(i === 0 ? "#" : i));
            if (config.check) cell.unshift(_.td(_.checkbox()));
            return _.tr(cell, {
                rowid: i
            })
        },
        _thead: function () {
            var _this = this;
            var tbl = this.tbl;
            var config = this.config;
            var orderby = config.orderby || "";
            var typs = this.typs;
            var fmts = this.fmts;
            var props = this.props;
            var thead =
                tbl.map(function (t) {
                    var typ = t.type ? t.type : "string";
                    var fmt = t.format ? t.format : "";
                    var lable = t.label ? t.label : t;
                    var prop = t.prop ? t.prop : t;
                    var seq = "";
                    var hide = !!t.hide;
                    if (!config.label) lable = prop;
                    //排序
                    if (prop === orderby.split(" ")[0]) {
                        seq = orderby.split(" ")[1] || "asc"
                    }
                    if (!hide) {
                        if (typ === "number" && config.statistic && _.type(config
                                .showTFoot) === "undefined") config.showTFoot = true;
                        typs.push(typ);
                        fmts.push(fmt);
                        props.push(prop)
                    }
                    return hide ? "" : _.th([_.div(lable, {
                        "class": "text"
                    }), _.div("", {
                        "class": "icon"
                    })], {
                        "class": typ,
                        prop: prop,
                        seq: seq
                    }, {
                        click: function (e) {
                            _this._sort(e.target)
                        }
                    });
                });

            if (config.seq) thead.unshift(_.th("#"));
            if (config.check) thead.unshift(_.th(_.checkbox(), {
                "class": "selectAll"
            }, {
                click: function (e) {
                    _this.selectAll(e.target)
                }
            }));
            //滚动条占位
            // thead.push(_.th(""))
            return _.thead(thead, {}, {
                click: function (e) {
                    _this.avtiveCol(e.target)
                }
            });
        },
        _tbody: function () {
            var _this = this;
            var rs = this.rs;
            var config = this.config;
            var count = this.count;
            var offset = this.offset;
            var typs = this.typs;
            var tbl = this.tbl;
            var props = this.props;
            var tfoot = [];
            //代替  Array.fill
            for (var i = 0; i < offset; i++) {
                tfoot.push("")
            }
            this.tfoot = tfoot.concat(typs).map(function (t, i) {
                return i === 0 ? "合计" : t === "number" ? 0 : "";
            });
            var tbody =
                count === 0 ? _.createEle("tr td", "未查到记录", {
                    colspan: tbl.length + offset
                }) :
                rs.map(function (r, i) {
                    return _this._row(r, i + 1)
                });

            this.tfoot = config.showTFoot ? this.tfoot.map(function (t, i) {
                return _.td(t, {
                    "class": t === "" ? "string" : "number",
                    prop: i >= offset ? props[i - offset] : ""
                });
            }) : "";
            //滚动条占位
            // this.tfoot.push(_.td(""))
            this.tfoot = _.tfoot(this.tfoot);
            return _.tbody(tbody, {}, {
                click: function (e) {
                    _this.activeCell(e.target);
                    _this.activeRow(e.target);
                }
            });
        },
        _sort: function (el) {
            var _this = this;
            var th = _.closest(el, "th")
            var prop = _.get(th, "prop");
            var seq = _.get(th, "seq")
            var typ = _.get(th, "class")
            var ths = _.queryAll("th[seq]", _this.grid)
            _.forEach(ths, function (t) {
                if (_.get(t, "prop") !== prop)
                    _.set(t, "seq", "")
            })
            _.set(th, "seq", seq === "asc" ? "desc" :
                "asc")
            _this.rs.sort(_.sortBy(prop, seq === "asc", typ))
            var tbody = _this._tbody();
            var oldTbody = _.query("tbody", _this.grid)
            _.replace(oldTbody, tbody)
        },
        _optPanel: function () {
            var _this = this;
            var optPanel = _.div([_.btn("删除", {}, {
                click: function (e) {
                    var el = e.target,
                        table = _.closest(el, ".dataintable");
                    var cbs = _.queryAll(
                        "tbody input[type='checkbox']:checked",
                        table);
                    var tablename = _.get(table, "tablename")
                    var sqls = []
                    _.forEach(cbs, function (t) {
                        //  sql=`delete from ${tablename} where id=`
                        var tr = _.closest(t, "tr")
                        var rowid = _.get(tr, "rowid")
                        sqls.push({
                            tbl: tbl,
                            // sql: `delete from ${tablename} where rowid=${rowid}`
                        })
                    })
                    _this.events.del && _this.events.del(sqls);
                    // _this.emit("setSqlcmd",sqls)
                }
            }), _.btn("取消", {}, {
                click: function (e) {
                    var el = e.target,
                        table = _.closest(el, ".dataintable");
                    var cbs = _.queryAll(
                        "input[type='checkbox']:checked", table);
                    _.forEach(cbs, function (t) {
                        t.checked = false;
                    })
                    optPanel.style.overflow = "hidden"
                }
            })], {
                "class": "optPanel"
            })
            return optPanel
        },
        selectAll: function (el) {
            var tbody = _.query("tbody", this.grid);
            if (el.nodeName.toLowerCase() === "input" && _.get(el, "type") === "checkbox") {
                //全选
                var inputs = _.queryAll("input[type='checkbox']", tbody);
                inputs && _.forEach(inputs, function (t) {
                    t.checked = el.checked; //!t.checked;
                })
            }
        },
        avtiveCol: function (el) {
            this.inactiveCell()
            var th = _.closest(el, "th");
            var prop = _.get(th, "prop");
            var tds = _.queryAll("td[prop='" + prop + "']", this.grid);
            tds && _.forEach(tds, function (t) {
                _.set(t, "active", "")
            })
        },
        activeCell: function (el) {
            this.inactiveCell()
            var td = _.closest(el, "td");
            if (td && ["string", "number"].indexOf(td.className) >= 0)
                _.set(td, "active", "");
        },
        inactiveCell: function () {
            var td = _.queryAll("td[active]", this.grid);
            td && _.forEach(td, function (t) {
                _.remove(t, "active")
            })
        },
        activeRow: function (el) {
            var oldTr = _.query("tr[active]", this.grid);
            oldTr && _.remove(oldTr, "active")
            var tr = _.closest(el, "tr");
            tr && _.set(tr, "active", "");
        },
        activeGrid: function (el) {
            var table = _.query("table[active]")
            table && _.remove(table, "active")
            _.set(this.grid, "active", "");
        },
        //快捷键
        shortcut: function () {
            //选择grid
            document.body.onclick = function (e) {
                var el = e.target;
                var oldGrid = _.query(".dataintable[active]")
                _.remove(oldGrid, "active")
                var grid = _.closest(el, ".dataintable")
                _.set(grid, "active", "")
            };
            document.onkeydown = function (e) {
                var grid = _.query(".dataintable[active]")
                var keyCode = 0,
                    e = e || event;
                keyCode = e.keyCode || e.which || e.charCode; //支持IE、FF 
                switch (keyCode) {
                    case 13: // enter 键
                        var cell = _.query("td[active]", grid)
                        // var input = _.query("input", cell)
                        var input = _.query("div[contenteditable]", cell)
                        if (cell && input) {
                            cell.innerText = input.innerText
                        }
                        // cell.innerText = input.value;
                        _.remove(cell, "update")
                        break;
                    case 27: // 按 Esc 

                        break;
                    case 37: //左箭头
                        var cell = _.query("td[active]", grid)
                        if (!cell) return;
                        if (_.has(cell, "update")) {
                            return
                        }
                        var val = cell.innerText
                        var prop = _.get(cell, "prop")
                        // var input = _.input(val, {
                        //     name: prop
                        // })
                        var input = _.divInput(val, {
                            name: prop
                        })
                        cell.innerText = "";
                        _.append(cell, input)
                        _.set(cell, "update", "")
                        setTimeout(function () {
                            input.focus();
                            input.value = '';
                            input.value = val;
                        }, 0)
                        break;
                    case 38: //上箭头
                        var tr = _.query("tr[active]", grid)
                        if (!tr) return;
                        var rowid = _.get(tr, "rowid");

                        var cell = _.query("td[active]", grid)
                        var prop = _.get(cell, "prop")

                        _.remove(tr, "active")
                        _.remove(cell, "active")


                        var newRow = _.query("tr[rowid='" + (Number(rowid) - 1) + "']", grid)
                        if (newRow) {
                            _.set(newRow, "active", "")
                            var newCell = _.query("td[prop='" + prop + "']", newRow)
                            _.set(newCell, "active", "")
                        }
                        break;
                    case 40: //下箭头
                        var tr = _.query("tr[active]", grid)
                        if (!tr) return;
                        var rowid = _.get(tr, "rowid");

                        var cell = _.query("td[active]", grid)
                        var prop = _.get(cell, "prop")

                        _.remove(tr, "active")
                        _.remove(cell, "active")
                        var newRow = tr.nextSibling;
                        if (newRow) {
                            _.set(newRow, "active", "")
                            var newCell = _.query("td[prop='" + prop + "']", newRow)
                            _.set(newCell, "active", "")
                        }

                        break;
                }
                console.log(e.keyCode)
            };
        }
    })
});


//数据库
_package("websql", _, function () {
    var Websql = function (options) {
        if (!(this instanceof Websql)) return new Websql(options);
        var options = this.options = _.extend({
            dbname: "mydb",
            version: "1.0",
            desc: "teset db",
            dbsize: 2 * 1024 * 1024
        }, options)

        //创建数据库

        var db = this.db = window.openDatabase(
            options.dbname,
            options.version,
            options.desc,
            options.dbsize
        );
        //表结构
        this.tbls = options.tbls || [];

        //日期表
        this.tbls.sys_log = [{
                prop: "time",
                label: '时间',
                type: "date",
                format: "yyyy-mm-dd hh:mm:ss"
            },
            {
                prop: "sql",
                label: 'SQL',
                type: "sql"
            },
            {
                prop: "duration",
                label: '执行时间',
                type: "number"
            }
        ]
        //表数据
        this.data = options.data;
        //所有数据
        this.rs = [];
        //[{
        //     tbl:tbl
        //     sql:sql
        // }]
        this.sqls = [];
        this.gridConfig = [{
                label: "显示字段别名",
                checked: true,
                name: "label"
            }, {
                label: "显示序号列",
                checked: true,
                name: "seq"
            },
            {
                label: "显示选择列",
                checked: true,
                name: "check"
            },
            {
                label: "合计数字列",
                checked: true,
                name: "statistic"
            },
            {
                label: "固定表头",
                checked: false,
                name: "fixedhead"
            },
            // {
            //     label: "允许多表查询",
            //     checked: true,
            //     name: "showMultisql"
            // }
        ]
    }

    return _.createClass(Websql, {
        createTbls: function (tbls) {
            var tbls = tbls || this.tbls;
            var _this = this;
            _this.sqls = [];
            this.db.transaction(function (tx) {
                for (var t in tbls) {
                    var flds = tbls[t].map(function (t) {
                        return (t.prop ? t.prop : t) + (t.pk ? " unique" : "");
                    });
                    // var sql = `CREATE TABLE IF NOT EXISTS ${t}(${flds})`
                    var sql = "CREATE TABLE IF NOT EXISTS ${t}(${flds})".replace("${t}", t).replace("${flds}", flds)
                    console.log(sql)
                    _this.sqls.push({
                        tbl: t,
                        sql: sql
                    })
                    // tx.executeSql(sql, [], function (ctx, result) {
                    //     console.log("创建表成功 " + t);
                    // }, function (tx, error) {
                    //     console.error('创建表失败:' + t + error.message);
                    //     // throw new Error(error);
                    //     _this.errorCall && _this.errorCall(error.message)
                    // })
                }
                _this.setSqlcmd.call(_this)
            });
        },
        insert: function (tbl, rs, callback) {
            var _this = this;
            _this.sqls = [];
            this.db.transaction(function (tx) {
                var typs = [];
                var flds = _this.tbls[tbl].map(function (t) {
                    typs.push(t.type)
                    return t.prop ? t.prop : t;
                });
                console.log(flds)
                rs.forEach(function (r) {
                    // var sql = `INSERT INTO ${tbl}(${flds}) values(${new Array(flds.length).fill("?")})`;
                    var vs = flds.map(function (t, i) {
                        switch (typs[i]) {
                            // case "string":
                            // break;
                            case "number":
                                return r[t]
                            default:
                                return "'" + r[t] + "'"
                        }
                    });
                    _this.sqls.push({
                        tbl: tbl,
                        // sql: `INSERT INTO ${tbl}(${flds}) values(${vs})`
                        sql: "INSERT INTO ${tbl}(${flds}) values(${vs})".replace("${tbl}", tbl).replace("${flds}", flds).replace("${vs}", vs)
                    })
                    // tx.executeSql(sql, vs, function (tx, result) {
                    //     console.log("insert ok")
                    //     // console.log(tx, result)

                    // }, function (tx, error) {
                    //     console.log("insert fail")
                    //     // console.log(error.message)
                    //     // throw new Error(error);
                    //     _this.errorCall && _this.errorCall(error.message)
                    // });
                })
                //callback && callback(tbl);
                _this.setSqlcmd.call(_this)
            });
        },
        empty: function (tbls, callback) {
            var tbls = tbls == null || tbls.length == 0 ? this.tbls : tbls;
            var _this = this;
            _this.sqls = []
            for (var t in tbls) {
                _this.sqls.push({
                    // sql: `DELETE FROM ${t}`,
                    sql: "DELETE FROM ${t}".replace("${t}", t),
                    tbl: t
                })
            }
            // this.exe(_this.sqls, callback)
            _this.setSqlcmd.call(_this)
            // var del = function (tx, t) {
            //     var sql = `DELETE FROM ${t}`
            //     console.log(tx, sql)
            //     tx.executeSql(sql, [], function (ctx, result) {
            //         console.log("删除表成功 " + t);
            //     }, function (tx, error) {
            //         console.error('删除表失败:' + t + error.message);
            //         // throw new Error(error);
            //         _this.errorCall && _this.errorCall(error.message)
            //     })
            // }
            // this.db.transaction(function (tx) {
            //     for (var t in tbls) {
            //         del(tx, t)
            //         callback && callback(t)
            //     }
            // });
        },
        del: function (tbl, ids) {
            // var sql = `DELETE FROM ${tbl} Where rowid in [${ids}]`
            var sql = "DELETE FROM ${tbl} Where rowid in [${ids}]".replace("${tbl}", tbl).replace("${ids}", ids)

            this.exe({
                sql: sql,
                tbl: tbl
            })
            // this.db.transaction(function (tx) {
            //     console.log(sql)
            //     tx.executeSql(sql, [], function (ctx, result) {
            //         console.log("删除表成功 " + tbl);
            //     }, function (tx, error) {
            //         console.error('删除表失败:' + tbl + error.message);
            //     })
            // })
        },
        drop: function () {
            var tbls = tbls == null || tbls.length == 0 ? this.tbls : tbls;
            var _this = this;
            _this.sqls = []
            for (var t in tbls) {
                _this.sqls.push({
                    // sql: `drop table ${t}`,
                    sql: "drop table ${t}".replace("${t}", t),
                    tbl: t
                })
            }
            _this.setSqlcmd.call(_this)
        },
        //查询
        list: function (tbls, options, callback) {
            var arr = ["WHERE 1=1"]
            for (var key in options) {
                if (key !== "orderby" && key !== "groupby") {
                    if (_.type(options[key]) === "number") {
                        arr[arr.length - 1] = key + "=" + options[key] + "";
                    } else {
                        arr[arr.length - 1] = key + "='" + options[key] + "'";
                    }
                }
            }
            var condition = arr.join(" & ");
            if (options.groupby) {
                condition += " GROUP BY " + options.groupby
            }
            if (options.orderby) {
                condition += " ORDER BY " + options.orderby
            }

            var tbls = tbls || [];
            var _this = this;
            _this.sqls = tbls.map(function (t) {
                return {
                    tbl: t,
                    // sql: `SELECT * FROM ${t} ${condition}`
                    sql: "SELECT * FROM ${t} ${condition}".replace("${t}", t).replace("${condition}", condition)
                }
            })
            this.exe(_this.sqls, callback)
            _this.setSqlcmd.call(_this)
        },
        //执行sql
        exe: function (sql, callback, errorCall) {
            var _this = this;
            var store = function (tx, sql, tbl) {
                // console.log(sql)

                console.time(sql);
                var timeStart = +new Date();
                tx.executeSql(sql, [], function (tx, results) {

                    _this.sqls.forEach(function (t) {
                        if (t.tbl === tbl) {
                            t.sql = sql
                        }
                    })
                    _this.rs[tbl] = [];
                    for (var i = 0; i < results.rows.length; i++) {
                        _this.rs[tbl].push(results.rows.item(i));
                    }
                    var timeEnd = +new Date();
                    console.timeEnd(sql);
                    var duration = timeEnd - timeStart
                    if (tbl !== "sys_log")
                        _this.log(sql, duration)

                    callback && callback.call(_this, _this.rs[tbl], tbl);
                }, function (tx, error) {
                    // console.error(  error.message);
                    errorCall && errorCall(error.message)
                });

            }
            this.db.transaction(function (tx) {
                if (_.type(sql) === "array") {
                    sql.forEach(function (t) {
                        store(tx, t.sql, t.tbl)
                    })

                } else {
                    store(tx, sql.sql, sql.tbl)
                }

            })
        },
        log: function (sql, duration) {
            // var sql=`insert into`
            // var sqlLog = `INSERT INTO sys_log values(?,?,?)`;
            var sqlLog = "INSERT INTO sys_log values(?,?,?)";

            var vals = [+new Date(), sql, duration]
            this.db.transaction(function (tx) {
                tx.executeSql(sqlLog, vals, function (tx, results) {
                    console.log(results)

                }, function (tx, error) {
                    // console.error(  error.message);
                    // errorCall && errorCall(error.message)
                })

            })

        },
        //表名导航
        hd: function () {
            var tbls = [];
            var _this = this;
            for (var tbl in _this.tbls) {
                if (tbl.indexOf("sys_") === -1) {
                    tbls.push(tbl)
                }
            }
            return _.wrap("ul", tbls.map(function (t) {
                return _.wrap("li", _.wrap("i", "") +
                    _.wrap("div", t, {
                        "class": "text"
                    })
                )
            }).join(""))
        },
        createHd: function () {
            var tbls = [];
            var _this = this;
            for (var tbl in _this.tbls) {
                if (tbl.indexOf("sys_") === -1) {
                    tbls.push(tbl)
                }
            }
            return _.ul(tbls.map(function (t) {
                return _.li([_.i(""),
                    _.div(t, {
                        "class": "text"
                    })
                ])
            }))
        },
        createSlide: function () {
            var _this = this;
            var hd = _.div(this.createHd(), {
                "class": "hd"
            }, {
                click: function (e) {
                    var el = e.target;
                    console.log(el)
                    var li = _.closest(el, "li")
                    var config = _this.getGridConfig();

                    if (li) {
                        var tname = li.innerText;
                        if (!config.multisql) {
                            _this.toggleHd(tname)
                            var actLis = _.queryAll(".slide .hd li[active]")
                            if (actLis) {
                                var tbls = []
                                actLis.forEach(function (t) {
                                    tbls.push(t.innerText);
                                })
                                _this.createList(tbls)
                            }
                        } else {
                            _this.createList([tname])
                            // _this.activeHd(tname)
                        }
                    }
                }
            })
            var bd = _.div("", {
                "class": "bd"
            })
            var container = _.div([hd, bd], {
                "class": "slide_container"
            })
            return _.div(container, {
                "class": "slide"
            })
        },
        createBtns: function () {
            var btns = [{
                key: "createTbls",
                val: "初始"
            }, {
                key: "add",
                val: "增加"
            }, {
                key: "empty",
                val: "清空"
            }, {
                key: "list",
                val: "列表"
            }, {
                key: "drop",
                val: "删表"
            }, {
                key: "log",
                val: "日志"
            }].map(function (t) {
                return _.btn(t.val, {
                    "class": t.key
                })
            })
            var _this = this;
            var btnGroup = _.div(btns, {
                "class": "btn-group"
            }, {
                click: function (e) {
                    var act = e.target.className.split(" ")[1]
                    console.log(e.target, act)
                    switch (act) {
                        case "list":
                            var tbls = [];
                            for (var tbl in _this.tbls) {
                                tbls.push(tbl)
                            }
                            _this.createList(tbls);
                            break;
                        case "add":
                            var tbls = []
                            _.queryAll(".dataintable").forEach(function (t) {
                                tbls.push(t.getAttribute("tablename"))
                            })
                            for (var tbl in _this.data) {
                                console.log(tbl)

                                // if(tbls.indexOf(tbl)>=0){

                                // }else{

                                // }

                                _this.insert(tbl, _this.data[tbl])

                                // _this.insert(tbl, data[tbl], tbls.indexOf(tbl) >= 0 ? _this.reflashList.bind(_this) : null)


                            }
                            break;
                        case "empty":
                            _this.empty([], _this.reflashList.bind(_this));
                            break;
                        case "del":
                            _this.del("SSF_ORDER_DETAILS", 1);
                            break;
                        case "log":
                            _this.createList(["sys_log"])
                            break;
                        default:
                            act && _this[act] && _this[act]();
                    }
                }
            })

            return btnGroup
        },
        reflashList: function (tbl) {
            // console.log(tbl);
            // var activeLi = document.querySelector(".slide .hd li[active]");


            // if (activeLi) {
            //     var tname = activeLi.innerText.trim();
            //     // if (tbl === tname) 
            //     this.createList([tname]);
            // }



            var tbls = [];
            _.forEach(_.queryAll(".dataintable"), function (t) {
                tbls.push(t.getAttribute("tablename"));
            })
            this.createList(tbls);
        },
        //代替showList  创建el方式替代字符串拼接
        createList: function (tbls, options) {
            var bd = document.querySelector(".slide .bd")
            console.log(bd)
            var _this = this;
            var tbls = tbls || []
            bd.innerHTML = "";
            _this.list(tbls, options || {}, function (rs, tname) {
                // bd.appendChild(_.li(_this.createGrid(tname, rs, options)))
                bd.appendChild(_.li(_.grid(_.extend({
                    tname: tname,
                    rs: rs,
                    tbl: _this.tbls[tname],
                    events: {
                        del: _this.setSqlcmd
                    }
                }, options))))
                // _this.setSqlcmd.call(_this)
            });
        },
        //sql关键字高亮
        hightlightSql: function (sql) {
            var keys = ["select", "from", "where", "desc", "asc", "on", "delete", "values",
                "if", "not", "EXISTS", "unique",
                "insert\\s+into", "create\\s+table", "drop\\s+table",
                "order\\s+by", "group\\s+by", "left\\s+join", "right\\s+join", "inner\\s+join"
            ]
            var reg1 = new RegExp("(" + keys.join("|") + ")", "gi");
            return sql.replace(reg1, function (t) {
                return _.wrap("font", (t.toUpperCase()).replace(/\s+/, " "), {
                    "class": "red"
                })
            }).replace(/;\s*/g, ";<br>")
        },
        setSqlcmd: function (tname) {
            var sqlcmd = _.query(".sqlcmd .textarea")
            var _this = this;

            if (sqlcmd) {
                // var tbls = this.getTbls()
                if (sqlcmd.tagName.toLowerCase() === "textarea") {
                    sqlcmd.value = this.sqls.map(function (t) {
                        return t.sql
                    }).join(";\n")
                    //  tbls.map(function (t) {
                    //     return (_this.sqls[t] || "").trim()
                    // }).join(";\n")
                } else { //contenteditable
                    // sqlcmd.innerHTML = tbls.map(function (t) {
                    //     return _this.hightlightSql((_this.sqls[t] || "").trim())
                    // }).join(";<br>")

                    // sqlcmd.innerHTML = _this.hightlightSql(tbls.map(function (t) {
                    //     return (_this.sqls[t] || "").trim()
                    // }).join(";"))

                    sqlcmd.innerHTML = _this.hightlightSql(this.sqls.map(function (t) {
                        return t.sql
                    }).join(";\n"))
                }
                // this.activeHd(tbls)
            }
        },
        getTbls: function () {
            var tbls = []
            _.forEach(_.queryAll(".dataintable"), function (t) {
                tbls.push(t.getAttribute("tablename"))
            })
            return tbls
        },
        //根据rs取得默认表结构
        getTbl: function (rs, tname) {
            var arr = _.obj2arr(rs[0]),
                keys = arr.keys,
                typs = arr.typs;
            var tbl = this.tbls[_.trim(tname)] || [];
            return keys.map(function (t, i) {
                var fld = tbl.filter(function (f) {
                    return f.prop === t
                })[0];
                return {
                    prop: t,
                    label: fld && fld.label || t,
                    type: fld && fld.type || typs[i],
                    format: fld && fld.format || ""
                }
            })

            // var tbl = this.tbls[tname] || this.getTbl(rs);
            // tbl.forEach(function (t) {
            //     t.hide=_.type(rs[0][t.prop]) === "undefined"
            // })
        },
        //字符串拼接方式 生成表格
        grid: function (tname, rs, options) {
            var tbl = this.tbls[tname];
            var _row = function (r, i) {
                var tag = "td",
                    arr = _.obj2arr(r),
                    vals = arr.vals;
                var cell =
                    (options.check ? _.wrap(tag, checkbox) : "") +
                    (options.seq ? _.wrap(tag, i === 0 ? "#" : i) : "") +
                    vals.map(function (t, j) {
                        //计算
                        switch (typs[j]) {
                            case "number":
                                var colIndex = j + offset;
                                //数据行累加计算
                                if (i > 0 && t) {
                                    tfoot[colIndex] += parseFloat(t);
                                }
                                //最后一行，处理小数
                                if (i === len) {
                                    //保留1位并去掉多余0
                                    tfoot[colIndex] = parseFloat(tfoot[colIndex].toFixed(1))
                                }
                                break;
                            case "date":
                                t = _.wrap("i", "", {
                                    "class": "date"
                                }) + t
                                break;
                        }
                        return _.wrap("td", t, {
                            "class": typs[j]
                        });
                    }).join("");
                return _.wrap("tr", cell, {
                    rowid: i
                })
            }
            //类型
            var typs = [];
            var offset = 0;
            if (options.check) offset++;
            if (options.seq) offset++;

            var len = rs.length;
            var checkbox = _.wrap("div", '<input type="checkbox"/>');

            var thead = (options.check ? _.wrap("th", checkbox) : "") +
                (options.seq ? _.wrap("th", "#") : "") +
                tbl.map(function (t) {
                    var typ = t.type ? t.type : "string";
                    var lable = t.label ? t.label : t;
                    var prop = t.prop ? t.prop : t;
                    lable += _.wrap("div", "", {
                        "class": "icon"
                    })
                    typs.push(typ);
                    return _.wrap("th", lable, {
                        "class": typ,
                        prop: prop
                    });
                }).join("");

            var tfoot = new Array(offset).fill("").concat(typs).map(function (t, i) {
                return i === 0 ? "合计" : t === "number" ? 0 : "";
            });
            var tbody =
                len === 0 ? _.wrap("tr td", "未查到记录", {
                    colspan: tbl.length + offset
                }) :
                rs.map(function (r, i) {
                    return _row(r, i + 1)
                }).join("");

            tfoot = tfoot.map(function (t) {
                return _.wrap("td", t, {
                    "class": "number"
                });
            }).join("");
            return _.wrap("table",
                _.wrap("thead", thead) +
                _.wrap("tbody", tbody) +
                _.wrap("tfoot", tfoot), {
                    "class": "dataintable",
                    tablename: tname
                });
        },
        activeHd: function (tbl) {
            var lis = _.queryAll(".slide .hd li")
            var tbls = _.type(tbl) === "array" ? tbl : [tbl];
            lis.forEach(function (t) {
                if (tbls.indexOf(t.innerText) >= 0) {
                    t.setAttribute("active", "")
                } else {
                    t.removeAttribute("active");
                }
            })
        },
        toggleHd: function (tbl) {
            var lis = _.queryAll(".slide .hd li")
            _.forEach(lis, function (t) {
                if (t.innerText === tbl) {
                    t.hasAttribute("active") ? t.removeAttribute("active") : t.setAttribute("active", "")
                }
            })
        },
        //获取选中文本
        getSelectedText: function (inputDom) {
            if (document.selection) //IE
            {
                return document.selection.createRange().text;
            } else {

                var val = this.getTextareaValue(inputDom)
                return val.substring(inputDom.selectionStart,
                    inputDom.selectionEnd) || val;
            }
        },
        getTextareaValue: function (inputDom) {

            var val = "";
            if (inputDom.tagName.toLowerCase() === "textarea") {
                val = inputDom.value
            } else {
                val = inputDom.innerText
                //由于contenteditable属性产生的换行机制问题
                //纯文本模式下，会加Unicode等于10和160的2位字符，
                val = val.replace(/[\u000A|\u00A0]/g, function (t) {
                    return " "
                })
            }
            return val

            // for(var i=0 ;i<sql.length;i++){
            //     console.log(sql[i]+":"+sql.charCodeAt(i))
            // }

        },
        //设置高亮
        setTextSelected: function (inputDom, startIndex, endIndex) {
            if (inputDom.setSelectionRange) {
                inputDom.setSelectionRange(startIndex, endIndex);
            } else if (inputDom.createTextRange) //IE 
            {
                var range = inputDom.createTextRange();
                range.collapse(true);
                range.moveStart('character', startIndex);
                range.moveEnd('character', endIndex - startIndex - 1);
                range.select();
            }
            inputDom.focus();
        },
        createSqlcmd: function () {
            // var textarea = _.textarea("", {
            //     cols: "80",
            //     rows: "5",
            // })
            var _this = this;
            var textarea = _.div("", {
                contentEditable: "plaintext-only",
                "class": "textarea",
                // placeholder:"这里输入sql"
            }, {
                blur: function (e) { //sql语法高亮
                    textarea.innerHTML =
                        _this.hightlightSql(_this.getTextareaValue(textarea))
                }
            })

            var btn = _.btn("执行sql", {
                "class": "exesql"
            }, {
                click: function (e) {
                    var bd = document.querySelector(".slide .bd")
                    bd.innerHTML = "";
                    var options = {}
                    var sql = _this.getSelectedText(textarea) //textarea.value
                    if (!sql) {
                        bd.innerHTML = "请输入sql"
                        return;
                    }


                    var tnames = [];
                    _.forEach(sql.split(";"), function (t) {
                        //查询语句
                        if ((/select\s[\s\S]+from\s/i).test(t)) {
                            var tname = ((t.match(/from\s(\S+)\s?/i) || [])[1] || "sqlcmd").toUpperCase();
                            // console.log(tname)
                            _this.exe({
                                sql: t,
                                tbl: tname
                            }, function (rs, tbl) {
                                // bd.appendChild(_.li(_this.createGrid(tbl, rs, options)))
                                bd.appendChild(_.li(_.grid(_.extend({
                                    tbl: tbl,
                                    rs: rs,
                                    events: {
                                        del: _this.setSqlcmd
                                    }
                                }, options))))
                                tnames.push(tname)
                                _this.activeHd(tnames)
                            }, function (errormsg) {
                                bd.appendChild(document.createTextNode(errormsg))
                                _this.activeHd("")
                            })
                        } else {
                            //非查询语句
                            _this.exe({
                                sql: t,
                                tbl: ""
                            }, function () {
                                bd.appendChild(_.div(t + ";", {
                                    "class": "sql"
                                }))
                            }, function (errormsg) {
                                bd.appendChild(document.createTextNode(errormsg))
                            })
                        }
                    })

                }
            })

            var checkboxs = this.gridConfig.map(function (t) {
                return _.checkbox(t)
            })
            var btnGroup = _.div([btn].concat(checkboxs), {
                "class": "sqlcmd-btn-group"
            })
            return _.div([textarea, btnGroup], {
                "class": "sqlcmd"
            })
        },
        getGridConfig: function () {
            var config = {}
            _.forEach(this.gridConfig, function (t) {
                var val = _.query("input[name='" + t.name + "']").checked
                // var key = t.name.substring(4).toLowerCase();
                var key = t.name.toLowerCase();
                config[key] = val
            })
            return config
        }
    })
});

//向量  空间计算工具
_package("vector", _, function () {

    function Vector(opt) {
        if (!(this instanceof Vector)) return new Vector(opt);
        opt = opt || {};
        this.x = opt.x || 0;
        this.y = opt.y || 0;
        this.z = opt.z || 0;
    }
    return _.createClass(Vector, {
        // reset:function(){
        //     return this.constructor(this.opt);
        // },
        //相等 equals
        equal: function (v) {
            return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
        },
        clone: function () {
            return Vector({
                x: this.x,
                y: this.y,
                z: this.z
            });
        },
        //负向量 转180度  
        //negated
        neg: function () {
            this.x = -this.x;
            this.y = -this.y;
            this.z = -this.z;
            return this;
        },
        //法向量 normal vector 垂直向量 
        //Vector norm
        norm: function () {
            return Vector({
                x: -this.y,
                y: this.x
            });
        },
        //向量相加
        //Translate vector
        //translate(v1, v2):= v1.add(v2)
        add: function (v) {
            this.x += v.x;
            this.y += v.y;
            this.z += v.z;
            return this;
        },
        //向量相减
        sub: function (v) {
            this.x -= v.x;
            this.y -= v.y;
            this.z -= v.z;
            return this;
        },
        //缩放 scalar
        scale: function (s) {
            this.x *= s;
            this.y *= s;
            this.z *= s;
            return this;
        },
        //取模 向量长度  勾股定理
        //修改长度，改变向量的大小
        abs: function (len) {
            if (undefined === len) return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            var abs = this.abs();
            if (abs === 0) { //0向量
                this.x = len
            } else if (len !== abs) { //abs !== 0 &&
                this.scale(len / abs);
            }
            return this;
        },
        //方向 向量的角度
        deg: function (deg) {
            if (undefined === deg) return this.radToDeg(Math.atan2(this.y, this.x));
            var r = this.abs();
            this.x = r * _.cos(deg); // Math.cos(this.degToRad(deg));
            this.y = r * _.sin(deg); //Math.sin(this.degToRad(deg));
            return this;
        },
        //方向 向量的弧度
        rad: function (rad) {
            if (undefined === rad) return Math.atan2(this.y, this.x);
            var r = this.abs();
            this.x = r * Math.cos(rad);
            this.y = r * Math.sin(rad);
            return this;
        },
        //向量点积
        //Scale vector
        //scale(v1, factor):= v1.mul(factor)
        //Rotate vector around center
        //rotate(v, angle):= v.mul({abs: 1, arg: angle})
        //Rotate vector around a point
        //rotate(v, p, angle):= v.sub(p).mul({abs: 1, arg: angle}).add(p)
        mul: function (v) {
            return this.x * v.x || 0 + this.y * v.y || 0 + this.z * v.z || 0;
        },
        //夹角 根据两个向量夹角计算  Included angle
        ia: function (v) {
            return Math.acos(this.mul(v) / (this.abs() * v.abs()));
        },
        //是否垂直 Normal to
        isNorm: function (v) {
            return this.mul(v) === 0;
        },
        //角度转弧度
        degToRad: function (deg) {
            return deg * (Math.PI / 180);
        },
        //弧度转角度
        radToDeg: function (rad) {
            return rad * (180 / Math.PI);
        },
        //向量的绕Z轴旋转
        rotate: function (deg) {
            var ca = _.cos(deg),
                sa = _.sin(deg),
                x = this.x,
                y = this.y,
                rx = x * ca - y * sa,
                ry = x * sa + y * ca;
            this.x = rx;
            this.y = ry;
            return this;
        },

        //三维向量的叉积，向量积
        cross: function (v) {
            var x = this.x,
                y = this.y,
                z = this.z;
            this.x = y * v.z - z * v.y;
            this.y = z * v.x - x * v.z;
            this.z = x * v.y - y * v.x;
            return this;
        },
        //向量分裂
        split: function (n) {
            var vs = [];
            for (var i = 1; i <= n; i++) {
                vs[vs.length] = this.clone().scale(i / (n + 1));
            }
            return vs;
        },
        // 绕XY轴旋转
        rotateXY: function (a, b) {
            var ca = _.cos(a),
                sa = _.sin(a),
                cb = _.cos(b),
                sb = _.sin(b);
            var x = this.x,
                y = this.y,
                z = this.z,
                rz = y * sa + z * ca;
            this.y = y * ca - z * sa;
            this.z = x * -sb + rz * cb;
            this.x = x * cb + rz * sb;
            return this;
        },
        //透视比率 perspectiveRatio
        pr: function (viewDist) {
            viewDist = viewDist ? viewDist : 300;
            return viewDist / (this.z + viewDist);
        },
        //投射到屏幕上的二维点  project
        proj: function (pr) {
            pr = pr ? pr : this.pr();
            this.x *= pr;
            this.y *= pr;
            this.z = 0;
            return this;
        },

        //toPolar 转成极坐标
        toP: function (o) {
            var a = this.deg(),
                r = this.abs();
            return _pointPolar({
                a: a,
                r: r,
                o: o || this
            });
        }
    })
});

_package("color", _, function () {


    var regObj = {
        hex: /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/,
        hex3: /^#([0-9a-fA-f]{3})$/,
        hex6: /^#([0-9a-fA-f]{6})$/,
        rgba: /^[rR][gG][Bb][Aa]?[\(]([\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?),){2}[\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?),?[\s]*(0\.\d{1,2}|1|0)?[\)]{1}$/g
    }
    //#fff #ffffff
    var isHex = function (color) {
        return /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/.test(color);
    };
    //#fff
    var isHex3 = function (color) {
        return /^#([0-9a-fA-f]{3})$/.test(color);
    };
    //#ffffff
    var isHex6 = function (color) {
        return /^#([0-9a-fA-f]{6})$/.test(color);
    };
    var isRgba = function (color) {
        return /^[rR][gG][Bb][Aa]?[\(]([\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?),){2}[\s]*(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?),?[\s]*(0\.\d{1,2}|1|0)?[\)]{1}$/g.test(color)
    };

    var rgbaWrapper = function (rgbaArr) { //[1,1,1,1]
        return (rgbaArr.length === 4 ? 'rgba(' : 'rgb(') + rgbaArr + ')'
    };
    var rgbaArr = function (color) { //rgba(0,0,0,0.1)
        if (isRgba(color)) {
            return color.match(/0\.\d{1,2}|\d{1,3}/g).map(function (t) {
                return +t;
            })
        } else if (isHex(color)) {
            if (color.length === 4) { //#fff
                return color.match(/[0-9a-fA-f]{1}/g).map(function (t) {
                    return '0x' + t + t << 0
                })
            } else { //#ffffff
                return color.match(/[0-9a-fA-f]{2}/g).map(function (t) {
                    return '0x' + t << 0
                })
            }
        } else if (_.isArray(color)) {
            return color;
        } else if (_.isNumber(color)) {
            color &= 0xFFFFFF;
            return [
                (color >> 16) & 0xFF,
                (color >> 8) & 0xFF,
                color & 0xFF,
            ];
        }
    };
    var _max = function (arr) {
        return Math.max.apply(Math, arr)
    }
    var _min = function (arr) {
        return Math.min.apply(Math, arr)
    }

    var Color = function (color, alpha) {
        if (!(this instanceof Color)) return new Color(color, alpha);
        // color = color || '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6); //"#000";
        if (isRgba(color) || isHex(color)) {
            this.color = rgbaArr(color);
        } else {
            //分类颜色
            //红 100
            //绿 010
            //青 001 
            //黄 110 
            //紫 101
            //全彩 111
            //黑白灰 000
            var colorMap = {
                red: [1, 0, 0],
                green: [0, 1, 0],
                syan: [0, 0, 1],
                yellow: [1, 1, 0],
                purple: [1, 0, 1],
                gray: [0, 0, 0],
                colorful: [1, 1, 1]
            }

            var arr = color in colorMap ? colorMap[color] : colorMap["colorful"];
            var r = arr[0],
                g = arr[1],
                b = arr[2];
            if (r & g & b === 1) { //全彩
                arr = arr.map(function (t) {
                    return Math.random() * 255 << 0;
                });
            } else if (r & g & b === 0) { //灰
                var t = Math.random() * 255 << 0;
                arr = [t, t, t];
            } else {
                var rgb = 155;
                var c = (Math.random() * (255 - rgb) << 0) + rgb;
                arr = arr.map(function (t) {
                    return t === 1 ? (Math.random() * (255 - rgb) << 0) + rgb : Math.random() * (c / 2) << 0;
                });
            }
            if (alpha) arr[arr.length] = alpha;
            this.color = arr;
        }
    }
    return _.createClass(Color, {
            toString: function () {
                return rgbaWrapper(this.color);
            },
            hsla: function () {
                return "hsla(" + [Math.random() * 360 << 0] + ",50%,50%,0.5)";
            },
            hsl: function () { //微信小程序不支持hsl
                // return "hsl(" + [Math.random() * 360 << 0] + ",50%,50%)";
                var r, g, b, cc = this.color.map(function (t, i) {
                        t /= 255
                        if (i === 0)
                            r = t;
                        else if (i === 1)
                            g = t;
                        else(i === 2)
                        b = t;
                        return t
                    }),
                    max = _max(cc),
                    min = _min(cc),
                    l = (max + min) / 2,
                    s, h;
                if (max === min) {
                    s = 0;
                    h = 0;
                }
                if (l < 0.5)
                    s = (max - min) / (max + min)
                else
                    s = (max - min) / (2.0 - max - min)
                if (r === max)
                    h = (g - b) / (max - min)
                if (g === max)
                    h = 2.0 + (b - r) / (max - min)
                if (b === max)
                    h = 4.0 + (r - g) / (max - min)
                h = (h * 60 + 360) % 360
                s = s * 100 + '%'
                l = l * 100 + '%'
                return 'hsl(' + [h, s, l] + ')'
            },
            //深色  随机深色(rgb两位小于 80)，指定颜色加深
            dark: function (color, level) {
                color = color ? rgbaArr(color) : this.color;
                level = level || 0.5;
                return rgbaWrapper(color.map(function (t) {
                    return t * (1 - level) << 0
                }))
            },
            deepdark: function () {
                return this.dark(null, 0.1);
            },
            //浅色  
            light: function (color, level) {
                color = color ? rgbaArr(color) : this.color;
                level = level || 0.5;
                return rgbaWrapper(color.map(function (t) {
                    return t + (255 - t) * level << 0
                }))
            },
            //透明度
            alpha: function (a) {
                if (a) this.color[3] = a;
                return rgbaWrapper(this.color);
            },
            rgb: function (color, alpha) {
                if (!color) return this.alpha(alpha)
                return this.constructor.rgb(color, alpha)
            },
            //混合
            mix: function (color1, color2) {
                var args = Array.prototype.slice.call(arguments);
                args[args.length] = this.rgb();
                return this.constructor.mix(args);
            },
            //rgb2hex
            hex: function (color) {
                return this.constructor.hex(color || this.color);
            },
            //色相环
            circle: function (len) {
                return this.constructor.circle(len);
            },
            //互补色
            complementary: function (color) {
                return this.constructor.complementary(color || this.color);
            },
            //颜色过渡  gradient
            tween: function (color, step, easing) {
                return this.constructor.tween(this.color, color, step, easing)
            },
            // 灰度值的心理学公式  值越小越深 <192为深色
            grayLevel: function (color) {
                color = color ? rgbaArr(color) : this.color;
                return 0.30 * color[0] + 0.59 * color[1] + 0.11 * color[2]
            },
            isDark: function (color) {
                return this.grayLevel(color) < 192
            },
            isLight: function (color) {
                return !this.isDark(color)
            },
            //web安全色   
            webSafeColor: function (color) {
                if (!color) {
                    //216个安全色
                    var arr = ['00', '33', '66', '99', 'CC', 'FF'],
                        len = arr.length,
                        colorArr = [];
                    for (var r = 0; r < len; r++)
                        for (var g = 0; g < len; g++)
                            for (var b = 0; b < len; b++)
                                colorArr[colorArr.length] = '#' + arr[r] + arr[g] + arr[b];
                    return colorArr;
                }

                color = this.rgb(color)
                color = rgbaArr(color)
                //RGB值是51的倍数
                for (var i = 0; i < 3; i++) {
                    var q1 = Math.floor(color[i] / 51) * 51;
                    var q2 = Math.ceil(color[i] / 51) * 51;
                    if (Math.abs(q1 - color[i]) <= Math.abs(q2 - color[i])) color[i] = q1;
                    else color[i] = q2;
                }
                return this.hex(rgbaWrapper(color));
            }
        },
        //静态方法
        {
            //混合  [c1,c2,c3]  或  color1, color2 
            mix: function (colorArr) {
                if (_.isArray(colorArr)) {
                    var len = colorArr.length,
                        arr = new Array(len);
                    for (var i = 0; i < len; i++) {
                        arr[i] = rgbaArr(colorArr[i]);
                    }
                    var _mix = arr[0].map(function (t, i) {
                        if (i === 3) {
                            for (var j = 1; j < len; j++) {
                                t += _.isUndefined(arr[j][i]) ? 1 : arr[j][i];
                            }
                            return (t / len).toFixed(2);
                        } else {
                            for (var j = 1; j < len; j++) {
                                t += arr[j][i];
                            }
                            return t / len << 0
                        }
                    })
                    return rgbaWrapper(_mix);
                } else {
                    var len = arguments.length,
                        arr = [];
                    if (len === 0) return;
                    for (var i = 0; i < len; i++) {
                        arr[i] = rgbaArr(arguments[i]);
                    }
                    return this.mix.call(this, arr)
                }

            },
            //rgb2hex
            hex: function (color) {
                if (!color) return;
                if (isHex6(color)) return color;
                if (isHex3(color)) {
                    return color.replace(/[0-9a-fA-f]/g, function (m) {
                        return m + m;
                    });
                }

                function _hex(rgbaArr) {
                    return "#" + rgbaArr.map(function (t, i) {
                        return i > 2 ? null : ('0' + (+t).toString(16)).slice(-2);
                    }).join("")
                }
                return _hex(rgbaArr(color))
            },
            //hex2rgb
            rgb: function (color, alpha) {
                if (!color) return;
                if (isRgba(color)) return color;
                var arr = rgbaArr(color);
                if (alpha) arr[3] = alpha;
                return rgbaWrapper(arr);
            },
            //互补色
            complementary: function (color) {
                var arr = rgbaArr(color),
                    max = _max(arr),
                    min = _min(arr),
                    sum = max + min;
                return rgbaWrapper(arr.map(function (t) {
                    return sum - t
                }));
            },
            //色相环
            circle: function (len, alpha) {
                var a = 0,
                    step = 360 / len,
                    arr = [],
                    r, g, b;
                for (var i = 0; i < len; i++) {
                    a += step
                    r = _.cos(a) * 127 + 128 << 0;
                    g = _.cos(a + 120) * 127 + 128 << 0;
                    b = _.cos(a + 240) * 127 + 128 << 0;
                    arr[arr.length] = rgbaWrapper(_.isUndefined(alpha) ? [r, g, b] : [r, g, b, alpha]);
                }
                return arr;
            },
            //颜色过渡  gradient
            tween: function (color1, color2, step, easing) {
                step = step || 1;
                easing = easing || "linear";
                var start = rgbaArr(color1),
                    end = rgbaArr(color2),
                    colorArr = [];
                for (var i = 0; i <= step; i++) {
                    var k = _.Easing[easing](i / step);
                    colorArr[colorArr.length] = rgbaWrapper(end.map(function (t, i) {
                        return i > 2 ? +(start[i] + (t - start[i]) * k).toFixed(2) : start[i] + (t - start[i]) * k << 0
                    }))
                }
                return colorArr;
            },
            //深色  随机深色(rgb两位小于 80)，指定颜色加深
            dark: function (level) {
                var n = Math.random() * 3 << 0;
                return rgbaWrapper([255, 255, 255].map(function (t, i) {
                    return i !== n ? Math.random() * 80 << 0 : t * Math.random() << 0;
                }));
            },
            deepdark: function () {
                var n = Math.random() * 3 << 0;
                return rgbaWrapper([255, 255, 255].map(function (t, i) {
                    return i !== n ? Math.random() * 20 << 0 : t * Math.random() << 0;
                }));
            },
            //浅色  
            light: function (level) {
                var n = Math.random() * 3 << 0;
                return rgbaWrapper([255, 255, 255].map(function (t, i) {
                    return i !== n ? 120 + Math.random() * 136 << 0 : t * Math.random() << 0;
                }));
            },
        })
});

//画图
_package("canvas", _, function () {
    var MyCanvas = function (options) {
        if (!(this instanceof MyCanvas)) return new MyCanvas(options);
        var canvas = _.createEle("canvas");
        canvas.width = this.width = options.width || 300;
        canvas.height = this.height = options.height || 400;
        var el = this.el = _.query(options.el)
        el.appendChild(canvas)
        var padding = options.padding || 0,
            paddingLeft = options.paddingLeft || padding,
            paddingRight = options.paddingRight || padding,
            paddingTop = options.paddingTop || padding,
            paddingBottom = options.paddingBottom || padding;
        this.center = [this.width / 2, this.height / 2];
        this.lefttop = [0 + paddingLeft, 0 + paddingTop];
        this.leftbottom = [0 + paddingLeft, this.height - paddingBottom];
        this.rightbottom = [this.width - paddingRight, this.height - paddingBottom];
        this.righttop = [this.width - paddingRight, 0 + paddingTop];

        var ctx = this.ctx = canvas.getContext("2d")
        // ctx.globalCompositeOperation="lighter"
        this.clear();
    }

    return _.createClass(MyCanvas, {
        clear: function () {
            this.ctx.clearRect(0, 0, this.width, this.height);
        },
        clear2: function () {
            var ctx = this.ctx;
            ctx.fillStyle = "rgba(255,255,255,0.01)"
            // ctx.globalAlpha = 0.7;
            ctx.fillRect(0, 0, this.width, this.height);
        },
        //链接
        //arr, shape
        link: function (opt) {
            var _link = function (p1, p2, shape, sAngle, eAngle) {
                var ctx = this.ctx;
                ctx.strokeStyle = "#000";
                ctx.beginPath();
                switch (shape) {
                    case "line":
                        ctx.moveTo.apply(ctx, p1)
                        ctx.lineTo.apply(ctx, p2)
                        break;
                    case "arc":
                        var sAngle = sAngle || 0;
                        var eAngle = eAngle || (sAngle + Math.PI)
                        var r = this.dis(p1, p2) / 2
                        var o = this.mid(p1, p2)
                        ctx.arc.apply(ctx, o.concat([r, sAngle, eAngle]))
                        break;
                    case "circle":
                        var sAngle = 0;
                        var eAngle = 2 * Math.PI
                        var r = this.dis(p1, p2) / 2
                        var o = this.mid(p1, p2)
                        ctx.arc.apply(ctx, o.concat([r, sAngle, eAngle]))
                        break;
                }
                ctx.stroke()
            }

            // if(_.type())
            var len = arguments.length
            if (len === 3) {
                var p1 = arguments[0],
                    p2 = arguments[1];
                var shape = arguments[2];
                _link(p1, p2, shape)

            } else if (len === 2) {
                var arr = arguments[0],
                    len = arr.length,
                    shape = arguments[1];
                for (var i = 0; i < len - 1; i++) {
                    _link.apply(this, arr.slice(i, i + 2).concat([shape]))
                }
            } else if (len === 1) {
                var arr = opt.points,
                    len = arr.length,
                    shape = opt.shape,
                    sAngle = opt.sAngle,
                    eAngle = opt.eAngle

                for (var i = 0; i < len - 1; i++) {
                    _link.apply(this, arr.slice(i, i + 2).concat([shape, sAngle, eAngle]))
                }
            }

        },
        //连线
        line: function (arr, closePath) {
            var ctx = this.ctx;
            ctx.strokeStyle = "#000";
            ctx.beginPath();
            _.forEach(arr, function (t, i) {
                if (i === 0) {
                    ctx.moveTo.apply(ctx, t)
                }
                ctx.lineTo.apply(ctx, t)
            })
            var closePath = closePath == null ? false : closePath
            if (closePath)
                ctx.closePath();
            ctx.stroke()
        },
        //射线
        //一中心p,多中心o [p1,p2]
        ray: function (o, arr) {
            var ctx = this.ctx;
            ctx.strokeStyle = "#000";
            ctx.beginPath();
            if (_.type(o[0]) === "array") { //二维数组  多中心
                var n = o.length;
                _.forEach(arr, function (t, i) {
                    ctx.moveTo.apply(ctx, o[i % n])
                    ctx.lineTo.apply(ctx, t)
                })
            } else {
                _.forEach(arr, function (t, i) {
                    ctx.moveTo.apply(ctx, o)
                    ctx.lineTo.apply(ctx, t)
                })
            }
            ctx.stroke()
        },
        //圆形
        circle: function (o, r) {
            var ctx = this.ctx;
            ctx.strokeStyle = "#000";
            ctx.beginPath();
            ctx.arc.apply(ctx, o.concat([r, 0, 2 * Math.PI]))
            ctx.stroke()
        },
        //弧线
        arc: function (o, arr) {
            var ctx = this.ctx;
            var len = arr.length
            ctx.strokeStyle = "#000";
            ctx.beginPath();
            _.forEach(arr, function (t, i) {
                var t1 = i + 1 < len ? arr[i + 1] : arr[0];
                var r = dis(t, t1, o)
                ctx.arcTo.apply(ctx, t.concat(t1).concat([r]))

            })
            ctx.stroke()
        },
        //正方形，矩形
        rect: function (o, r) {
            var ctx = this.ctx;
            ctx.strokeStyle = "#000";
            ctx.beginPath();
            ctx.rect.apply(ctx, [o[0] - r / 2, o[1] - r / 2].concat([r, r]))
            ctx.stroke()
        },
        //规则多边形
        regularPloygon: function (o, r, n, sAngle) {
            var n = n || 4
            var ps = this.cutpoints(o, r, n, {
                sAngle: sAngle
            })
            this.line(ps, true)
        },
        //打点
        point: function (arr, showLabel) {
            var _this = this;
            var ctx = this.ctx;
            ctx.fillStyle = "#0000ff";

            var _point = function (t) {
                ctx.beginPath();
                ctx.arc(t[0], t[1], 3, 0, 2 * Math.PI);
                // ctx.stroke();
                ctx.fill();
                if (showLabel)
                    _this.text(Math.floor(t[0]) + "," + Math.floor(t[1]), [t[0] - 5, t[1] + 10])
            }
            if (_.type(arr[0]) === "array") { //二维数组
                arr.forEach(function (t) {
                    _point(t)
                })
            } else {
                _point(arr)
            }

        },
        //文字
        text: function (text, p) {
            var ctx = this.ctx;
            ctx.fillStyle = "#000";
            ctx.font = "8px Verdana";
            ctx.fillText(text, p[0], p[1]);
        },
        //顶点 vertices
        //分割点
        // 参数：[x,y],[r1,r2],n
        //半径 r,r1~r2  , [r1,r2,r3]
        //options{o:[xy],r:[r1,r2],n:n,rn:"random"}
        //regular, direction, sAngle
        //分割圆弧
        cutpoints: function (o, r, n, opt) {
            var arr = [],
                a;
            var opt = opt || {};
            var sAngle = opt.sAngle || 0;
            var direction = opt.direction;
            var regular = opt.regular == null ? true : opt.regular;

            var _cut = function (o, r, n, i, regular, direction) {
                if (regular) {
                    if (direction === "top") {
                        a = 1.25 * Math.PI + 0.5 * Math.PI * i / n
                    } else {
                        a = i * 2 * Math.PI / n + (sAngle / 2 * Math.PI) //等角
                    }
                } else { //随机角
                    if (direction === "top") {
                        a = 1.25 * Math.PI + 0.5 * Math.PI * Math.random()
                    } else if (direction === "outter") {
                        a = 1 * Math.PI * Math.random()
                    } else {
                        a = 2 * Math.PI * Math.random()
                    }
                }
                arr[i] = [o[0] + r * Math.cos(a), o[1] + r * Math.sin(a)]
            }

            if (_.type(r) === "array") {
                var len = r.length
                for (var i = 0; i < n; i++) {
                    var rn = r[i % len]
                    _cut(o, rn, n, i, regular, direction)
                }
            } else if (/~/.test(r)) {
                var rs = r.split("~").map(function (t) {
                    return +t
                })
                for (var i = 0; i < n; i++) {
                    var rn = rs[0] + (rs[1] - rs[0]) * Math.random();
                    _cut(o, rn, n, i, regular, direction)
                }
            } else {
                for (var i = 0; i < n; i++) {
                    _cut(o, r, n, i, regular, direction)
                }
            }

            return arr
        },
        //生长
        //startPoint,radius,direction
        grow: function (o, r, d) {
            var arr = [o],
                level = 5;

            var _grow = function (o, r, d, level) {
                if (level-- === 0) {
                    return
                }
                var a = 0
                if (d === "top") {
                    a = 1.25 * Math.PI + 0.5 * Math.PI * Math.random()
                } else {
                    a = 2 * Math.PI * Math.random()
                }
                var endPoint = [o[0] + r * Math.cos(a), o[1] + r * Math.sin(a)]
                arr.push(endPoint)
                _grow(endPoint, r, d, level)
            }
            _grow(o, r, d, level)
            return arr
        },

        //分叉 
        //分形fractal;
        branch: function (o, r, d, level) {
            var level = level || 6;
            var _this = this;
            var _branch = function (o, r, d, level) {
                if (level-- === 0) {
                    return
                }
                r = r * 0.9
                var ps = _this.cutpoints(o, r, 2, {
                    regular: false,
                    direction: d
                })
                _this.ray(o, ps)
                ps.forEach(function (t) {
                    _branch(t, r, d, level)
                })
            }
            _branch(o, r, d, level)
        },
        //距离 distance
        dis: function (p1, p2) {
            return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2))
        },
        //中心点
        mid: function (p1, p2) {
            return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2]
        },
        //均分点meanSplit。分割n次，分割成n+1段
        //分割直线
        split: function (p1, p2, n) {
            var ps = [];
            for (var i = 1; i <= n; i++)
                ps[ps.length] = this.toV(p).scale(i / (n + 1)).toP(this);
            return ps;
        },
        //toVector
        //向量 vector 以this为原点坐标 表示向量 p
        toV: function (p) {
            return p ? _.vector({
                x: p.x - this.x,
                y: p.y - this.y
            }) : _.vector({
                x: this.x - this.o.x,
                y: this.y - this.o.y
            })
        },
        //动画 animate
        ani: function (act, arr, duration, cs) {
            var index = 0,
                len = arr.length,
                _this = this;
            var callback;

            (function _ani() {
                if (index >= len) {
                    return false
                }
                switch (act) {
                    case "point":
                        _this.point.call(_this, arr[index++])
                        break;
                    case "line":
                        _this.line.call(_this, arr.slice(index++, index + 1))
                        break;
                    case "ray":
                        if (cs) {
                            _this.ray.call(_this, cs[index % cs.length], arr.slice(index++, index))
                        } else {
                            _this.ray.call(_this, _this.center, arr.slice(index++, index))
                        }

                        break;
                }
                setTimeout(_ani, duration)
            })();
        },
        //往复运动 匀速uniform speed 正玄
        loop: function (callback, r, act) {
            var index = 0
            var r = r || 100;
            var _loop = function () {
                switch (act) {
                    case "uniform":
                        callback(Math.abs(r - index));
                        break;
                    case "sin":
                        callback(Math.abs(r * Math.sin(0.5 * index * Math.PI / r)));
                        break;
                    case "cos":
                        callback(Math.abs(r * Math.cos(0.5 * index * Math.PI / r)));
                        break;
                    default:
                        callback(Math.abs(r - index));
                }
                if (index++ >= r * 2) index = 0
                requestAnimationFrame(_loop)
            }
            _loop();
        },

    })
});

_package("base64", _, function () {
    function Base64() {}
    return _.createClass(Base64, {

    }, {
        encode: function (stringToEncode) {
            var encodeUTF8string = function (str) {
                return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
                    function toSolidBytes(match, p1) {
                        return String.fromCharCode('0x' + p1)
                    })
            };

            if (typeof window !== 'undefined') {
                if (typeof window.btoa !== 'undefined') window.btoa(encodeUTF8string(stringToEncode))
            } else {
                return new Buffer(stringToEncode).toString('base64')
            }
            var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
                o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
                ac = 0,
                enc = '',
                tmpArr = [];
            if (!stringToEncode) {
                return stringToEncode
            }
            stringToEncode = encodeUTF8string(stringToEncode);
            do {
                o1 = stringToEncode.charCodeAt(i++);
                o2 = stringToEncode.charCodeAt(i++);
                o3 = stringToEncode.charCodeAt(i++);
                bits = o1 << 16 | o2 << 8 | o3;
                h1 = bits >> 18 & 0x3f;
                h2 = bits >> 12 & 0x3f;
                h3 = bits >> 6 & 0x3f;
                h4 = bits & 0x3f;
                tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4)
            } while (i < stringToEncode.length);
            enc = tmpArr.join('');
            var r = stringToEncode.length % 3;
            return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3)
        },
        decode: function (encodedData) {
            var decodeUTF8string = function (str) {
                return decodeURIComponent(str.split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                }).join(''))
            };

            if (typeof window !== 'undefined') {
                if (typeof window.atob !== 'undefined') {
                    return decodeUTF8string(window.atob(encodedData))
                }
            } else {
                return new Buffer(encodedData, 'base64').toString('utf-8')
            }
            var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
                o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
                ac = 0,
                dec = '',
                tmpArr = [];
            if (!encodedData) {
                return encodedData
            }
            encodedData += '';
            do {
                // unpack four hexets into three octets using index points in b64
                h1 = b64.indexOf(encodedData.charAt(i++));
                h2 = b64.indexOf(encodedData.charAt(i++));
                h3 = b64.indexOf(encodedData.charAt(i++));
                h4 = b64.indexOf(encodedData.charAt(i++));
                bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
                o1 = bits >> 16 & 0xff;
                o2 = bits >> 8 & 0xff;
                o3 = bits & 0xff;
                if (h3 === 64) {
                    tmpArr[ac++] = String.fromCharCode(o1)
                } else if (h4 === 64) {
                    tmpArr[ac++] = String.fromCharCode(o1, o2)
                } else {
                    tmpArr[ac++] = String.fromCharCode(o1, o2, o3)
                }
            } while (i < encodedData.length);
            dec = tmpArr.join('')
            return decodeUTF8string(dec.replace(/\0+$/, ''))
        }
    })
});

//邮件编码
_package("quotedprintable", _, function () {
    function QuotedPrintable() {}
    return _.createClass(QuotedPrintable, {}, {
        decode: function (str) {
            //.replace(/=(?:\r\n?|\n|$)/g, '')
            return str.replace(/[\t\x20]$/gm, '').replace(/=(\r?\n|$)/g, '').replace(/=([a-f0-9]{2})/ig, function (m, code) {
                return String.fromCharCode(parseInt(code, 16))
            })
        },
        encode: function (str) {
            // var hexadecimal = codePoint.toString(16).toUpperCase();
            // return '=' + ('0' + hexadecimal).slice(-2);
        }
    })
});

//url 编码  百分号编码
//使用%百分号加上两位的字符[0~9A~F]代表一个字节的 十六进制形式。Url编码默认使用的字符集是US-ASCII
// 安全字符不同：
// escape（69个）：*/@+-._0-9a-zA-Z
// encodeURI（82个）：!#$&'()*+,/:;=?@-._~0-9a-zA-Z
// encodeURIComponent（71个）：!'()*-._~0-9a-zA-Z
_package("url", _, function () {
    function URL() {}
    return _.createClass(URL, {}, {
        decode: function (str) {
            return decodeURIComponent(str);
        },
        encode: function (str) {
            return encodeURIComponent(str);
        }
    })
});

//unicode 统一码 0 - 65535 之间的整数
_package("unicode", _, function () {
    function Unicode() {}
    return _.createClass(Unicode, {}, {
        decode: function (str) {
            return str.split("%").map(function (t) {
                return String.fromCharCode("0x" + t)
            })
        },
        encode: function (str) {
            var hex = ""
            for (var i = 0; i < str.length; i++) {
                // hex += "%" + ("00"+str.charCodeAt(i).toString(16).toUpperCase()).slice(-2)
                hex += '%' + ('00' + str.charCodeAt(i).toString(16).toUpperCase()).slice(-4)
            }
            return hex;
        }
    })
})


_package("storage", _, function () {
    var localStorage = window.localStorage;
    if (!window.localStorage) {
        //使用cookie方式代替
        //cookie 因为每次http请求都会携带, 能精简则精简 总大小不能超过4kb

        var cookie = {
            set: function (cname, cvalue, exdays) {
                exdays = exdays || 365;
                var d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toGMTString();
                document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
            },

            remove: function (cname) {
                this.set(cname, "", -1)
            },

            clear: function () {
                var arr = document.cookie.split(';')
                for (var i = 0; i < arr.length; i++) {
                    this.set(array[i], "", -1)
                }
            },
            get: function (cname) {
                var name = cname + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = _.trim(ca[i]);
                    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
                }
                return "";
            }

        }




        //IE中使用 userData 代替localStorage
        //IE8开始支持localStorage ,但必须在服务器环境才有效
        //扩展window对象，模拟原生localStorage输入输出
        var userData = {
            userData: null,
            //存储文件名（单文件小于128k，足够普通情况下使用了）
            file: window.location.hostname || "localStorage",
            //key'cache
            keyCache: "localStorageKeyCache",
            init: function () {
                if (!this.userData) {
                    try {
                        var hideInput = _.input("", {
                            name: "localStorage",
                            type: "hide"
                        })
                        hideInput.addBehavior("#default#userData");
                        this.userData = hideInput;
                        _.append(document.body, hideInput)
                    } catch (e) {
                        console.log(e)
                        return false
                    }
                }
                return true;
            },
            item: function (key, value) {
                if (this.init()) {
                    var o = this.userData;
                    if (value !== undefined) { //写或者删
                        //保存key以便遍历和清除
                        // this.cacheKey(key, value === null ? 2 : 1);
                        //load
                        o.load(this.file);
                        //保存数据
                        value === null ? o.removeAttribute(key) : o.setAttribute(key, value + "");
                        // 存储
                        o.save(this.file);
                    } else { //读
                        o.load(this.file);
                        return o.getAttribute(key) || null;
                    }
                    return value;
                }
            }
        }
        localStorage = {
            setItem: function (key, value) {
                cookie.set(key, value)
                // userData.item(key, value);

                // this.length = userData.cacheKey(0, 4)
            },
            getItem: function (key) {
                return cookie.get(key)
                // return userData.item(key)
            },
            removeItem: function (key) {
                cookie.remove(key)
                // userData.item(key, null);
                // this.length = userData.cacheKey(0, 4)
            },
            clear: function () {
                cookie.clear();
                // userData.clear();
                // this.length = userData.cacheKey(0, 4)
            },
            length: 0,
            key: function (i) {
                // return userData.cacheKey(0, 3)[i];
            },
            isVirtualObject: true
        };
    }

    console.log(localStorage)


    // define(function(){
    //     if('localStorage' in window) return;
    //     function Storage(){
    //         this.box = document.body || document.getElementByTagName('head')[0] || document.documentElement;
    //         this.name = 'localStorage'
    //         this.data = document.createElement(this.name);
    //         this.data.addBehavior("#default#userData");
    //         this.box.appendChild(this.data);
    //         this.map = [];
    //         this.length = this.length();
    //     }
    //     Storage.prototype.setItem = function(name,val){
    //         if(name=='localStorage-map'){
    //             throw new Error("this is localStorage in key [localStorage-map] not use!")
    //             return ;
    //         }
    //         if(this.map.length==0){
    //             this.data.load('localStorage-map');
    //             var data = this.data.getAttribute('localStorage-map');
    //             if(data!=null){
    //                 this.map = data.split(',');
    //             }
    //         }
    //         var flag = true;
    //         for(var i in this.map){
    //             if(this.map[i] == name){
    //                 flag = false;
    //             }
    //         }
    //         if(flag){
    //             this.map.push(name)
    //         }
    //         this.data.setAttribute(name,val);
    //         var date = new Date();
    //         date.setDate(date.getDate()+700);
    //         this.data.expires = date.toUTCString();
    //         this.data.save(name);
    //         this.data.setAttribute('localStorage-map',this.map);
    //         this.data.save('localStorage-map');
    //     }
    //     Storage.prototype.getItem = function(name){
    //         if(name == 'localStorage-map'){
    //             throw new Error("this is localStorage in key [localStorage-map] not use!");
    //             return;
    //         }
    //         this.data.load(name);
    //         return this.data.getAttribute(name);
    //     };
    //     Storage.prototype.length = function(){
    //         if(this.map.length==0){
    //             this.data.load('localStorage-map');
    //             var data = this.data.getAttribute('localStorage-map');
    //             if(data!=null){
    //                 this.map = data.split(',');
    //             }
    //         }
    //         for (var i = this.map.length - 1; i >= 0; i--) {
    //             alert(this.getItem(this.map[i]))
    //             if(this.getItem(this.map[i])==undefined || this.getItem(this.map[i])==""){
    //                 this.map.splice(i,1);
    //             }
    //         }
    //         return this.map.length;
    //     };
    //     Storage.prototype.removeItem = function(name){
    //         if(typeof name=="undefined" || name=="") return;
    //         if(this.map.length==0){
    //             if(this.getItem('localStorage-map')!=null){
    //                 this.map = this.getItem('localStorage-map').split(',');
    //             }
    //         }
    //         for(var i in this.map){
    //             if(this.map[i] == name){
    //                 this.map.splice(i,1);
    //             }
    //         }
    //         this.data.load(name);
    //         this.data.setAttribute(name,undefined);
    //         this.data.save(name);
    //         return true;
    //     },
    //     Storage.prototype.clear=function(){
    //         if(this.map.length==0){
    //             if(this.getItem('localStorage-map')!=null){
    //                 this.map = this.getItem('localStorage-map').split(',');
    //             }
    //         }
    //         for(var i in this.map){
    //             this.removeItem(this.map[i]);
    //         }
    //     }
    //     window.localStorage = new Storage();
    // });


    function Storage(options) {
        if (!(this instanceof Storage)) return new Storage(options);
    }
    return _.createClass(Storage, {}, {
        get: function (key) {
            var val = localStorage.getItem(key)
            return val ? JSON.parse(val) : ""
        },
        set: function (key, val) {
            if (["boject", "array"].indexOf(_.type(val)) >= 0) {
                localStorage.setItem(key, JSON.stringify(val))
            } else {
                localStorage.setItem(key, val)
            }
        },
        remove: function (key) {
            localStorage.removeItem(key);
        },
        clear: function () {
            localStorage.clear();
        }
    })
})