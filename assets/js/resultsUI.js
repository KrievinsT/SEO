function ShowResultsUI() {
  var resultsUI = document.getElementById("results_UI");
  var resultsUIBackground = document.getElementById("results_UI_background");
  var resultScreen = document.querySelector(".result_screen");
  var resultArticles = document.querySelectorAll(".resultArticle");

  resultsUI.classList.remove("hidden");
  resultsUI.classList.add("visible");
  resultsUIBackground.classList.add("visible");

  document.body.classList.add("no-scroll");

  resultScreen.scrollTop = 0;

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

  document.body.classList.remove("no-scroll");

  resultsUI.classList.add("hidden");

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

  const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && seoResultsDiv.innerHTML.trim() !== '') {
              openPopup(); 
          }
      });
  });
  observer.observe(seoResultsDiv, { childList: true });
});

document.addEventListener('DOMContentLoaded', function() {

  const sortButton = document.querySelector(".OpenSortPopup-Button");
  if (sortButton) {
    sortButton.addEventListener("click", OpenSortPopup); 
  }

  document.getElementById('searchKeywords').addEventListener('click', function() {
      const keyword = document.getElementById('keywords').value.toLowerCase().trim();
      filterResultsByKeyword(keyword);
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
  const rows = Array.from(resultsDiv.querySelectorAll('table tr:nth-child(n+2)')); // Skip header row

  rows.sort((rowA, rowB) => {
    const cellA = rowA.querySelector(`td:nth-child(${criteria})`).textContent.trim();
    const cellB = rowB.querySelector(`td:nth-child(${criteria})`).textContent.trim();

    // Handle "Difficulty Level" sorting (column index 4)
    if (criteria === 4) { // Difficulty Level column
      const valA = (cellA === 'N/A' || isNaN(cellA)) ? Infinity : parseFloat(cellA); // Treat 'N/A' as Infinity
      const valB = (cellB === 'N/A' || isNaN(cellB)) ? Infinity : parseFloat(cellB); // Treat 'N/A' as Infinity

      return valA - valB; // Sort in ascending order (lower values come first)
    }

    // Handle "Highest CPC" sorting (column index 6)
    if (criteria === 6) { // Highest CPC column
      const valA = (cellA === 'N/A' || isNaN(cellA)) ? -Infinity : parseFloat(cellA.replace(/[^\d.-]/g, '')); // Treat 'N/A' as -Infinity
      const valB = (cellB === 'N/A' || isNaN(cellB)) ? -Infinity : parseFloat(cellB.replace(/[^\d.-]/g, '')); // Treat 'N/A' as -Infinity

      return valB - valA; // Sort in descending order (higher CPC values come first)
    }

    // Handle other columns (like "Searches", "Trend", "Lowest CPC", etc.)
    const valA = (cellA === 'N/A' || isNaN(cellA)) ? Infinity : parseFloat(cellA.replace(/[^\d.-]/g, ''));
    const valB = (cellB === 'N/A' || isNaN(cellB)) ? Infinity : parseFloat(cellB.replace(/[^\d.-]/g, ''));

    // Sorting ascending for "Lowest CPC" column (column index 5)
    if (criteria === 5) {
      return valA - valB;
    } else {
      // Sorting descending for other criteria
      return valB - valA;
    }
  });

  // Reorder the rows in the table
  rows.forEach(row => resultsDiv.querySelector('table').appendChild(row));
}

function handleSortClick() {
  const sortCriteria = document.querySelector('input[name="sort_order"]:checked');

  if (sortCriteria) {
    const id = sortCriteria.id;

    const columnMap = {
      'searches': 2,        
      'trend': 7,           
      'difficulty_level': 3, 
      'highest_cpc': 6,      
      'lowest_cpc': 5      
    };

    if (columnMap[id]) {
      sortTable(columnMap[id]); 
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  
  const radioButtons = document.querySelectorAll('input[name="sort_order"]');
  radioButtons.forEach(radioButton => {
    radioButton.addEventListener('change', handleSortClick); 
  });
});
