function check(n){
    var oma = [];
    var l1 = n.length-1;
    var l2 = function(){
        var len=false;
        for(i of n){
            len = i.length;
        }
        return len;
    };
    console.log(l2());
    for(var j=0; j<l2(); j++){
        for(var i=0; i<l1; i++){
            var current = n[i][j];
            var next = n[i+1][j];
            if(current>=next){
                oma.push([i,j]);
            }
        }
    }
    var rejected = function(){
        var k = [];
        for(var r of oma){
            k.push(n[r[0]][r[1]]);
        }
        return k;
    };
    return rejected();
}

console.log(check([[1, 2, 3, 2, 1, 1],
    [2, 4, 4, 3, 2, 2],
    [6, 5, 5, 5, 4, 4],
    [6, 6, 7, 6, 3, 5]]));
