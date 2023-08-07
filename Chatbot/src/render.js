const { ipcRenderer } = require('electron');

const submitBtn = document.getElementById("submit-button");
const questionAnswer = document.querySelectorAll(".question-answer");
const addCommentBtn = document.getElementById("add-comment");
const stopBot = document.getElementById("stop-button");
const comment = document.getElementById("commentGroup");
const userName = document.getElementById("username");
const password = document.getElementById("password");
const userQuestion = document.querySelectorAll(".user-input");
const responseToQuestion = document.querySelectorAll(".response");
const questionBtn = document.getElementById('question-button');
const questionsBlock = document.getElementById('unanswered-questions-block');
const clearBtn = document.getElementById("clear-btn")
let numOfQuestions;

if( localStorage.getItem("username") && localStorage.getItem("password") && localStorage.getItem("numOfQuestions")){
    let savedUser = localStorage.getItem("username");
    let savedPass = localStorage.getItem("password");
     let firstQuestion = localStorage.getItem("question0");
    document.querySelector(".user-input").value = firstQuestion;
    let firstAnswer = localStorage.getItem("response0");
    document.querySelector(".response").value = firstAnswer;
    userName.value = savedUser;
    password.value = savedPass;

    let questionReg = /question/;

    for(var i = 1; i < Number(localStorage.getItem("numOfQuestions")); i++ ){

    console.log(localStorage.getItem(`question${[i]}`));
    console.log(localStorage.getItem(`response${[i]}`));
    const newCommentEl = comment.cloneNode(true);
        const deleteEl = `<button class="btn btn-secondary btn-block deleteBtn">Delete Comment</button>`
        newCommentEl.innerHTML += deleteEl;
        document.getElementById("addedComments").appendChild(newCommentEl);
        newCommentEl.querySelector(".user-input").value = localStorage.getItem(`question${[i]}`);
        newCommentEl.querySelector(".response").value = localStorage.getItem(`response${[i]}`);
        newCommentEl.querySelector(".deleteBtn").addEventListener("click", (event)=>{
                    let btn = event.target;
                    btn.parentElement.remove();
            })

        
    }
}


addCommentBtn.addEventListener("click", ()=>{
    const newCommentEl = comment.cloneNode(true);
    const deleteEl = `<button class="btn btn-secondary btn-block deleteBtn">Delete</button>`
    newCommentEl.innerHTML += deleteEl;
    document.getElementById("addedComments").appendChild(newCommentEl);
        newCommentEl.querySelector(".deleteBtn").addEventListener("click", (event)=>{
        let btn = event.target;
        btn.parentElement.remove();
})
});


const runChat = () => {
    if(userName.value == "" || password.value == ""){
        alert("Must Enter USERNAME & PASSWORD");
        return;
    }


    let comments = document.querySelectorAll(".comments");
    comments.forEach((comment) =>{
    if(comment.value == ""){
        alert("Cannot leave empty comment field. Either add comment or delete empty field.");
        throw "Cannot leave empty comment field. Either add comment or delete empty field."
    }
    })
    const commentArr = [];
    comments.forEach(comment => commentArr.push(comment.value));
    //console.log(commentArr)

let questionsArray = [];
let answerArray = [];

    for (i = 0; i < document.querySelectorAll(".user-input").length; i++){
        localStorage.setItem(`question${i}`, document.querySelectorAll(".user-input")[i].value);
        console.log(`Set item question${i} to ${document.querySelectorAll(".user-input")[i].value}`);
        numOfQuestions = (Number([i]) + Number(1));
       questionsArray.push(document.querySelectorAll(".user-input")[i].value);
       answerArray.push(document.querySelectorAll(".response")[i].value);
       localStorage.setItem("numOfQuestions", numOfQuestions);
    };
console.log(questionsArray);
console.log(answerArray);


     for (i = 0; i < document.querySelectorAll(".response").length; i++){
      localStorage.setItem(`response${i}`, document.querySelectorAll(".response")[i].value);
       // console.log(`Set item response${i} to ${document.querySelectorAll(".response")[i].value}`);
            };
        
            localStorage.setItem("comments", JSON.stringify(commentArr))

    localStorage.setItem("username", userName.value.toLowerCase());
    localStorage.setItem("password", password.value);

    let objParams = {
        username: `${userName.value}`,
        pass: `${password.value}`,
        map: null

    };
   
    //console.log(objParams);

    const commentMap = new Map();

   for(i = 0; i < answerArray.length; i++){
       commentMap.set(`${questionsArray[i]}`,`${answerArray[i]}`);
   };
objParams.map = commentMap;
console.log(objParams);
ipcRenderer.send('launchBrowser', objParams);

}

submitBtn.addEventListener("click", runChat);


questionBtn.addEventListener("click", ()=>{

    ipcRenderer.send('readFile');
});


clearBtn.addEventListener("click", ()=>{
    ipcRenderer.send("clearFile");
    questionsBlock.innerText = "Successfully Cleared!";

})


ipcRenderer.on('asynchronous-message', function (evt, message) {
    console.log(message);
    if(message.SAVED == ""){
        questionsBlock.innerText = "No messages yet";
        return;
    }
    questionsBlock.innerText = message.SAVED;
});


const stopProcess = () =>{
    try{
ipcRenderer.send('stopBot');
alert("Bot Process Successfully Stopped!")
    }catch(err){
        alert(err)
    }

}

stopBot.addEventListener("click", stopProcess);