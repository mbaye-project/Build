const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const base_url = "https://dev-api.inoxarabia.com";
let username;
let room;
let dict = []; // Create an empty array

let _userId;
let _roomId;
const ws = io("wss://dev-api.inoxarabia.com", {
  transports: ["websocket"], // Make sure to use WebSocket transport
});
function SetUserId(userId) {
  console.log(userId + " userId");
  // Your existing code for joining a room
  var item = {
    userId: userId,
  };
  _userId = userId;
  console.log(item);
  ws.emit("loginStatus", item);
}
async function SetDataChat(_username, _room) {
  username = _username;
  room = _room;

  _userId = username;
  _roomId = room;
  chatMsgParent.innerHTML = "";
  await GetGroupChat(_roomId);
  GetChat();
  joinRoom(_userId, _roomId);
}
// Event handler for connection success
ws.on("connect", async () => {
  console.log("Socket.IO connected:", ws.id);
});
async function GetGroupChat(_roomId) {
  try {
    const response = await fetch(
      `${base_url}/api/video-chat/participants/${_roomId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const result = await response.json();
    console.log("Group chat retrieved:", result);

    for (i = 0; i < result.participants.length; i++) {
      await GetDPs(result.participants[i].userId);
    }
  } catch (error) {
    console.error("Error retrieving user profile picture:", error);
  }
}

async function GetDPs(_userId) {
  console.log(dict);

  // Check if the user profile picture is already in the dictionary
  if (dict[_userId]) {
    console.log("present");
    console.log(dict[_userId]);
    return dict[_userId];
  }

  try {
    const response = await fetch(
      `${base_url}/api/users/get-profile/${_userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const result = await response.json();
    console.log("Data retrieved:", result);

    // Update the dictionary with the user profile picture
    dict[_userId] = result.user.profilePicture;
    console.log(result.user.profilePicture);

    return result.user.profilePicture;
  } catch (error) {
    console.error("Error retrieving user profile picture:", error);
  }
}

async function GetChat() {
  try {
    const response = await fetch(
      `${base_url}/api/video-chat/message-history/${_roomId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const result = await response.json();
    console.log("Chat retrieved:", result);

    for (var i = 0; i < result.History.length; i++) {
      const userProfilePicture = await GetDPs(result.History[i].senderId);
      if (result.History[i].image) {
        outputImage(result.History[i], userProfilePicture);
      } else {
        console.log(result.History[i].senderId);
        outputMessage(result.History[i], userProfilePicture);
      }
    }

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (error) {
    console.error("Error retrieving chat:", error);
  }
}

// Event handler for handling errors
ws.on("error", (error) => {
  console.error("Socket.IO error:", error);
});

// Event handler for when the connection is closed
ws.on("disconnect", () => {
  console.log("Socket.IO disconnected");
});

function joinRoom(userId, roomId) {
  // Your existing code for joining a room
  var item = {
    userId: [userId],
    roomId: roomId,
  };
  _userId = userId;
  _roomId = roomId;
  console.log(JSON.stringify(item));
  ws.emit("joinRoom", item);
}
ws.on("joinSuccess", (item) => {
  console.log(item);
});
function Message(message, image) {
  // {
  //   "senderId": "656eb180edeb44bbfd5d9b74", // ObjectId of the sender user
  //   "roomId": "3rdroom",
  //   "message": "hello i am good" // The message content
  //   "image": "base64 image string"
  // }

  if (image == "") {
    var item = {
      senderId: _userId,
      roomId: _roomId,
      message: message,
    };
  } else if (message == "") {
    var item = {
      senderId: _userId,
      roomId: _roomId,
      image,
    };
  }
  console.log(JSON.stringify(item));
  ws.emit("message", item);
}

function Upload(element) {
  let file = element.files[0];
  let reader = new FileReader();
  reader.onloadend = function () {
    const base64 = reader.result;
    const message = "";
    Message(message, base64);
  };
  reader.readAsDataURL(file);
}
// Message from server
ws.on("message-sent", async (message) => {
  console.log("received message");
  console.log(message);

  const userProfilePicture = await GetDPs(message.senderId);
  if (message.image) outputImage(message, userProfilePicture);
  else {
    outputMessage(message, userProfilePicture);
  } // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

function Text(message) {
  const base64 = "";
  // Emit message to server
  Message(message, base64);
}
var chatMsgParent = document.querySelector(".chat-messages");

// Output message to DOM
function outputMessage(message, DP) {
  if (message.message == "") return;
  const parent = document.createElement("div");
  const div = document.createElement("div");
  div.classList.add("message");
  const imgDiv = document.createElement("div");
  const img = document.createElement("img");
  img.src = "css/bubble.png";

  img.style.width = "40px";
  img.style.height = "40px";
  const dp = document.createElement("img");
  dp.style.borderRadius = "70%";
  console.log(DP);
  dp.src = DP;
  dp.style.width = "30px";
  dp.style.height = "30px";
  img.style.width = "40px";
  img.style.height = "40px";
  imgDiv.style.width = "40px";
  imgDiv.style.height = "40px";

  if (message.senderId == _userId) {
    imgDiv.style.marginLeft = "auto";
    imgDiv.style.marginRight = "-44px";
    imgDiv.style.marginBottom = "-35px";
    dp.style.transform = "translate(5px,-38px)";

    div.style.marginLeft = "auto";
    div.style.marginRight = "0px";
  } else {
    dp.style.marginRight = "5px";
    dp.style.transform = "translate(5px,-38px)";

    imgDiv.style.marginLeft = "-44px";
    imgDiv.style.marginRight = "auto";
    imgDiv.style.marginBottom = "-35px";

    div.style.marginLeft = "0px";
    div.style.marginRight = "auto";
  }
  const para = document.createElement("p");
  para.classList.add("text");
  para.innerText = message.message;

  div.appendChild(para);
  parent.style.display = "grid";
  imgDiv.appendChild(img);
  imgDiv.appendChild(dp);
  parent.appendChild(imgDiv);
  parent.appendChild(div);
  chatMsgParent.appendChild(parent);
}
function outputImage(message, DP) {
  if (message.image == undefined || message.image == "") return;
  console.log("image", message);

  const parent = document.createElement("div");
  const div = document.createElement("div");
  div.classList.add("message");
  div.style.transform = "skew(0deg)";
  const imgDiv = document.createElement("div");
  const img = document.createElement("img");
  img.src = "css/bubble.png";

  img.style.width = "40px";
  img.style.height = "40px";
  const dp = document.createElement("img");
  dp.style.borderRadius = "70%";
  console.log(DP);
  dp.src = DP;
  dp.style.width = "30px";
  dp.style.height = "30px";
  img.style.width = "40px";
  img.style.height = "40px";
  imgDiv.style.width = "40px";
  imgDiv.style.height = "40px";

  if (message.senderId == _userId) {
    imgDiv.style.marginLeft = "auto";
    imgDiv.style.marginRight = "-44px";
    imgDiv.style.marginBottom = "-35px";
    dp.style.transform = "translate(5px,-38px)";
    div.style.marginLeft = "auto";
    div.style.marginRight = "0px";
  } else {
    dp.style.marginRight = "5px";
    dp.style.transform = "translate(5px,-38px)";

    imgDiv.style.marginLeft = "-44px";
    imgDiv.style.marginRight = "auto";
    imgDiv.style.marginBottom = "-35px";
    div.style.marginLeft = "0px";
    div.style.marginRight = "auto";
  }
  const para = document.createElement("img");
  para.src = message.image;
  para.style.width = "20vw";
  para.style.height = "50%";
  div.appendChild(para);

  parent.style.display = "grid";
  imgDiv.appendChild(img);
  imgDiv.appendChild(dp);
  parent.appendChild(imgDiv);
  parent.appendChild(div);
  chatMsgParent.appendChild(parent);
}
