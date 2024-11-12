function ShowResultsUI() {
  var resultsUI = document.getElementById("results_UI");
  var resultsUIBackground = document.getElementById("results_UI_background");
  var resultScreen = document.querySelector(".result_screen");
  var resultArticles = document.querySelectorAll(".resultArticle");
  var seoResults = document.getElementById("seoResults");
  var noDataMessage = document.getElementById("noResultsMessage");

  resultsUI.classList.remove("hidden");
  resultsUI.classList.add("visible");
  resultsUIBackground.classList.add("visible");
  document.body.classList.add("no-scroll");

  // Check if there are any rows in the SEO results table
  if (seoResults && seoResults.querySelectorAll("tr").length > 0) {
    noDataMessage.style.display = "none"; // Hide the message if data is available
  } else {
    noDataMessage.style.display = "block"; // Show message if no data
  }

  // Reset scroll position if resultScreen exists
  if (resultScreen) { 
    resultScreen.scrollTop = 0; 
  }

  resultArticles.forEach((article) => {
    article.classList.remove("show-result-article");
    article.style.visibility = "hidden"; 
  });

  setTimeout(() => {
    resultArticles.forEach((article, index) => {
      setTimeout(() => {
        article.style.visibility = "visible"; 
        article.classList.add("show-result-article"); 
      }, 600 + index * 200); 
    });
  }, 100); 
}

function HideResultsUI() {
  const resultsUI = document.getElementById("results_UI");
  const resultsUIBackground = document.getElementById("results_UI_background");
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = '';
  document.body.classList.remove("no-scroll");
  resultsUI.classList.add("hidden");
  closeSortPopup();
  setTimeout(() => {
    resultsUI.classList.remove("visible");
    resultsUIBackground.classList.remove("visible");
  }, 500); 
}

function OpenSortPopup() {
  const sortPopup = document.getElementById("sort_popup");
  sortPopup.style.display = "block";
  sortPopup.classList.remove("fade-out");
  sortPopup.classList.add("fade-in"); 
}

function closeSortPopup() {
  const sortPopup = document.getElementById("sort_popup");
  sortPopup.classList.remove("fade-in");
  sortPopup.classList.add("fade-out");  
  sortPopup.addEventListener("animationend", () => {
    sortPopup.style.display = "none";  
  }, { once: true });
}

document.querySelector(".OpenSortPopup-Button").addEventListener("click", function() {
  OpenSortPopup();  
});

document.addEventListener('DOMContentLoaded', function() {
  const seoResultsDiv = document.getElementById('seoResults');
  const noResultsMessage = document.getElementById('noResultsMessage');

  function toggleNoResultsMessage() {
    if (seoResultsDiv.innerHTML.trim() === '') {
      noResultsMessage.style.display = 'block';
    } else {
      noResultsMessage.style.display = 'none'; 
    }
  }

  toggleNoResultsMessage();

  const observer = new MutationObserver(function(mutations) {
    toggleNoResultsMessage();
  });

  observer.observe(seoResultsDiv, { childList: true });

  function populateResults(data) {
    seoResultsDiv.innerHTML = data;
    toggleNoResultsMessage(); 
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const sortButton = document.querySelector(".OpenSortPopup-Button");
  if (sortButton) {
    sortButton.addEventListener("click", OpenSortPopup); 
  }
  
  document.getElementById('searchKeywords').addEventListener('click', function() {
    const keyword = document.getElementById('keywords').value.toLowerCase().trim();
    const resultsDiv = document.getElementById('result_screen');
    resultsDiv.scrollTop = 1;
    filterResultsByKeyword(keyword);
    const filteredResults = filterResultsByKeyword(keyword);
  });

  function filterResultsByKeyword(keyword) {
    const rows = document.querySelectorAll("#seoResults table tr"); 
    let filteredCount = 0;
    if (keyword === "") {
      rows.forEach(row => {
        row.style.display = "";
      });
      const messageDiv = document.getElementById("message");
      messageDiv.textContent = "Showing all results.";
      messageDiv.style.color = "green";
      return; 
    }
    rows.forEach(row => {
      const keywordCell = row.querySelector("td:first-child");
      if (keywordCell) {
        const keywordText = keywordCell.textContent.toLowerCase();
        if (keywordText.includes(keyword)) {
          row.style.display = ""; 
          filteredCount++;
        } else {
          row.style.display = "none";
        }
      }
    });
    const messageDiv = document.getElementById("message");
    if (filteredCount === 0) {
      messageDiv.textContent = "No results found for the keyword.";
      messageDiv.style.color = "orange";
    } else {
      messageDiv.textContent = `${filteredCount} result(s) found.`;
      messageDiv.style.color = "green";
    }
  }
});

function sortTable(criteria) {
  const resultsDiv = document.getElementById('seoResults');
  const rows = Array.from(resultsDiv.querySelectorAll('table tr:nth-child(n+2)')); 
  rows.sort((rowA, rowB) => {
    const cellA = rowA.querySelector(`td:nth-child(${criteria})`).textContent.trim();
    const cellB = rowB.querySelector(`td:nth-child(${criteria})`).textContent.trim();
    const valA = isNaN(cellA) ? cellA : parseFloat(cellA.replace(/[^\d.-]/g, ''));
    const valB = isNaN(cellB) ? cellB : parseFloat(cellB.replace(/[^\d.-]/g, ''));
    if (criteria === 5) {
      return valA - valB;
    } else {
      if (valA < valB) return 1;
      if (valA > valB) return -1;
      return 0;
    }
  });
  rows.forEach(row => resultsDiv.querySelector('table').appendChild(row));
}

function handleSortClick() {
  const sortCriteria = document.querySelector('input[name="sort_order"]:checked');
  if (sortCriteria) {
    const id = sortCriteria.id;
    const columnMap = {
      'searches': 2,        
      'difficulty_level': 3, 
      'lowest_cpc': 5,  
      'highest_cpc': 6,      
      'trend': 7      
    };
    if (columnMap[id]) {
      sortTable(columnMap[id]); 
    }
    const resultsDiv = document.getElementById('result_screen');
    resultsDiv.scrollTop = 1;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const radioButtons = document.querySelectorAll('input[name="sort_order"]');
  radioButtons.forEach(radioButton => {
    radioButton.addEventListener('change', handleSortClick); 
  });
});
