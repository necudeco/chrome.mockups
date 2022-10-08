
function main(){
    console.log("POPUP MAIN");
    
    document.getElementById("laptop").onclick = async function(){
        console.log("FOR LAPTOP");
        let response = chrome.runtime.sendMessage('laptop');
    };
    
    document.getElementById("android").onclick = async function(){
        console.log("FOR ANDROID");
        let response = chrome.runtime.sendMessage('android');
    };
}

document.onload = main;
