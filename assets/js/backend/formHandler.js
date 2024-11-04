document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('search');
    const addressInput = document.getElementById('address');

    if (form && addressInput) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const address = addressInput.value;
            console.log('Address submitted:', address);  // This should log the actual URL

            if (!address) {
                // alert('No URL provided!');
                return;  // Prevents sending an empty request
            }

            try {
                const response = await fetch('http://localhost:3001/submit-url', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: address })
                });

                if (response.ok) {
                    const result = await response.json();
                    // console.log(result);
                } else {
                    const errorResult = await response.json();
                    // alert(`Error: ${errorResult.message}`);
                }
            } catch (error) {
                console.error('Fetch Error:', error);
            }
        });
    } else {
        console.error('Form or address input not found.');
    }
});
