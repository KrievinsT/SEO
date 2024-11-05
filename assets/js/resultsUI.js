function ShowResultsUI() {
  var resultsUI = document.getElementById("results_UI");
  var resultsUIBackground = document.getElementById("results_UI_background");
  
  resultsUI.classList.remove("hidden"); 
  resultsUI.classList.add("visible");   
  resultsUIBackground.classList.add("visible"); 
}

function HideResultsUI() {
  var resultsUI = document.getElementById("results_UI");
  var resultsUIBackground = document.getElementById("results_UI_background");
  var closeSortPopup = document.getElementById("sort_popup").style.display = "none";
  var closeFilterPopup = document.getElementById("filter_popup").style.display = "none";

  resultsUI.classList.remove("visible"); 
  resultsUI.classList.add("hidden");     
  
  setTimeout(() => {
    resultsUI.classList.remove("hidden");  
    resultsUIBackground.classList.remove("visible"); 
  }, 500); 
}

function OpenSortPopup() {
  var OpenSortPopup = document.getElementById("sort_popup").style.display = "block";
  var closeFilterPopup = document.getElementById("filter_popup").style.display = "none";
}
function closeSortPopup() {
  var closeSortPopup = document.getElementById("sort_popup").style.display = "none";
}
function OpenFilterPopup() {
  var OpenFilterPopup = document.getElementById("filter_popup").style.display = "block";
  var closeSortPopup = document.getElementById("sort_popup").style.display = "none";
}
function closeFilterPopup() {
  var closeFilterPopup = document.getElementById("filter_popup").style.display = "none";
}