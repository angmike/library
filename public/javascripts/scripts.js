function next(elem) {
    do {
        elem = elem.nextSibling;
    } while (elem && elem.nodeType !== 1);
    return elem;
}
//convert select input into textinput
function textInput(change, id){
    var elt = document.getElementById(id);
    if(change.target.value === 'other'){
        var item = elt.getAttribute('name');
        elt.outerHTML = `<input type=text name=${item} placeholder="please enter new ${item}"></input>`;
    }
}

// function selected(selected){
//     var elts = document.querySelector('option');
//     for(var elt of elts){
//         if(elt.innerHTML == selected){
//             elt.setAttribute('selected');
//         }
//     }
// }

// }

// function d(){
    //     var q = document.getElementById('dyn');
    //     var del = document.getElementById('del');
    //     q.style.display = 'none';
    //     del.style.display = 'block';
    // }
    var d = document.getElementById('dt');

    function calendar(){
        d.setAttribute('type', 'date');
    }

    //array of checkboxes in list/table displays
    var checkbox = document.getElementsByClassName('checkbox');
    //checkbox for selecting/deselecting all list/table entries
    var all = document.getElementById('all');
    //array of control buttons atop list/table displays
    var actions = document.getElementsByClassName('action');
    //array of links embeded in action buttons to related forms: inactive if no entry selected
    var inactive_links = document.getElementsByClassName('inactive');
    //array of modified bookinstances
    var mod = document.getElementsByClassName('hidden');
    //get ids of modified instances
    var dd = document.getElementById('hidden');
    //get hidden phone field
    var phone = document.getElementById('phone');
    //get country code
    var code = document.getElementById('code');
    //
    var tel = document.getElementById('tel');
    var form = docement.querySelector('form');

//activate and deactivate embeded control links
function activateLinks(){
    for(let i of inactive_links){
        // var old = i.getAttribute('href');
        // var id = old.split('/')[2]
        // var added = old.replace(id, `${id}&id=35`);
        // i.setAttribute('href', added);
        i.setAttribute('class', 'active');
        console.log(i);
    }
}
//array of now active form links in action buttons
var active_links = document.getElementsByClassName('active');

function deactivateLinks(){
    for(let i of active_links){
        i.setAttribute('class', 'inactive');
    }
}
//activate and eactivate action menu buttons in list/table display pages
function activateActions(){
    for(let i of actions){
        i.removeAttribute('disabled');
        i.style.background = 'lightBlue';
    }
}

function deactivateActions(){
    for(let i of actions){
        i.setAttribute('disabled', true);
        i.style.background = '';
    }
}

//get ids of selected entries
function getIds(){
    var ids = '';
    for(var i of checkbox){
        if(i.checked==true){
            const parent = i.parentElement;
            var id = parent.nextElementSibling.firstElementChild.value;
            ids += `-${id}`;
        }
    }
    return ids;
}

//append array of entry ids to id param of link url of action buttons
function addIds(){
    for(var i of active_links){
        let link = i.getAttribute('href');
        let id = link.split('/')[2];
        let ids = getIds();
        var new_link = link.replace('?', ids.slice(1,));
        i.setAttribute('href', new_link);
    }
}

//select and deselect single row
for(var a=0; a<checkbox.length; a++){
    const ancestor = checkbox[a].parentElement.parentElement;
    const parent = checkbox[a].parentElement;
    checkbox[a].addEventListener('change', (event) => {
        if (event.target.checked) {
            ancestor.style.background = 'skyblue';
            activateActions();
            activateLinks();
        } else {
            ancestor.style.background = '';
            deactivateActions();
            deactivateLinks();
        }
    });
}

//check if atleast one entry is selected(checkbox checked)
function check(arr){
    var res=false;
    for(var i=0; i<arr.length; i++){
        if(arr[i].checked==true){
            res = true;
        }
    }
    return res;
}

//select/deselect all entries in a list/table page
function checkAll(){
    if(check(checkbox)){
        for(let j of checkbox){
            j.checked=false;
            j.parentElement.parentElement.style.background = '';
            deactivateActions();
            deactivateLinks();
        }
    } else {
        for(let k of checkbox){
            k.checked=true;
            k.parentElement.parentElement.style.background = 'skyblue';
            activateActions();
            activateLinks();
        }
    }
}

// highlight modified instances
function highlight(){
    var idArr = dd.value.split(',');
    for(var i of mod){
        var parent =  i.parentElement.parentElement;
        for(var j of idArr){
            if(i.value==j){
                parent.style.background='lightgrey';
            }
        }
    }
}

function shout(){
    alert('woww');
}

//add onclick event to multi select box
all.onclick = checkAll;

for(let i of actions){
    i.addEventListener('click', addIds);
}

//show moified list entries higlighted
document.onload = highlight();

/*check password and repeat password fields are identical in value*/

function checkRepeat(){
    var password = document.getElementById('password');
    var repeat = document.getElementById('repeat');
    console.log(password.value);
    if(repeat.value[repeat.value.length-1]!=password.value[repeat.value.length-1]){
        document.getElementById('repeat error').style.display = 'initial';
    } else{
        document.getElementById('repeat error').style.display = 'none';
    }
}

var eyes = document.getElements('#with-eye .eye');
//display password view eye
var withEye = document.getElementsByTagName('form')//.getElementsByClassName('with-eye');

function disp(elt){
    console.log(eyes);
    var sh = elt.children[1];
    sh.style.display = 'block';
}


//view passwords
for(var i of withEye){
    i.addEventListener('focus', 'disp');
}

function see(elt){
        var field = elt.previousElementSibling;
        (field.getAttribute('type')=='password')?field.setAttribute('type', 'text'): field.setAttribute('type', 'password');
    }

//assemble phone number
function getTel(){
    var val = code.value + tel.value;
    phone.value=val;
}

form.onsubmit = getTel;
