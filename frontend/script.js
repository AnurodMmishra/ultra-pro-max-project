let signupMode=false

function openAuth(){
document.getElementById("landing").style.display="none"
document.getElementById("auth").style.display="flex"
}

function toggleForm(){

signupMode=!signupMode

if(signupMode){
document.getElementById("formTitle").innerText="Sign Up"
document.getElementById("authButton").innerText="Sign Up"
document.getElementById("toggleText").innerHTML=
'Already have an account? <a href="#" onclick="toggleForm()">Login</a>'
}

else{
document.getElementById("formTitle").innerText="Login"
document.getElementById("authButton").innerText="Login"
document.getElementById("toggleText").innerHTML=
'Don\'t have an account? <a href="#" onclick="toggleForm()">Sign Up</a>'
}

}

function login(){
document.getElementById("auth").style.display="none"
document.getElementById("dashboard").style.display="block"
displayTasks()
}

function logout(){
document.getElementById("dashboard").style.display="none"
document.getElementById("landing").style.display="flex"
}

function addTask(){

let name=document.getElementById("taskName").value
let deadline=document.getElementById("deadline").value

if(name===""){
alert("Enter task")
return
}

let tasks=JSON.parse(localStorage.getItem("tasks"))||[]

tasks.push({name,deadline,completed:false})

localStorage.setItem("tasks",JSON.stringify(tasks))

displayTasks()
}

function displayTasks(){

let list=document.getElementById("taskList")

let tasks=JSON.parse(localStorage.getItem("tasks"))||[]

list.innerHTML=""

tasks.forEach((t,i)=>{

list.innerHTML+=`

<div class="task">

<span>${t.name} - ${t.deadline}</span>

<div>

<input type="file">

<button onclick="completeTask(${i})">Complete</button>

<button onclick="deleteTask(${i})">Delete</button>

</div>

</div>

`

})

}

function deleteTask(i){

let tasks=JSON.parse(localStorage.getItem("tasks"))

tasks.splice(i,1)

localStorage.setItem("tasks",JSON.stringify(tasks))

displayTasks()

}

function completeTask(i){

let tasks=JSON.parse(localStorage.getItem("tasks"))

tasks[i].completed=true

localStorage.setItem("tasks",JSON.stringify(tasks))

alert("Task Completed!")

displayTasks()

}