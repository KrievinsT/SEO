const API_KEY = '863f996b17msh702f87465d3cdfap1e3ad1jsn444217e2a189';
const API_HOST = 'google-keyword-insight1.p.rapidapi.com';

// Function to fetch Global Results (By URL)
async function fetchGlobalResults(url) {
    const apiUrl = `https://${API_HOST}/globalurl/?url=${encodeURIComponent(url)}&lang=en`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': API_HOST
        }
    };

    try {
        const response = await fetch(apiUrl, options);
        const result = await response.json();
        console.log('Global Results:', JSON.stringify(result, null, 2)); // Pretty print the result
    } catch (error) {
        console.error('Error fetching Global Results:', error);
    }
}

// Main function to call both API functions
(async function() {
    const testUrl = 'https://www.assettoworld.com';
    //global
    console.log('Fetching Global Results...');
    await fetchGlobalResults(testUrl);
})();
