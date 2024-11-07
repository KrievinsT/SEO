function sendMail(event) {
    event.preventDefault(); // Prevent form from submitting by default

    const form = document.getElementById('contact');
    const name = document.getElementById('name');
    const subject = document.getElementById('subject');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    const errorMessage = document.getElementById('error');
    
    let messages = [];

    // Validate each field
    if (name.value === '' || name.value == null) {
        messages.push('Name field can not be empty');
    }
    if (subject.value === '' || subject.value == null) {
        messages.push('Subject field can not be empty');
    }
    if (email.value === '' || email.value == null) {
        messages.push('Email is field can not be empty');
    }
    if (message.value === '' || message.value == null) {
        messages.push('Message field can not be empty');
    }

    // Check for validation errors
    if (messages.length > 0) {
        errorMessage.innerText = messages.join(', ');
        return; // Exit the function if there are validation errors
    }

    // If validation is successful, prepare data for EmailJS
    let params = {
        name: name.value,
        email: email.value,
        subject: subject.value,
        message: message.value
    };

    // Send the email using EmailJS
    emailjs.send("service_2a988do", "template_j731hye", params)
        .then(() => {
            Swal.fire({
                title: "Success!",
                text: "Message sent!",
                icon: "success"
            });
            form.reset(); // Reset the form after successful submission
        })
        .catch((error) => {
            console.error("Error sending email:", error);
        });
}

// Attach the event listener to the form
document.getElementById('contact').addEventListener('submit', sendMail);
