// DATA STORAGE 
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let persons = JSON.parse(localStorage.getItem("persons")) || [];
let shop = JSON.parse(localStorage.getItem("shop")) || {name:"", phone:""};
const today = new Date().toISOString().split("T")[0];

// GREETING
const greetingEl = document.getElementById("greeting");
const hour = new Date().getHours();
greetingEl.innerText = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

// SHOP OWNER 
const shopOwnerEl = document.getElementById("shopOwner");
shopOwnerEl.innerText = shop.name ? "Shop Owner: " + shop.name : "";

//  DATE
document.getElementById("todayDate").innerText = new Date().toDateString();

//  POPUP FUNCTIONS 
function openPopup(id){
  document.querySelectorAll(".popup").forEach(p => { if(p.id!==id) p.classList.remove("active"); });
  document.getElementById(id).classList.add("active");
}

function closePopup(id){
  document.getElementById(id).classList.remove("active");
}

function togglePopup(id){
  const popup = document.getElementById(id);
  if(popup.classList.contains("active")){
    popup.classList.remove("active");
  } else {
    document.querySelectorAll(".popup").forEach(p => p.classList.remove("active"));
    popup.classList.add("active");
  }
}

//  CLOSE BUTTON 
document.querySelectorAll(".close").forEach(btn => {
  btn.onclick = ()=> closePopup(btn.dataset.popup);
});

// CLICK OUTSIDE 
document.querySelectorAll(".popup").forEach(p => {
  p.addEventListener("click", e => { if(e.target===p) closePopup(p.id); });
});

//  FOOTER ICON TOGGLE 
const footerIcons = document.querySelectorAll(".footer i");
footerIcons.forEach(icon=>{
  icon.addEventListener("click", ()=>{
    const isActive = icon.classList.contains("active");
    footerIcons.forEach(i=>i.classList.remove("active"));
    if(!isActive) icon.classList.add("active");
  });
});

//  FOOTER BUTTONS 
document.getElementById("addBtn").onclick = ()=>togglePopup("addPopup");
document.getElementById("deductBtn").onclick = ()=>togglePopup("deductPopup");
document.getElementById("historyBtn").onclick = ()=>{ togglePopup("historyPopup"); loadHistory(); };
document.getElementById("personsBtn").onclick = ()=>{ togglePopup("personsPopup"); loadPersons(); };
document.getElementById("settingsBtn").onclick = ()=>togglePopup("settingsPopup");

//  SAVE TRANSACTION
function saveTransaction(name, amount, type){
  const now = new Date();
  transactions.push({
    name: name,
    amount: Number(amount),
    type: type,
    date: now.toISOString().split("T")[0],
    dateTime: now.getTime()
  });
  saveData();
}

//ADD 
document.getElementById("saveAdd").onclick = ()=>{
  const n = document.getElementById("addName").value.trim();
  const a = document.getElementById("addAmount").value.trim();

  if(!n || !a){
    alert("Fill all fields!");
    return;
  }

  const personExists = persons.some(p=>p.name.toLowerCase()===n.toLowerCase());
  if(!personExists){
    alert("Person not found! Please add the person first.");
    closePopup("addPopup");
    openPopup("personPopup");
    document.getElementById("personName").value = n;
    return;
  }

  saveTransaction(n, a, "add");
  document.getElementById("addName").value="";
  document.getElementById("addAmount").value="";
  closePopup("addPopup");
};

// DEDUCT
document.getElementById("saveDeduct").onclick = ()=>{
  const n = document.getElementById("deductName").value.trim();
  const a = document.getElementById("deductAmount").value.trim();

  if(!n || !a){
    alert("Fill all fields!");
    return;
  }

  const personExists = persons.some(p=>p.name.toLowerCase()===n.toLowerCase());
  if(!personExists){
    alert("Person not found! Please add the person first.");
    closePopup("deductPopup");
    openPopup("personPopup");
    document.getElementById("personName").value = n;
    return;
  }

  saveTransaction(n, a, "deduct");
  document.getElementById("deductName").value="";
  document.getElementById("deductAmount").value="";
  closePopup("deductPopup");
};

// TODAY LIST
function loadToday(){
  const list = document.getElementById("todayList");
  const todayTx = transactions.filter(t=>t.date===today);
  list.innerHTML="";
  if(todayTx.length===0){
    list.innerHTML="<p>No transactions today</p>";
    return;
  }

  todayTx.reverse().forEach(t=>{
    const div = document.createElement("div");
    div.className="transaction";
    const txDate = new Date(t.dateTime);
    const timeStr = txDate.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
    div.innerHTML = `<b>${t.name}</b><br>${t.type==="add"?"Added(+) Rs.":"Deducted(-) Rs."} ${t.amount}<br>${timeStr}`;
    list.appendChild(div);
  });
}

//  HISTORY 
function loadHistory(){
  const list = document.getElementById("historyList");
  list.innerHTML="";
  if(transactions.length===0){
    list.innerHTML="<p>No history</p>";
    return;
  }

  transactions.slice().reverse().forEach(t=>{
    const div=document.createElement("div");
    div.className="transaction";
    const dt=new Date(t.dateTime);
    let hours=dt.getHours();
    let minutes=dt.getMinutes().toString().padStart(2,"0");
    const ampm=hours>=12?"PM":"AM";
    hours=hours%12||12;
    const timeStr=`${hours}:${minutes} ${ampm}`;
    div.innerHTML = `<b>${t.name}</b><br>${t.type==="add"?"Added(+) Rs.":"Deducted(-) Rs."} ${t.amount}<br>${t.date} ${timeStr}`;
    list.appendChild(div);
  });
}

// PERSONS 
document.getElementById("addPersonBtn").onclick = ()=>openPopup("personPopup");
document.getElementById("savePerson").onclick = ()=>{
  const name=document.getElementById("personName").value.trim();
  const phone=document.getElementById("personPhone").value.trim();

  if(!name || !phone){ alert("Fill all fields!"); return; }
  const exists = persons.find(p=>p.name.toLowerCase()===name.toLowerCase());
  if(exists){ alert("Person already exists!"); return; }

  persons.push({name,phone});
  saveData();
  document.getElementById("personName").value="";
  document.getElementById("personPhone").value="";
  closePopup("personPopup");
  loadPersons();
};

function loadPersons(){
  const list=document.getElementById("personsList");
  list.innerHTML="";
  if(persons.length===0){ list.innerHTML="<p>No persons added</p>"; return; }

  persons.forEach(p=>{
    const div=document.createElement("div");
    div.className="transaction";
    div.style.cursor="pointer";
    const balance = transactions.filter(t=>t.name===p.name)
                      .reduce((acc,t)=> t.type==="add"? acc+Number(t.amount): acc-Number(t.amount),0);
    div.innerHTML=`<span>${p.name}</span><span style="float:right">${balance}</span>`;
    div.onclick=()=>{
      document.getElementById("personInfoName").innerText="Name: "+p.name;
      document.getElementById("personInfoPhone").innerText="Phone: "+p.phone;
      document.getElementById("personInfoBalance").innerText="Balance: "+balance;
      openPopup("personInfoPopup");
    };
    list.appendChild(div);
  });
}

//  SETTINGS
document.getElementById("saveShop").onclick=()=>{
  const n=document.getElementById("shopName").value.trim();
  const p=document.getElementById("shopNumber").value.trim();
  shop={name:n,phone:p};
  saveData();
  shopOwnerEl.innerText = shop.name ? "Shop Owner: "+shop.name : "";
};

// THEMES
// UPDATED THEME NAMES TO MATCH CSS SWAPS
const colors=["blue","orange","yellow","green"];
colors.forEach(color=>{
  document.querySelector("."+color)?.addEventListener("click",()=>applyTheme(color));
});

const savedTheme = localStorage.getItem("themeColor");
if(savedTheme){
    applyTheme(savedTheme);
} else {
    applyTheme("blue"); // DEFAULT THEME AFTER SWAP
}

function applyTheme(color){
  document.body.classList.remove("blue-theme","orange-theme","yellow-theme","green-theme");
  document.body.classList.add(color+"-theme");
  localStorage.setItem("themeColor",color);
}

// SAVE DATA 
function saveData(){
  localStorage.setItem("transactions",JSON.stringify(transactions));
  localStorage.setItem("persons",JSON.stringify(persons));
  localStorage.setItem("shop",JSON.stringify(shop));
  loadToday();
  loadHistory();
  loadPersons();
}

// RESET
const resetBtn=document.getElementById("settingsResetBtn");
const resetPopup=document.getElementById("resetConfirmPopup");
const resetYes=document.getElementById("resetYes");
const resetNo=document.getElementById("resetNo");

resetBtn.onclick=()=>resetPopup.classList.add("active");
resetNo.onclick=()=>resetPopup.classList.remove("active");
resetYes.onclick=()=>{
  localStorage.removeItem("transactions");
  localStorage.removeItem("persons");
  localStorage.removeItem("shop");
  resetPopup.classList.remove("active");
  location.reload();
};
resetPopup.onclick=e=>{if(e.target===resetPopup) resetPopup.classList.remove("active");};
// How to Use button click
document.getElementById("howToUseBtn").onclick = () => openPopup("howToUsePopup");
//  LOADING SCREEN 
window.addEventListener("load", () => {
  const loader = document.querySelector(".loading-screen");

  setTimeout(() => {
    if(loader) loader.style.display = "none";
    if(welcomeContainer) welcomeContainer.style.display = "flex"; // if you have a welcome container
    disableboxes(); // your existing function

    // FIRST TIME CHECK 
    if(!localStorage.getItem("firstVisit")){
        // Open Settings popup
        openPopup("settingsPopup");
        // Mark as visited
        localStorage.setItem("firstVisit", "true");
    }

  }, 2000);
});
//  INITIAL LOAD
saveData();