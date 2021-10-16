function dropnav(){
    var x = document.getElementById("dropmenu");
    if(x.className==="topnav"){
        x.className+=" reposition";
    }else{
        x.className="topnav";
    }
}