import { auth, database } from "../firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, set, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Your jQuery code
$(document).ready(function () {
  $(".info-item .btn").click(function () {
    $(".container").toggleClass("log-in");
  });

  $(".container-form .btn").click(function () {
    $(".container").addClass("active");
  });
});

// Login Function
function signin() {
  const loginEmail = document.getElementById("ema").value.trim();
  const loginPassword = document.getElementById("passw").value;

  // Validate input fields
  if (!validateEmail(loginEmail)) {
    alert("Invalid email");
    return;
  }
  if (!passwordValidate(loginPassword)) {
    alert("Invalid password");
    return;
  }

  signInWithEmailAndPassword(auth, loginEmail, loginPassword)
    .then((userCredential) => {
      const user = userCredential.user;

      // Reference to user's data in the database
      const databaseRef = ref(database, `users/${user.uid}`);
      get(databaseRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();

            // Update last login time
            const updates = { last_login: Date.now() };
            set(databaseRef, { ...userData, ...updates });

            // Cache role locally for quicker access
            localStorage.setItem("userRole", userData.role);

            // Redirect to home page
            window.location.href = "../Home/home.html";
          } else {
            alert("User Data not found. Please contact support");
          }
        })
        .catch((err) => {
          console.error("Database error:", err.message);
          alert(`Database error: ${err.message}`);
        });
    })
    .catch((e) => {
      alert(`Authentication error: ${e.message}`);
    });
}

// Signup Function
function signup() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("pass").value;
  const username = document.getElementById("user").value.trim();
  const repeat = document.getElementById("repeat").value;

  // Validate input fields
  if (!validateEmail(email)) {
    alert("Invalid email format.");
    return;
  }
  if (!passwordValidate(password)) {
    alert("Password must be at least 6 characters long.");
    return;
  }
  if (!usernameValidate(username)) {
    alert("Username cannot be empty.");
    return;
  }
  if (!repeatValidate(repeat, password)) {
    alert("Passwords do not match.");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // User data
      const user_data = {
        email: email,
        username: username,
        last_login: Date.now(),
        role: "user",
      };

      // Save user to the database
      const databaseRef = ref(database, `users/${user.uid}`);
      set(databaseRef, user_data)
        .then(() => {
          alert("Registration successful!");
        })
        .catch((err) => {
          console.error("Database error:", err.message);
          alert("An error occurred while saving user data.");
        });
    })
    .catch((err) => {
      console.error("Authentication error:", err.message);
      alert(`Authentication error: ${err.message}`);
    });
}

// Refresh Role Function
function refreshRole() {
  const user = auth.currentUser;
  if (user) {
    const databaseRef = ref(database, `users/${user.uid}`);
    get(databaseRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          localStorage.setItem("userRole", userData.role); // Cache role locally
        }
      })
      .catch((err) => {
        console.error("Error refreshing role:", err.message);
      });
  }
}

// Validation Functions
function validateEmail(email) {
  const expression = /^[^@]+@\w+(\.\w+)+\w$/;
  return expression.test(email);
}

function passwordValidate(password) {
  return (
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}

function usernameValidate(username) {
  return username && username.trim() !== "";
}

function repeatValidate(repeat, password) {
  return repeat === password;
}

// Attach functions to window for global scope
window.signup = signup;
window.signin = signin;
window.refreshRole = refreshRole;
