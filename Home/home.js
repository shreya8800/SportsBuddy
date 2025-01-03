import { auth } from "../firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { database } from "../firebase-config.js";

// Listen for changes in the authentication state
onAuthStateChanged(auth, function(user) {
    if (user) {
        const userId = user.uid;

        // Check if user data is available in localStorage
        const cachedRole = localStorage.getItem("userRole");
        if (cachedRole) {
            handleUserRole(cachedRole);
        } else {
            // If role not cached, fetch user data from the database
            const databaseRef = ref(database, `users/${userId}`);
            get(databaseRef)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        // Cache user role locally for quicker future access
                        localStorage.setItem("userRole", userData.role);
                        handleUserRole(userData.role);
                    } else {
                        alert("User data not found. Please contact support.");
                        window.location.href = "../Login/login.html"; // Redirect to login page if no user data
                    }
                })
                .catch((err) => {
                    console.error("Database error:", err.message);
                    alert(`Database error: ${err.message}`);
                });
        }

        // Hide login and show logout link
        document.getElementById('loginLink').style.display = 'none';
        document.getElementById('logoutLink').style.display = 'block';

    } else {
        // If user is not authenticated, show login link and hide logout link
        document.getElementById('loginLink').style.display = 'block';
        document.getElementById('logoutLink').style.display = 'none';
        document.getElementById('userDashboard').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'none';
    }
});

// Handle user roles and dashboard visibility
function handleUserRole(role) {
    if (role === 'user') {
        document.getElementById('userDashboard').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
    } else if (role === 'admin') {
        document.getElementById('userDashboard').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
    } else {
        console.error("Unknown role:", role);
    }
}

// Logout function to clear session and role
function logout() {
    signOut(auth)
        .then(() => {
            localStorage.removeItem("userRole"); // Clear cached role on logout
            window.location.href = "../Login/login.html"; // Redirect to login page after logout
        })
        .catch((error) => {
            alert('Logout failed: ' + error.message); // Provide feedback if logout fails
        });
}





function loadCategories() {
    const popular = document.getElementById('populardiv');
    if (!popular) {
        console.error("Element with ID 'populardiv' not found.");
        return;
    }
    const categoryRef = ref(database, 'categories');
    get(categoryRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const categories = snapshot.val();
                if (categories && Object.keys(categories).length > 0) {
                    // Clear any previous content before adding new categories
                    popular.innerHTML = '';

                    // Loop through each category and create divs
                    Object.values(categories).forEach((category) => {
                        if (category.image && category.name) {
                            const newDiv = document.createElement('div');
                            newDiv.classList.add("newDiv");

                            // Create image element
                            const image = document.createElement('img');
                            image.src = category.image;
                            image.alt = category.name;
                            image.classList.add('imageCategory')

                            // Create text element for category name
                            const name = document.createElement('p');
                            name.textContent = category.name;

                            // Append image and name to the new div
                            newDiv.appendChild(image);
                            newDiv.appendChild(name);

                            // Append new div to the popular div
                            popular.appendChild(newDiv);
                        } else {
                            console.warn("Category data is incomplete:", category);
                        }
                    });
                } else {
                    popular.innerHTML = '<p>No categories available at the moment.</p>';
                    console.log('No categories found.');
                }
            } else {
                popular.innerHTML = '<p>No categories found in the database.</p>';
                console.log('Database snapshot is empty.');
            }
        })
        .catch((error) => {
            console.error("Failed to load categories:", error.message);
            alert("Failed to load categories. Please try again later.");
        });
}

function loadUserSports() {
    const discover = document.getElementById('discoverdiv');

    if (!discover) {
        console.error("Element with ID 'discoverdiv' not found.");
        return;
    }
    discover.innerHTML = '';
    const usersRef = ref(database, 'users');

    get(usersRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const users = snapshot.val();
                let hasSports = false;

                // users par iterate karo
                Object.values(users).forEach((user) => {
                    if (user.sports) {
                        hasSports = true;

                        const username = user.username || 'Unknown';

                        Object.values(user.sports).forEach((sportData) => {
                            const discoverNewDiv = document.createElement('div');
                            discoverNewDiv.classList.add('discoverNewDiv');

                            // Create and display sport details
                            const categoryRef = ref(database, `categories/${sportData.categoryId}`);
                            const cityRef = ref(database, `cities/${sportData.cityId}`);

                            Promise.all([get(categoryRef), get(cityRef)])
                                .then(([categorySnap, citySnap]) => {
                                    const categoryName = categorySnap.exists() ? categorySnap.val().name : "Unknown Category";
                                    const cityName = citySnap.exists() ? citySnap.val().name : "Unknown City";

                                    const sportName = document.createElement('p');
                                    sportName.textContent = `${categoryName}`;
                                    sportName.classList.add('sportName');

                                    // Add city icon
                                    const city = document.createElement('p');
                                    city.classList.add('city');
                                    const cityIcon = document.createElement('i');
                                    cityIcon.classList.add('fa', 'fa-building'); // City icon
                                    city.appendChild(cityIcon);
                                    city.textContent = ` ${cityName}`; // Add space before the city name to prevent overlap with the icon

                                    // Add location icon
                                    const location = document.createElement('p');
                                    location.classList.add('location');
                                    const locationIcon = document.createElement('i');
                                    locationIcon.classList.add('fa', 'fa-map-marker'); // Location icon
                                    location.appendChild(locationIcon);
                                    location.textContent = ` ${sportData.location}`;

                                    // Date and Time with icons
                                    const dateTimeDiv = document.createElement('div');
                                    dateTimeDiv.classList.add('date-time');
                                    
                                    // Date icon
                                    const date = document.createElement('p');
                                    const dateIcon = document.createElement('i');
                                    dateIcon.classList.add('fa', 'fa-calendar'); // Calendar icon
                                    date.appendChild(dateIcon);
                                    date.textContent = ` ${sportData.date}`;
                                    
                                    // Time icon
                                    const time = document.createElement('p');
                                    const timeIcon = document.createElement('i');
                                    timeIcon.classList.add('fa', 'fa-clock-o'); // Clock icon
                                    time.appendChild(timeIcon);
                                    time.textContent = ` ${sportData.time}`;
                                    
                                    // Append date and time to the container
                                    dateTimeDiv.appendChild(date);
                                    dateTimeDiv.appendChild(time);

                                    // Added by user
                                    const addedBy = document.createElement('p');
                                    addedBy.textContent = `Added by: ${username}`;
                                    addedBy.classList.add('addedBy');

                                    // Append everything to the discoverNewDiv
                                    discoverNewDiv.appendChild(sportName);
                                    discoverNewDiv.appendChild(city);
                                    discoverNewDiv.appendChild(location);
                                    discoverNewDiv.appendChild(dateTimeDiv);
                                    discoverNewDiv.appendChild(addedBy);
                                    discover.appendChild(discoverNewDiv);
                                })
                                .catch((error) => {
                                    console.error("Error fetching category or city data", error);
                                });
                        });
                    }
                });

                // If no sports are found
                if (!hasSports) {
                    const noDataMessage = document.createElement('p');
                    noDataMessage.textContent = "No sports available.";
                    discover.appendChild(noDataMessage);
                }
            } else {
                console.log("No user data found.");
                const noDataMessage = document.createElement('p');
                noDataMessage.textContent = "No sports available.";
                discover.appendChild(noDataMessage);
            }
        })
        .catch((error) => {
            console.error("Failed to load data:", error.message);
            alert("Failed to load data. Please try again later.");
        });
}




document.addEventListener("DOMContentLoaded", function() {
    loadUserSports();
    loadCategories();
});
window.logout = logout;
