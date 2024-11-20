document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('search');
    const addressInput = document.getElementById('address');

    // const API_BASE_URL = 'http://localhost:3001';  //local deployment
    const API_BASE_URL = 'https://seo-vtdt-project.vercel.app'; // vercel deployemnt project

    if (form && addressInput) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const address = addressInput.value.trim();
            console.log('Address submitted:', address);

            if (!address) {
                alert('Please enter a valid URL.');
                return;
            }

            try {
                // POST request to the Express server
                const response = await fetch(`${API_BASE_URL}/api/analyze`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: address })
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Server response:', result);
                    alert(result.message);
                } else {
                    const errorData = await response.json();
                    console.error('Server Error:', errorData);
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
