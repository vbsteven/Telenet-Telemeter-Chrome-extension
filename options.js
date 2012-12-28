window.addEventListener("load", restore_options);
document.getElementById("save_options").addEventListener("click", save_options);

// Saves options to localStorage
function save_options() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  localStorage["username"] = username;
  localStorage["password"] = password;

  // Update status to let user know options were saved
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  document.getElementById("form").innerHTML = "";

  chrome.extension.getBackgroundPage().fetchdata();
}

// Restores options from localStorage
function restore_options() {
  var username = localStorage["username"];
  var password = localStorage["password"];
  if (!username || !password) {
    return;
  }
  document.getElementById("username").value = username;
  document.getElementById("password").value = password;
}