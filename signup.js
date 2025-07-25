let emailError = document.getElementById("emailError");
let userNameError = document.getElementById("userNameError");
let passwordError = document.getElementById("passwordError");

let password = document.getElementById("passWord");
let eyeBtn = document.getElementById("eyeBtn");
let allInput = document.querySelectorAll("input");
let showPassClick = false;
let storedData =[];

eyeBtn.onclick = () => {
    showPassClick = !showPassClick;
    if (showPassClick === true) {
        password.setAttribute("type", "text");
        eyeBtn.innerHTML = `<svg style="width: 18px;height: 18px;" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
        <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
      </svg>`;
    } else {
        password.setAttribute("type", "password");
        eyeBtn.innerHTML = `<svg style="width: 18px;height: 18px;"  xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
      </svg>`;
    }
}



document.getElementById("signUpForm").addEventListener("submit", function (event) {
    event.preventDefault(); // prevent form from submitting
    storedData =[];
     let storedinlocalStorage = localStorage.getItem('Logininfo');
    if (storedinlocalStorage !== null) {
        // localStorage.setItem("Logininfo", JSON.stringify([obj]))
        storedData = JSON.parse(storedinlocalStorage);
    } 
    // Get input values
    const email = document.getElementById("emailId").value;
    const username = document.getElementById("userName").value;
    const password = document.getElementById("passWord").value;
    let isValid = true;

    emailError.textContent = "";
    userNameError.textContent = "";
    passwordError.textContent = "";




    // Validate email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const userPattern = /^[a-zA-Z][a-zA-Z0-9._]{2,15}$/;
    const passPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (email != "") {
        if (!email.match(emailPattern)) {
            emailError.textContent = "Invalid email format";
            isValid = false;
        }else {
            if (storedData != null){
                storedData.some(x => x.Email  === email)? (emailError.textContent = "Username already exists", isValid = false):emailError.textContent = ""; 
            }
        }
    } else {
        emailError.textContent = "Email is required";
        isValid = false;
    }

    if (username != "") {
        if (!username.match(userPattern)) {
            userNameError.textContent = "Invalid username format";
            isValid = false;
        } else {
            if (storedData != null){
                storedData.some(x => x.UserName  === username)? (userNameError.textContent = "Username already exists", isValid = false):userNameError.textContent = ""; 
            }
        }
    } else {
        userNameError.textContent = "Username is required";
        isValid = false;
    }

    if (password != "") {
        if (!password.match(passPattern)) {
            passwordError.textContent = "Invalid password format";
            isValid = false;
        }
    } else {
        passwordError.textContent = "Password is required";
        isValid = false;
    }

    if (isValid) {
        storedData.push({
            Email: email, UserName: username, Password: password
        })
        
        localStorage.setItem("Logininfo", JSON.stringify(storedData))
        


        for (let i = 0; i < allInput.length; i++) {
            allInput[i].value = "";
        }
        alert("Form submitted successfully!");
        window.location.href = 'index.html';
        }
});


// fetch('https://api.openweathermap.org/data/2.5/weather?q=Mumbai&appid=ff64049707b1a6f8ad5a3f7fe9b54694')
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json(); // parse JSON from the response
//     })
//     .then(data => {
//         console.log(data); // handle the data
//     })
//     .catch(error => {
//         console.error('There was a problem with the fetch operation:', error);
//     });