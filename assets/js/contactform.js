function sendMail() {
    const form = document.getElementById('contact');
    const subject = document.getElementById('subject');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    const name = document.getElementById('name');
    const errorMessage = document.getElementById('error');
    form.addEventListener('submit', (e) => {
        let messages = [];
            if(name.value === '' || name.value == null){
                messages.push('Name is required')
            }
        
        if(subject.value === '' || subject.value == null){
            messages.push('Subject is required')
        }
        if(email.value === '' || email.value == null){
            messages.push('Email is required')
        }
        if(message.value === '' || message.value == null){
            messages.push('Message is required')
        }
        if(messages.length>0){
            e.preventDefault()
            errorMessage.innerText = messages.join(', ')
        }
    })
    let params = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value
    }
    // if(errorMessage === empty){
    //     e.preventDefault();
        emailjs.send("service_2a988do", "template_j731hye", params).then(
            Swal.fire({
                title: "Success!",
                text: "Message sent!",
                icon: "success"
              })
            );
    // }
    
}