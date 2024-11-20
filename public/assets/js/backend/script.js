document.addEventListener('DOMContentLoaded', function() {
    let latestResults = null; // To store the latest analysis results

    const messageDiv = document.getElementById('message'); // Reference to message div

    function showMessage(message, color = 'red') {
        messageDiv.style.color = color;
        messageDiv.textContent = message;
    }

    //const API_BASE_URL ='http://localhost:3000';
    const API_BASE_URL = 'https://seo-vtdt-project.vercel.app';
    console.log('Hostname:', window.location.hostname);
    console.log('API Base URL:', API_BASE_URL);


    // Event listener for the form submission
    document.getElementById('search').addEventListener('submit', function(event) {
        event.preventDefault();

        const websiteUrl = document.getElementById('address').value.trim();
        if (!websiteUrl) {
            showMessage('Please enter a valid URL.', 'orange');
            return;
        }

        const submitButton = document.querySelector('#search button[type="submit"]');
        submitButton.disabled = true; // Disable the submit button to prevent multiple submissions

        fetch(`${API_BASE_URL}/api/analyze?url=${encodeURIComponent(websiteUrl)}`)
            .then(response => {
                if (response.status === 429) {
                    throw new Error('Too Many Requests: Please wait a moment before trying again.');
                }
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.error || 'Network response was not ok');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Data received from /api/analyze:', data);
            
                // Handle the case where `data` is an array directly
                latestResults = {
                    url: websiteUrl,
                    data: data, // Assign the array directly
                    url_record_id: data.url_record_id // Only if the backend provides this
                };
            
                console.log('latestResults set to:', latestResults);
                displayResults(data, websiteUrl); // Pass the array directly to `displayResults`
            })
            .catch(error => {
                console.error('Error:', error);
                displayResults({ error: error.message }, websiteUrl); // Handle errors gracefully
                showMessage(`Error: ${error.message}`);
            });            
    });

    // Event listener for the "Save Results" button
    document.getElementById('saveResults').addEventListener('click', function() {
        if (!latestResults) {
            showMessage('No results to save. Please analyze a site first.', 'orange');
            return;
        }

        console.log('Sending data to /api/save:', latestResults);

        fetch(`${API_BASE_URL}/api/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(latestResults)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(errData.error || 'Failed to save results.');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Refresh the dropdown after saving
                fetchSavedUrls();
                showMessage('Results saved successfully!', 'green');
            } else {
                showMessage('Failed to save results.');
            }
        })
        .catch(error => {
            console.error('Error saving results:', error);
            showMessage(`An error occurred while saving results: ${error.message}`);
        });
    });

    // Event listener for the dropdown selection
    document.getElementById('savedUrlsDropdown').addEventListener('change', function() {
        const selectedId = this.value;
        if (selectedId) {
            fetch(`${API_BASE_URL}/api/saved/${selectedId}`)
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(errData => {
                            throw new Error(errData.error || 'Failed to fetch saved results.');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    displaySavedResult(data);
                })
                .catch(error => {
                    console.error('Error fetching saved results:', error);
                    showMessage(`An error occurred while fetching saved results: ${error.message}`);
                });
        } else {
            document.getElementById('seoResults').innerHTML = '';
        }
    });

    // Function to fetch the saved URL dropdown
    function fetchSavedUrls() {
        fetch(`${API_BASE_URL}/api/saved_urls`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.error || 'Failed to fetch saved URLs.');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched saved URLs:', data);
                populateSavedUrlsDropdown(data);
            })
            .catch(error => {
                console.error('Error fetching saved URLs:', error);
                showMessage(`Error fetching saved URLs: ${error.message}`);
            });
    }

    // Call fetchSavedUrls
    fetchSavedUrls();

    function populateSavedUrlsDropdown(urls) {
        const dropdown = document.getElementById('savedUrlsDropdown');
        dropdown.innerHTML = '<option value="">Saved URLs</option>';

        if (urls.length === 0) {
            showMessage('No saved URLs found.', 'orange');
            return;
        }

        // Populate dropdown with saved URLs
        urls.forEach(url => {
            console.log('Adding URL to dropdown:', url.url);
            const option = document.createElement('option');
            option.value = url._id;
            option.textContent = url.url;
            dropdown.appendChild(option);
        });
    }

    function displayResults(data, websiteUrl) {
        const resultsDiv = document.getElementById('seoResults');
    
        if (data.error) {
            resultsDiv.innerHTML = `<p>Error: ${data.error}</p>`;
        } else {
            let html = `<h2>SEO Report for ${websiteUrl}</h2>`;
            html += generateResultsTable(data); // Pass the array directly to the table generator
            resultsDiv.innerHTML = html;
        }
        ShowResultsUI()
    }

    function displaySavedResult(record) {
        const resultsDiv = document.getElementById('seoResults');
        let html = `<h2>SEO Report for ${record.url}</h2>`;
        html += `<p>Saved At: ${new Date(record.timestamp).toLocaleString()}</p>`;
        html += generateResultsTable(record.keywords);
        resultsDiv.innerHTML = html;
    }

    // Generate results table
    function generateResultsTable(keywords) {
        let html = `
            <table>
                <tr>
                    <th>Keyword</th>
                    <th>Searches</th>
                    <th>Competition Level</th>
                    <th>Difficulty Level</th>
                    <th>Lowest CPC</th>
                    <th>Highest CPC</th>
                    <th>Trend</th>
                </tr>
        `;
    
        if (Array.isArray(keywords) && keywords.length > 0) {
            keywords.forEach(item => {
                let keyword = item.keyword || item.text || 'N/A';
                let trendPercentage = item.trend !== undefined && item.trend !== null
                    ? (item.trend * 100).toFixed(2) + '%'
                    : 'N/A';
    
                html += `
                    <tr>
                        <td>${keyword}</td>
                        <td>${item.volume || 'N/A'}</td>
                        <td>${item.competition_level || 'N/A'}</td>
                        <td>${item.competition_index || 'N/A'}</td>
                        <td>${item.low_bid || 'N/A'}</td>
                        <td>${item.high_bid || 'N/A'}</td>
                        <td>${trendPercentage}</td>
                    </tr>
                `;
            });
        } else {
            html += `<tr><td colspan="7">No keyword data found.</td></tr>`;
        }
    
        html += '</table>';
        return html;
    }    
});
