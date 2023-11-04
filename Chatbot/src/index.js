const { app, BrowserWindow, ipcMain, session } = require('electron');
const { dialog } = require('electron');
const { ipcRenderer } = require('electron');
const path = require('path');
const FuzzySet = require('fuzzyset.js');
const fs = require('fs');


app.userAgentFallback = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36';
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWin = new BrowserWindow({
    width: 900,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      worldSafeExecuteJavaScript: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
    },
  });
  mainWin.loadFile(path.join(__dirname, 'index.html'));
  // Open the DevTools.
  mainWin.webContents.openDevTools(); 
  
  ipcMain.on('insertText', (event, text) => {
    igWindow.webContents.insertText(text);
  });
  

  // read the file of the unaswered questions
   ipcMain.on('readFile', async (event, params) => {
    //const filePath = './unanswered.txt';
    const userDataPath = app.getPath('userData');
    const filePath = path.join(userDataPath, 'unanswered.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
    
      // File content is available in the 'data' variable
      
      mainWin.webContents.send('asynchronous-message', {'SAVED': `${data}`});
    });
     

   })

   ipcMain.on('clearFile', async (event, params) => {
    const userDataPath = app.getPath('userData');
    const filePath = path.join(userDataPath, 'unanswered.txt');
  
    fs.writeFile(filePath, '', function (err) {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
      console.log('File cleared!');
    });
  });
  
  
   ipcMain.on('launchBrowser', async (event, params) => {
     try {
       console.log(params);
     //create instagram window
        igWindow = new BrowserWindow({
          width: 1300,
          height: 1300,
          titleBarStyle: 'hidden',
          webPreferences: {
            preload: path.join(__dirname, './preload.js'), //include instaPreload.js
            contextIsolation: true,
            enableRemoteModule: true,
            worldSafeExecuteJavaScript: true,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
          },
        }); 

        igWindow.on('close', async()=>{
          function clearCookies() {
            const session = igWindow.webContents.session
            const options = {
              storages: ['cookies', 'caches'], // Clear cookies and caches
              quotas: ['temporary', 'persistent', 'syncable'] // Clear all types of cookies
            };
            session.clearStorageData(options, (error) => {
              if (error) {
                console.error('Error clearing cookies:', error);
              } else {
                console.log('Cookies cleared successfully');
              }
            });
          }
          // Call the function to clear cookies
          clearCookies();
  
          igWindow.destroy();
          console.log("IG window destroyed")
        })

        const igSession = igWindow.webContents.session;

        igSession.webRequest.onBeforeSendHeaders((details, callback) => {
          details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36';
          callback({ cancel: false, requestHeaders: details.requestHeaders });
         });
         igSession.webRequest.onBeforeSendHeaders((details, callback) => {
           const modifiedHeaders = Object.assign({}, details.requestHeaders);
           modifiedHeaders['sec-ch-ua'] = '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"';
           callback({ cancel: false, requestHeaders: modifiedHeaders });
         });
         igWindow.webContents.clearHistory();
         igWindow.webContents.executeJavaScript(`localStorage.clear();`)
         
         igWindow.webContents.openDevTools();
         function clearCookies() {
           const session = igWindow.webContents.session
           const options = {
             storages: ['cookies', 'caches'], // Clear cookies and caches
             quotas: ['temporary', 'persistent', 'syncable'] // Clear all types of cookies
           };
           session.clearStorageData(options, (error) => {
             if (error) {
               console.error('Error clearing cookies:', error);
             } else {
               console.log('Cookies cleared successfully');
             }
           });
         }
         // Call the function to clear cookies
         clearCookies();

      
        
         const url = 'https://www.instagram.com/accounts/login/'
         igWindow.loadURL(url);
         let signedIn = false;

         igWindow.webContents.on('did-navigate', async () => {
           try{
           if (!signedIn && igWindow.webContents.getURL() !== 'https://www.instagram.com/accounts/login/two_factor?next=%2F') {
             signedIn = true;
             await new Promise(r => setTimeout(r, 5000));
             igWindow.webContents.executeJavaScript(`
             try{
               const runBot = async () => {
                 console.log("intro before login");
                 let username = '${params.username}'
                 let pass = '${params.pass}'
                 console.log(username)
                 const inputBox = document.querySelector('[name="username"]');
                 inputBox.focus();
                 await new Promise(r => setTimeout(r, 3000));
                 // renderer.js
                 electronAPI.insertText(username);
                 
                 await new Promise(r => setTimeout(r, 3000));
                 const inputBox2 = document.querySelector('[name="password"]');
                 inputBox2.focus();
                 await new Promise(r => setTimeout(r, 1000));
                 electronAPI.insertText(pass);
                 await new Promise(r => setTimeout(r, 1000));
                 const signIn = document.querySelector('._acan._acap._acas._aj1-');
                 signIn.click();
               }
               runBot();
             }catch(err){
               console.log(err)
             }`); 
             
             //after successful login if directed to save-sign in page, then redirect directly to variant following page
           }
          }catch(err){
            console.log(err)
          }
         });

         const regex = /\d.*\d/; // reg test to see if link has more than one number in it, if has more than one number its inside a direct message with user
        

         igWindow.webContents.on('did-navigate-in-page', async () => {
          if(igWindow.webContents.getURL() == 'https://www.instagram.com/accounts/onetap/?next=%2F' || igWindow.webContents.getURL() == 'https://www.instagram.com' || igWindow.webContents.getURL() == 'https://www.instagram.com/') {
            console.log("redirect!!")
            await new Promise(r => setTimeout(r, 5000));
            igWindow.webContents.executeJavaScript(`
            try{
              console.log("REDIRECT!!!")
              const reDirect = async() =>{
                window.location.href = 'https://www.instagram.com/direct/inbox/'
              }
              reDirect();
            }catch(err){
              console.log(err)
            }
            `);
          } else if(igWindow.webContents.getURL() == 'https://www.instagram.com/direct/inbox/'){
            await new Promise(r => setTimeout(r, 5000));
        igWindow.webContents.executeJavaScript(`
            try{
              const requestReg = /request/i;
        const findUnreadMsg = async () =>{
          //check to see if any unread messages
          await new Promise(r => setTimeout(r, 30000));
        if(document.querySelectorAll('[data-visualcompletion="ignore"]')[2]){
          document.querySelectorAll('[data-visualcompletion="ignore"]')[2].click()
          // check to see if any messages in hidden section
        } else if(document.querySelector('[href="/direct/requests/"]')){
          await new Promise(r => setTimeout(r, 5000));
          document.querySelector('[href="/direct/requests/"]').click();
        }else if(document.querySelectorAll(".x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft")[3]){
          await new Promise(r => setTimeout(r, 5000));
          document.querySelectorAll(".x1lliihq.x193iq5w.x6ikm8r.x10wlt62.xlyipyv.xuxw1ft")[3].click();
          //if no unread messages then reload page after 30 seconds
        } else {
          await new Promise(r => setTimeout(r, 30000));
          window.location.reload();
        }
        } 
        findUnreadMsg();
            }catch(err){
              console.log(err);
                window.location.reload();
              
           
            }
         `);

          } else if (regex.test(igWindow.webContents.getURL())) {
            await new Promise(r => setTimeout(r, 5000));


            igWindow.webContents.executeJavaScript(`
            try{
              const run = async () =>{
              const ifPrivate = async () =>{
                if(document.querySelectorAll(".x1wzhzgj")[0] !== undefined){
                  document.querySelectorAll(".x78zum5.x1iyjqo2.xl56j7k.x123j3cw.x1mpkggp.xs9asl8.x1t2a60a")[2].firstChild.click();
                  await new Promise(r => setTimeout(r, 3000));
                  document.querySelector("button").click();
                }
              }
              
              ifPrivate();
              await new Promise(r => setTimeout(r, 6000));
              const allMessages = document.querySelectorAll('.x1cy8zhl.x78zum5.xdt5ytf.x193iq5w.x1n2onr6');
              const latestMessage = document.querySelectorAll('.x1cy8zhl.x78zum5.xdt5ytf.x193iq5w.x1n2onr6')[allMessages.length - 1].innerText;
              electronAPI.sendMessageToMain(latestMessage);
            };
            run();
            }catch(err){
              console.log(err);
            }
            
            `)
            ipcMain.removeAllListeners('messageFromRenderer');
            ipcMain.on('messageFromRenderer', async (event, message) => {
              console.log('Received message from renderer:', message);
              const userRegex = new RegExp(`${message}`, 'ig');
              let map = params.map;

           
            const keys = Array.from(map.keys());

            // let matchFound = false;
            //   for (let i = 0; i < keys.length; i++) {
            //     const key = keys[i];
            //     if (regex.test(key)) {
            //       console.log(`Matched key: ${key}, Value: ${map.get(key)}`);
            //       chatResponse = map.get(key);
            //       matchFound = true;
            //       break; // Exit the loop when a match is found
            //     }
            //   }

            const fuzzy = FuzzySet(keys);
            console.log(fuzzy);
            const matches = fuzzy.get(message);
            const similarityThreshold = 0.4;

if (matches && matches[0] && matches[0][0] >= similarityThreshold) {
  const bestMatch = matches[0][1];
  let response = map.get(bestMatch);
  console.log(`User message "${message}" matched with "${bestMatch}" response is => ${response}`);
 console.log(map.get(bestMatch));



 await new Promise(r => setTimeout(r, 6000));
   igWindow.webContents.executeJavaScript(`
     try{
     

   const insertResponse = async ()=>{
     electronAPI.insertText("${response}");
     await new Promise(r => setTimeout(r, 5000));
     document.querySelector('[aria-describedby="Message"]').parentElement.parentElement.nextSibling.click();
     await new Promise(r => setTimeout(r, 5000));
     window.location = "https://www.instagram.com/direct/inbox/";
   }
   insertResponse();
   }catch(err){
     console.log(err);
   }
    `);





} else {
  console.log('No match found using Fuzzy');
  await new Promise(r => setTimeout(r, 5000));

   let matchFound = false;
              for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (userRegex.test(key)) {
                  console.log(`Matched key: ${key}, Value: ${map.get(key)}`);
                  chatResponse = map.get(key);
                  matchFound = true;
                  break; // Exit the loop when a match is found
                }
              }

              if(matchFound){
                console.log("match found using reg and response is " + chatResponse);
                await new Promise(r => setTimeout(r, 2000));
                igWindow.webContents.executeJavaScript(`
                try{
                  const dropComment = async () =>{
                  electronAPI.insertText("${chatResponse}");
                  await new Promise(r => setTimeout(r, 5000));
                  document.querySelector('[aria-describedby="Message"]').parentElement.parentElement.nextSibling.click();
                  await new Promise(r => setTimeout(r, 7000));
                  window.location = "https://www.instagram.com/direct/inbox/";
                  }
                  dropComment();
                }catch(err){
                  console.log(err);
                }
                
                `);


              } else {

        console.log("No match using Reg!");

                      const currentTime = new Date();
              let hours = currentTime.getHours();
              const minutes = currentTime.getMinutes();
              const seconds = currentTime.getSeconds();
              let meridiem = 'AM';

              // Convert to 12-hour format and determine AM/PM
              if (hours >= 12) {
                meridiem = 'PM';
                if (hours > 12) {
                  hours -= 12;
                }
              }


        fs.appendFile('unanswered.txt', `Message: "${message}" at ${hours}:${minutes}:${seconds} ${meridiem}\n `, function (err) {
          if (err) throw err;
          console.log('Updated!');
        });


        await new Promise(r => setTimeout(r, 5000));
        igWindow.webContents.executeJavaScript(`
        window.location = "https://www.instagram.com/direct/inbox/";
        `);
              }

}


            }) // end ipcMain onmessage curly brace

          } else if(igWindow.webContents.getURL() == 'https://www.instagram.com/direct/requests/'){
            await new Promise(r => setTimeout(r, 5000));
          igWindow.webContents.executeJavaScript(`
          const checkMessageRequest = async()=>{
          document.querySelectorAll(".x9f619.x1n2onr6.x1ja2u2z.x78zum5.x2lah0s.x1qughib.x6s0dn4.xozqiw3.x1q0g3np")[0].click();
          await new Promise(r => setTimeout(r, 5000));
          const el = document.getElementsByTagName('div');
          for(i = 0; i < el.length; i++){
            if (el[i].innerText == 'Accept'){
           el[i].click();
          }};
          await new Promise(r => setTimeout(r, 5000));
          for(i = 0; i < el.length; i++){
            if (el[i].innerText == 'Primary'){
           el[i].click();
          }};
          await new Promise(r => setTimeout(r, 5000));
          
            }
            checkMessageRequest();

           `)

          } else if(igWindow.webContents.getURL() == "https://www.instagram.com/direct/requests/hidden/"){
            await new Promise(r => setTimeout(r, 3000));
            igWindow.webContents.executeJavaScript(`window.document.location = "https://www.instagram.com/direct/inbox/";`)

          }

          }) //end did-navigate-in-page curly

     } catch (error) {
       console.log(error);
     }


   });


};

ipcMain.on('stopBot', (event) => {
  try {
    if (igWindow) {
      console.log(`ipcMain Listener Count: ${ipcMain.listenerCount('launchBrowserKeyword')}`)
      igWindow.destroy();
      igWindow = null;
    }
  } catch (err) {
    console.log(err);
  }
});



app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



