#! /usr/bin/env node

var name = 'anguandia mike is my name';

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
};

// String.prototype.norm = function(){
//     var res = '';
//     this.trim().split(' ').forEach(function(v, i){
//         res += v.capitalize();
//     });
//     return res;
// };

// console.log(name.norm());
// console.log(name.split(' '));

var url_string = "http://www.example.com/t.html?a=1&b=3&c=m2-m3-m4-m5"; //window.location.href
// var url = new URL(url_string);
// var c = url.searchParams.get("c");
// console.log(c);
var a = {'name': 'mike', 'age': false};
age = function(){
    if(a.age){
        return true;
    } else {
        return 'age unknown';
    }
};

// console.log(age())
var val = 'mike'.split('')
var t = function(v){
    for(var i of v){
        i = i.toUpperCase();
        return v;
    }
};
var alert = require('js-alert');
// console.log(t(val));
// var m = require('express-validator/check');
var d = {'a':10, 'b':20, 'x':100};
var e = {'a':1, 'b':4, 'c':10};

Object.assign(d, e);
var c = Object.values(d).map(v=>5*v);
function mod(dic, func){
    for(var k of Object.keys(dic)){
        dic[k]*=5;
    }
    return dic;
}
// console.log(mod(d));
var m='mr anguandia';
// Object.assign(d, {});
// console.log(d);
a = {name: 'mike', christ: 'kuku', sur: 'ang'};
delete Object.assign(a, {first: a.name}).name;
b='1';
var ev = function(ls){
    var even = [];
    var odd = [];
    ls.sort().forEach(e => {
      (e%2==0)?even.push(e):odd.push(e);
    });
    return odd.concat(even);
  };

  var evens = [1, 2, 3, 4].reduce((memo, i) => {
    if (i % 2 === 0) {
      memo.push(i)
    }

    return memo;
  }, []);
  a = [1,2,3];
  a[2] = 4;
  var o = new Array();
  // console.log('mike#'.escape('#'));
  function g(i){
    return i==4;
  }

  function controls(check){
    var res = 0;
    for(let i=0; i<check.length; i++){
        if(check[i]>5){
            res+=1;
        }
      }
      console.log(res);
}
var a = `../bookinstance/0/delete`;
var b=a.replace(a.split('/')[2], 27);
var a = 'anguandiamike'.split('');
var b = [a.slice((0,4), (4,8), (8))];

var o = { status: '',
_id: '5c9a3db4c9f7c51f40b43158',
book: [Object],
imprint: '',
due_back: null,
__v: 0 };
Object.keys(o).forEach(key => (o[key]=='') && delete o[key]);
var t = new Date();
var e = new Date(t);
var f = e.setDate(t.getDate() + 60/1440);
var user={name:'mike', age:38, sex:'male'};
var t = {a:88};
// delete user.age;
console.log(Object.assign(user, t));
