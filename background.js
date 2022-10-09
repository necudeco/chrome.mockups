
    const _w = 1200;
    const _h = 700+150;

    chrome.contextMenus.create(
        {
            id: "laptop",
            title: "Laptop",
            contexts: ['page']
        }
    );

    chrome.contextMenus.create(
        {
            id: "android",
            title: "Android",
            contexts: ['page']
        }
    );

    chrome.contextMenus.onClicked.addListener(async function(info, tab){
        console.log("MENU", info.menuItemId);
        if ( info.menuItemId == 'laptop' ){
            await screenshotForLaptop(tab);
        }

        if ( info.menuItemId == 'android' ){
            await screenshotForAndroid(tab);
        }
        
    });

    chrome.runtime.onMessage.addListener( function(msg, sender, sendResponse ) {
        console.log("onMessage", msg);
        if ( msg == 'laptop' ){
            screenshotForLaptop(sender);
            sendResponse("OK");
        }

        if ( msg == 'android' ){
            screenshotForAndroid(sender);
            sendResponse("OK");
        }
    });


    

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  
async function getAllTabs(wid) {
    let queryOptions = {  windowId: wid };
    let tabs = await chrome.tabs.query(queryOptions);
    return tabs;
  }

  async function sleep(ms){
    const promise = new Promise(function(resolve, reject){
        setTimeout(resolve, ms );
    });

    return promise;
  }



  async function download(url, ext='jpg'){
    const filename = new Date().getTime() + "-"+_w+"_"+_h;
    console.log("DOWNLOAD", filename);
    const opts = {
        url: url,
        filename: `screenshots/${filename}.${ext}`,
        conflictAction: 'overwrite'
    }
    await chrome.downloads.download(opts);
  }

  const urlLaptop = "https://tareas.nodefire.net/mockup/laptop";
  const urlIphone = "https://tareas.nodefire.net/mockup/iphone";

  async function screenshotForLaptop(sender){
    await generateScreenshot(1200, 700+150, urlLaptop);
  }

  async function screenshotForAndroid(sender){
    await generateScreenshot(500, 1150+150, urlIphone);
  }

  function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
}


  async function upload(img, url){

    console.log("UPLOAD");
    
    
    
    img = dataURItoBlob(img);
    
    const formData  = new FormData();
    formData.append('imagen', img);
    const opts = { 
        mode:'no-cors', 
        //headers: {  'Content-Type': 'multipart/form-data;charset=UTF-8' }, 
        method: 'POST', 
        body: formData 
    };

    
    const response = await fetch(url, opts);
  
    let jresponse =  await response.json();
    console.log(jresponse);

    if ( jresponse.code == "OK" ){
        for ( let f of jresponse.files ){
            console.log(f);
            await download(f);
        }
    }
    
    
  }


  async function generateScreenshot(_w, _h, url){


    let win =  await chrome.windows.getCurrent();
    let newwin = null; 

    let tabs = await getAllTabs(win.id);
    let tab = await getCurrentTab();

    let winID = win.id;
    
    if ( tabs.length > 1 ){
        const opt = { focused: true, tabId: tab.id, height: _h, width: _w };
        console.log("CREATE WINDOW", opt);
        newwin = await chrome.windows.create(opt);
        winID = newwin.id;
    
        await chrome.windows.update(winID, {height: opt.height});
    }else{
        //newwin = win;
    }


    sleep(500);
   
    const screenshotUrl = await chrome.tabs.captureVisibleTab( winID );

    

    if ( newwin != null ){
        await chrome.tabs.move(tab.id, { index: -1, windowId: win.id  });
        await chrome.tabs.update(tab.id, { active: true });
    }

    try{

        await upload(screenshotUrl, url);

  
    }catch(e){
           console.log("ERROR", e);
    }



  }
