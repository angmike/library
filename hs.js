// 'use strict';

function change(money, coins){
    var current =  coins[0];
    var ways = 0;
    var ways_current = Math.floor(money/current);
    var balance;
    if(coins.length===1){
        balance = money - current*ways_current;
        if(balance===0){
            ways++;
        }
    } else {
        for(var i=0; i<ways_current + 1; i++){
            balance = money - i*current;
            if(balance===0){
                ways++;
            } else {
                ways+=change(balance, coins.slice(1,));
            }
        }
    }
    return ways;
}

function power(a, b){
  var ex = 1;
  var res;
  for(var i=0; i<Math.abs(b); i++){
    ex = ex*a;
  }
  if(b<0){
    res = 1/ex;
  } else {
    res = ex;
  }
  return res;
}

function ord(n){
    var res;
    var l = n.length-1;
    if(n.length>1 && n[l-1]==='1'){
        res = n + 'th';
    } else {
        res= n[l]==='1'?n+'st':n[l]==2?n+'nd':n[l]==='3'?n+'rd':n+'th';
    }
    return res;
}
// res = n +'th';
var a=[3, 'mike', 4];
var b = a.filter(function(x){return Number.isInteger(x);});
// console.log(a);
function mySort(nums) {
    var evens = [];
    var odds = [];
    var num = nums.filter((x)=>Number.isInteger(x/1));
    for(let i of num){
      var j = Math.floor(i)
      j%2?odds.push(j):evens.push(j)
    }
    evens.sort();
    console.log(evens);
    odds.sort();
    return odds.concat(evens);
  }

// var a=mySort( [90, 45, 66, 'bye', 100.5])
// var a=[90, 45, 66, 'bye', 100.5];
var a = 'mike';
console.log(+a);/**
* Using ES6-style classes
* See below for an alternative ES5-prototype solution setup
*/

class User {
 constructor(name) {
   this._name = name;
   this.lastLoggedInAt = null;
   this.log=false;
 }
 isLoggedIn() {
   return this.log;
 }
 getLastLoggedInAt() {
   return this.lastLoggedInAt;
 }
 logIn() {
   this.lastLoggedInAt = new Date();
   this.log = true;
   return `user ${this._name} logged in`;
 }
 logOut() {
   this.log = false;
   return `user ${this._name} logged out`;
 }
 getName() {
   return this._name;
 }
 setName(name) {
   this._name = name;
 }
 canEdit(comment) {
   if(comment.author === this._name){
     return true;
   }
 }
 canDelete(comment) {
   return false;
 }
}

class Moderator extends User{
 constructor(name){
   super(name);
 }
 canDelete(comment){
   super.canDelete(comment);
   return true;
 }
}

class Admin extends Moderator{
 constructor(name){
   super(name);
 }
 canEdit(comment){
   super.canEdit(comment);
   return true;
 }
}

class Comment {
 constructor(author, message, repliedTo=null) {
   this.author = author;
   this._message = message;
   this.repliedTo = repliedTo;
   this.createdAt = new Date();
 }

 getMessage() {
   return this._message;
 }
 setMessage(message) {
   this._message = message;
 }
 getCreatedAt() {
   return this.createdAt;
 }
 getAuthor() {
   return this.author;
 }
 getRepliedTo() {
   return this.repliedTo;
 }
 toString() {
   if(this.repliedTo){
     return `${this._message} by ${this.author._name} (replied to ${this.repliedTo.author._name})`
   } else {
     return `${this._message} by ${this.author._name}`
   }
 }
}

/**************************
* Alternative using ES5 prototypes
* Or feel free to choose your own solution format
**************************

function User(name) {}
User.prototype = {
 isLoggedIn: function() {}
 getLastLoggedInAt: function() {}
 logIn: function() {}
 logOut: function() {}
 getName: function() {}
 setName: function(name) {}
 canEdit: function(comment) {}
 canDelete: function(comment) {}
}

var Admin = ???

var Moderator = ???

function Comment(author, message, repliedTo) {}
Comment.prototype = {
 getMessage: function() {}
 setMessage: function(message) {}
 getCreatedAt: function() {}
 getAuthor: function() {}
 getRepliedTo: function() {}
 toString: function() {}
}
***********/
// user1 = new User('mike');
// user2 = new User('kuku');
// com = new Comment(user1, 'hi guys');
// com1 = new Comment(user2, 'hi mike...', com);
// console.log('chk last: ', user1.getLastLoggedInAt());
// console.log('chk login: ', user1.isLoggedIn());
// console.log('login sprocess: ', user1.logIn());
// console.log('chk login: ', user1.isLoggedIn());
// console.log('chk logout: ', user1.logOut());
// console.log('chk login: ', user1.isLoggedIn());
// console.log('chk last: ', user1.getLastLoggedInAt());
// console.log('msa: ', com.toString());
// console.log('msa: ', com1.toString());
// console.log('1234'.split('').forEach(i=>+i));
console.log(100.6%1);

var m = [ 45, Math.floor('100.9'), 66, 90 ];
m.sort(function(a,b){return a-b});
a='mike';
console.log(a.constructor==Array);
