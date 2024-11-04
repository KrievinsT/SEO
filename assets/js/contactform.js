function sendMail() {
    let params = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value
    }

    emailjs.send("service_2a988do", "template_j731hye", params).then(alert("Email sent"));
    
}