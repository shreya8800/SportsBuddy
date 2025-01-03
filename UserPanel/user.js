import { auth, database } from "../firebase-config.js";
import { ref, set, push, get, update, remove } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import { onAuthStateChanged,} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

//form
function showAddSportForm() {
    const form = document.getElementById('addSportForm');
    form.style.display = 'block';
    const citySelect = document.getElementById('citySelect');
    const sportCategorySelect = document.getElementById('sportCategorySelect');
    const cityRef=ref(database,"cities");
    const categoriesRef=ref(database,"categories");

    // Clearing existing options
    citySelect.innerHTML = '<option value="">Select City</option>';
    sportCategorySelect.innerHTML = '<option value="">Select Sport Category</option>';

    //fetching cities
    get(cityRef)
    .then((snapshot)=>{
        if(snapshot.exists()){
            const cities=snapshot.val();
            Object.values(cities).forEach((city)=>{
                const option=document.createElement('option');
                option.value=city.id;
                option.textContent=city.name;
                citySelect.appendChild(option);
            })
        }
        else{
            alert("No city found")
        }
    })
    .catch((error) => {
        console.error("Error fetching cities: ", error);
    });

    //fetching categories added by admin
    get(categoriesRef)
    .then((snapshot)=>{
      if(snapshot.exists())
      {
        const categories=snapshot.val();
        Object.values(categories).forEach((category)=>{
          const option=document.createElement('option');
          option.value=category.id;
          option.textContent=category.name;
          sportCategorySelect.appendChild(option);
        });

      }
      else{
        alert("No sport category found");
      }
    })
    .catch((error)=>{
      console.error("Error fetching sports:",error);
    })
}

//canceling sport in form
function cancelAddSport() {
    const form = document.getElementById('addSportForm');
    document.getElementById('sportCategorySelect').value="";
    document.getElementById('citySelect').value="";
    document.getElementById('location').value="";
    document.getElementById('sportTime').value="";
    document.getElementById('sportDate').value="";

    form.style.display = 'none';
}

//add a new sport
function addSport() {
  const sportCategory = document.getElementById('sportCategorySelect').value;
  const city = document.getElementById('citySelect').value;
  const location = document.getElementById('location').value.trim();
  const sportTime = document.getElementById('sportTime').value.trim();
  const sportDate = document.getElementById('sportDate').value.trim();

  if (!sportCategory || !city || !location || !sportTime || !sportDate) {
      alert("Please fill in all the fields.");
      return;
  }

  const user = auth.currentUser;
  if (!user) {
      alert("User is not authenticated.");
      return;
  }

  const sportsRef = ref(database, `users/${user.uid}/sports`);
  const newSportRef = push(sportsRef);

  const sportData = {
      categoryId: sportCategory,
      cityId: city,
      location: location,
      time: sportTime,
      date: sportDate
  };

  set(newSportRef, sportData).then(() => {
      alert("Sport added successfully!");
      displaySport(sportData, newSportRef.key);
      cancelAddSport();
  }).catch((error) => console.error("Error adding sport:", error));
}

// Function to display a sport in the table
function displaySport(sportData, sportId) {
  const user = auth.currentUser;
  if (!user) {
      console.error("No user is logged in.");
      return;
  }

  // Display username
  const userRef = ref(database, `users/${user.uid}`);
  get(userRef)
      .then((snapshot) => {
          if (snapshot.exists()) {
              const userData = snapshot.val();
              const userName = userData.username;

              // Update the dashboard with the user's name
              const userNameDisplay = document.getElementById('dashboardName');
              userNameDisplay.textContent = `Welcome ${userName}`;
          } else {
              console.error("User data not found.");
          }
      })
      .catch((error) => {
          console.error("Error fetching user data:", error);
      });


  const categoryRef = ref(database, `categories/${sportData.categoryId}`);
  const cityRef = ref(database, `cities/${sportData.cityId}`);

  Promise.all([get(categoryRef), get(cityRef)]).then(([categorySnapshot, citySnapshot]) => {
      const categoryName = categorySnapshot.exists() ? categorySnapshot.val().name : "Unknown Category";
      const cityName = citySnapshot.exists() ? citySnapshot.val().name : "Unknown City";

      const tableBody = document.querySelector('table tbody');
      const newRow = document.createElement('tr');
      newRow.setAttribute('data-id', sportId);

      newRow.innerHTML = `
          <td>${categoryName}</td>
          <td>${cityName}</td>
          <td>${sportData.location}</td>
          <td>${sportData.date}</td>
          <td>${sportData.time}</td>
          <td>
              <button class="btn" onclick="editSport('${sportId}')">Edit</button>
              <button class="btn" onclick="deleteSport('${sportId}')">Delete</button>
          </td>
      `;

      tableBody.appendChild(newRow);
  }).catch((error) => console.error("Error resolving category or city:", error));
}


// Function to load all sports for the logged-in user
function loadSports() {
    const user = auth.currentUser;
    if (!user) {
        alert("User is not authenticated.");
        return;
    }

    const sportsRef = ref(database, `users/${user.uid}/sports`);
    get(sportsRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const sports = snapshot.val();
                Object.entries(sports).forEach(([sportId, sportData]) => {
                    displaySport(sportData, sportId);
                });
            } else {
                console.log("No sports found.");
            }
        })
        .catch((error) => {
            console.error("Error fetching sports:", error);
        });
}

// Function to edit a sport
function editSport(sportId) {
    const user = auth.currentUser;
    if (!user) {
        alert("User is not authenticated.");
        return;
    }

    const sportRef = ref(database, `users/${user.uid}/sports/${sportId}`);
    get(sportRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const sportData = snapshot.val();
                document.getElementById('sportCategorySelect').value = sportData.categoryId;
                document.getElementById('citySelect').value = sportData.cityId;
                document.getElementById('location').value = sportData.location;
                document.getElementById('sportTime').value = sportData.time;
                document.getElementById('sportDate').value=sportData.date;

                showAddSportForm();
                const saveButton = document.querySelector('button[onclick="addSport()"]');
                saveButton.onclick = function () {
                    updateSport(sportId);
                };
            } else {
                alert("Sport not found.");
            }
        })
        .catch((error) => {
            console.error("Error fetching sport:", error);
        });
}

// Function to update a sport
function updateSport(sportId) {
    const sportCategory = document.getElementById('sportCategorySelect').value;
    const city = document.getElementById('citySelect').value;
    const location = document.getElementById('location').value.trim();
    const sportTime = document.getElementById('sportTime').value.trim();
    const sportDate=document.getElementById('sportDate').value.trim();

    if (!sportCategory || !city|| !location || !sportTime || !sportDate) {
        alert("Please fill in all the fields.");
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        alert("User is not authenticated.");
        return;
    }

    const sportRef = ref(database, `users/${user.uid}/sports/${sportId}`);
    const updatedSportData = {
        categoryId: sportCategory,
        cityId: city,
        location: location,
        time: sportTime,
        date:sportDate
    };

    update(sportRef, updatedSportData)
    .then(() => {
        alert("Sport updated successfully!");

        // Fetch category name and city name
        const categoryRef = ref(database, `categories/${sportCategory}`);
        const cityRef = ref(database, `cities/${city}`);

        Promise.all([get(categoryRef), get(cityRef)]).then(([categorySnapshot, citySnapshot]) => {
            const categoryName = categorySnapshot.exists() ? categorySnapshot.val().name : "Unknown Category";
            const cityName = citySnapshot.exists() ? citySnapshot.val().name : "Unknown City";

            // Update the table with the category and city names
            const row = document.querySelector(`tr[data-id="${sportId}"]`);
            row.cells[0].textContent = categoryName;
            row.cells[1].textContent = cityName;
            row.cells[2].textContent = location;
            row.cells[3].textContent = sportDate;
            row.cells[4].textContent = sportTime;

            cancelAddSport();
        }).catch((error) => {
            console.error("Error fetching category or city names:", error);
        });
    })
    .catch((error) => {
        console.error("Error updating sport:", error);
    });
}

// Function to delete a sport
function deleteSport(sportId) {
    const user = auth.currentUser;
    if (!user) {
        alert("User is not authenticated.");
        return;
    }

    const sportRef = ref(database, `users/${user.uid}/sports/${sportId}`);
    remove(sportRef)
        .then(() => {
            alert("Sport deleted successfully!");
            const row = document.querySelector(`tr[data-id="${sportId}"]`);
            row.remove();
        })
        .catch((error) => {
            console.error("Error deleting sport:", error);
        });
}




function sendMessage() {
    const messageInput = document.getElementById('messageContent').value.trim();
    const recipientUsername = document.getElementById('recipientUsername').value.trim();
    const sender = auth.currentUser;

    if (!sender) {
        alert("You must be logged in to send a message.");
        return;
    }
    if (!messageInput) {
        alert("Message content cannot be empty.");
        return;
    }

    // Get recipientId using the recipient's username
    getUserIdByUsername(recipientUsername)
        .then((recipientId) => {
            const senderRef = ref(database, `messages/${sender.uid}/${recipientId}`);
            const recipientRef = ref(database, `messages/${recipientId}/${sender.uid}`);

            const newMsgRefSender = push(senderRef);
            const newMsgRefRecipient = push(recipientRef);

            const messageData = {
                senderId: sender.uid,
                recipientId: recipientId,
                msg: messageInput, 
                timestamp: new Date().toISOString()
            };

            console.log("Sending Message Data: ", messageData);

            // Store the message in both the sender's and recipient's nodes
            return Promise.all([
                set(newMsgRefSender, messageData),
                set(newMsgRefRecipient, messageData)
            ]);
        })
        .then(() => {
            alert("Message sent successfully!");
            document.getElementById('messageContent').value = ''; 
            document.getElementById('recipientUsername').value = '';
        })
        .catch((error) => {
            console.error("Error sending message:", error.message);
            alert(error.message);
        });
}

function getUserIdByUsername(username) {
    const dbRef = ref(database, 'users');  // Reference to the users node
    return get(dbRef).then((snapshot) => {
      if (snapshot.exists()) {
        const users = snapshot.val();
        for (const userId in users) {
          if (users[userId].username === username) {
            return userId;  // Return the userId if username matches
          }
        }
        throw new Error('Username not found');
      } else {
        throw new Error('No users data available');
      }
    });
  }

  function getUsername(userId) {
    return new Promise((resolve, reject) => {
      const userRef = ref(database, `users/${userId}`);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.val().username); 
          } else {
            reject('User not found.');
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  function loadMessage() {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to view messages.");
      return;
    }
  
    const messageList = document.getElementById('messageList');
    messageList.innerHTML = ''; 
  
    const msgRefSender = ref(database, `messages/${user.uid}`);
    const msgRefRecipient = ref(database, `messages/${user.uid}`);
  
    Promise.all([get(msgRefSender), get(msgRefRecipient)])
      .then(([senderSnapshot, recipientSnapshot]) => {
        if (senderSnapshot.exists() || recipientSnapshot.exists()) {
          const allMessages = {};
          if (senderSnapshot.exists()) {
            Object.entries(senderSnapshot.val()).forEach(([recipientId, messages]) => {
              Object.values(messages).forEach((message) => {
                allMessages[message.timestamp] = message; 
              });
            });
          }
          if (recipientSnapshot.exists()) {
            Object.entries(recipientSnapshot.val()).forEach(([senderId, messages]) => {
              Object.values(messages).forEach((message) => {
                allMessages[message.timestamp] = message; 
              });
            });
          }
  
          const sortedMessages = Object.values(allMessages).sort((a, b) => a.timestamp - b.timestamp);
  
          sortedMessages.forEach((message) => {
            const messageItem = document.createElement('li');
            messageItem.classList.add('message'); 
            let senderText = "You";
            let recipientText = "Recipient";
  
            if (message.senderId === user.uid) { 
                messageItem.classList.add('sent');
              recipientText = message.recipientId; 
            } else {
                messageItem.classList.add('received');
            }
  
            getUsername(message.senderId)
              .then((senderUsername) => {
                getUsername(message.recipientId)
                  .then((recipientUsername) => {
                    messageItem.textContent = `${senderUsername} to ${recipientUsername}: ${message.msg}`;
                    messageList.appendChild(messageItem);
                  })
                  .catch((error) => {
                    console.error("Error fetching recipient username:", error);
                    // Handle error, e.g., display a generic recipient name
                    messageItem.textContent = `${senderText} to You: ${message.msg}`; 
                    messageList.appendChild(messageItem); 
                  });
              })
              .catch((error) => {
                console.error("Error fetching sender username:", error);
                // Handle error, e.g., display a generic sender name
                messageItem.textContent = `You to ${recipientText}: ${message.msg}`; 
                messageList.appendChild(messageItem); 
              });
          });
        } else {
          console.log("No messages found.");
        }
      })
      .catch((error) => {
        console.error("Error loading messages:", error.message);
        alert("Failed to load messages. Please try again later.");
      });
  }
  
//abhi user jabhi authenticate hoga tabhi load hongi
onAuthStateChanged(auth, (user) => {
    if (user) {
        
        loadSports();
        loadMessage();
    } else {
        console.log("No user is signed in.");
    }
});


// Export functions to global scope for inline event handlers
window.showAddSportForm = showAddSportForm;
window.cancelAddSport = cancelAddSport;
window.addSport = addSport;
window.editSport = editSport;
window.updateSport = updateSport;
window.deleteSport = deleteSport;
document.getElementById('sendMessageButton').addEventListener('click', sendMessage);