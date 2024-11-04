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

  resultsUI.classList.remove("visible"); 
  resultsUI.classList.add("hidden");     
  
  setTimeout(() => {
    resultsUI.classList.remove("hidden");  
    resultsUIBackground.classList.remove("visible"); 
  }, 500); 
}
