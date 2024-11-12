document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('search');
    const addressInput = document.getElementById('address');
  
    if (form && addressInput) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const address = addressInput.value;
        console.log('Address submitted:', address);
  
        if (!address) {
          return;
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
            console.log('Server response:', result);
            // Handle success
          } else {
            const errorText = await response.text();
            console.error('Server Error:', errorText);
          }
        } catch (error) {
          console.error('Fetch Error:', error);
        }
      });
    } else {
      console.error('Form or address input not found.');
    }
  });
  