function ShowResultsUI() {
  var resultsUI = document.getElementById("results_UI");
  var resultsUIBackground = document.getElementById("results_UI_background");
  var resultArticle = document.getElementById("resultArticle");
  
  resultArticle.classList.remove("show-result-article");
  
  void resultArticle.offsetWidth;

  resultArticle.classList.add("show-result-article");

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
  var sortPopup = document.getElementById("sort_popup");
  var filterPopup = document.getElementById("filter_popup");
  
  if (filterPopup.classList.contains("fade-in")) {
    filterPopup.classList.remove("fade-in");
    filterPopup.classList.add("fade-out");
    filterPopup.addEventListener("animationend", () => {
      filterPopup.style.display = "none";
    }, { once: true });
  }
  
  sortPopup.style.display = "block";
  sortPopup.classList.remove("fade-out");
  sortPopup.classList.add("fade-in");
}

function closeSortPopup() {
  var sortPopup = document.getElementById("sort_popup");
  sortPopup.classList.remove("fade-in");
  sortPopup.classList.add("fade-out");
  sortPopup.addEventListener("animationend", () => {
    sortPopup.style.display = "none";
  }, { once: true });
}

function OpenFilterPopup() {
  var sortPopup = document.getElementById("sort_popup");
  var filterPopup = document.getElementById("filter_popup");

  if (sortPopup.classList.contains("fade-in")) {
    sortPopup.classList.remove("fade-in");
    sortPopup.classList.add("fade-out");
    sortPopup.addEventListener("animationend", () => {
      sortPopup.style.display = "none";
    }, { once: true });
  }

  filterPopup.style.display = "block";
  filterPopup.classList.remove("fade-out");
  filterPopup.classList.add("fade-in");
}

function closeFilterPopup() {
  var filterPopup = document.getElementById("filter_popup");
  filterPopup.classList.remove("fade-in");
  filterPopup.classList.add("fade-out");
  filterPopup.addEventListener("animationend", () => {
    filterPopup.style.display = "none";
  }, { once: true });
}

