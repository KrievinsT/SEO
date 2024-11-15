document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('search');
    const addressInput = document.getElementById('address');

    // Determine the API base URL based on the environment
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001' // Backend server URL during development
        : 'https://seo-vtdt-project.vercel.app'; // Production URL

    if (form && addressInput) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const address = addressInput.value.trim();
            console.log('Address submitted:', address);

            if (!address) {
                alert('Please enter a valid URL.');
                return;
            }

            // Sending GET request to '/api/analyze' to handle analysis and saving of the URL
            try {
                const response = await fetch(`${API_BASE_URL}/api/analyze?url=${encodeURIComponent(address)}`, {
                    method: 'GET' // GET request since you are fetching data
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Analysis result:', result);
                    alert('Analysis complete. Check the console for details.');
                } else {
                    const errorData = await response.json();
                    console.error('Error during analysis:', errorData);
                    alert(`Error: ${errorData.error}`);
                }
            } catch (error) {
                console.error('Fetch Error:', error);
                alert(`An error occurred: ${error.message}`);
            }
        });
    } else {
        console.error('Form or address input not found.');
    }
});
