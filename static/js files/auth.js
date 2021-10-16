
function snd(){
    const Http = new XMLHttpRequest();
       Http.open('post', url);
       Http.setRequestHeader("Content-Type", "text/plain");
       var obj = {
                   objusrnm : email,
                   objname : name,
                   objemailid : emailid, 
                   objpn: pn,
                   objcls : cls    
                  }
       var objstr = JSON.stringify(obj);
       console.log(objstr);
       Http.send(objstr);
       Http.onload = function() {
        alert(Http.response); 
       };

}
