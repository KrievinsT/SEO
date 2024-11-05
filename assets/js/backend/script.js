document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('search').addEventListener('submit', function(event) {
        event.preventDefault();

        const websiteUrl = document.getElementById('address').value;
        fetch(`http://localhost:3000/api/analyze?url=${encodeURIComponent(websiteUrl)}`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.error || 'Network response was not ok');
                    });
                }
                return response.json();
            })
            .then(data => {
                displayResults(data, websiteUrl);
            })
            .catch(error => {
                console.error('Error:', error);
                displayResults({ error: error.message }, websiteUrl);
            });
    });

    function displayResults(data, websiteUrl) {
        const resultsDiv = document.getElementById('seoResults');
        console.log('Data received:', data);

        if (data.error) {
            resultsDiv.innerHTML = `<p>Error: ${data.error}</p>`;
        } else {
            let html = `<h2>SEO Report for ${websiteUrl}</h2>`;

            // Adjust the following code based on the actual data structure
            if (data.results && data.results.length > 0) {
                html += `
                    <table border="1">
                        <tr>
                            <th>Keyword</th>
                            <th>Search Volume</th>
                            <th>CPC</th>
                            <th>Competition</th>
                        </tr>
                `;

                data.results.forEach(item => {
                    html += `
                        <tr>
                            <td>${item.text || 'N/A'}</td>
                            <td>${item.volume || 'N/A'}</td>
                            <td>${item.cpc || 'N/A'}</td>
                            <td>${item.competition || 'N/A'}</td>
                        </tr>
                    `;
                });

                html += '</table>';
            } else {
                html += `<p>No keyword data found.</p>`;
            }

            resultsDiv.innerHTML = html;
        }
    }
});
