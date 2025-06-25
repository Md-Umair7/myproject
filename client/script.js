window.onload = function () {
  const isAdmin = localStorage.getItem("isAdmin");

  if (isAdmin === "true") {
    document.getElementById("adminControls").style.display = "block";
  } else {
    document.getElementById("adminControls").style.display = "none";
  }
};
function validateLogin() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value;
  const validUser = "admin";
  const validPass = "admin123";
  if (user === validUser && pass === validPass) {
    alert("Login successful! Welcome, Admin.");
    hideLogin();
    localStorage.setItem("isAdmin", "true");
    document.getElementById("adminControls").style("display : block");
  } else {
    document.getElementById("errorMsg").textContent = "Invalid credentials!";
  }
}
function showLogin() {
  document.getElementById("loginPopup").style.display = "flex";
}
function hideLogin() {
  document.getElementById("loginPopup").style.display = "none";
  document.getElementById("errorMsg").textContent = "";
}

  
function addTournament() {
    const tournamentName = document.getElementById("newTournament").value.trim();
    if (tournamentName !== "") {
      const li = document.createElement("li");
      li.textContent = tournamentName;
      
    }
    const tournamentDes = document.getElementById("newDesTournament").value.trim();
    if (tournamentName !== "") {
      const li = document.createElement("li");
      li.textContent = tournamentName + " - " + tournamentDes;
      document.getElementById("tournamentList").appendChild(li);
      document.getElementById("newDesTournament").value = "";
    }
  }

function deleteLastTournament() {
  const list = document.getElementById("tournamentList");
  if (list.lastChild) {
    list.removeChild(list.lastChild);
  }
  
}
function logout() {
  localStorage.removeItem("isAdmin");
  document.getElementById("adminControls").style.display = "none";
  alert("Logged out.");
  window.location.reload();
}
    
