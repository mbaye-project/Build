let participants = document.getElementById("participants");
let chat = document.getElementById("chat");
let isMute = "";
let isVideoHidden = "";
let hideVideo = document.getElementById("hideVideo");
let muteAudio = document.getElementById("muteAudio");
let endCall = document.getElementById("endCall");
let localID = "";
let current_room;
HideDiv();
var uploadImg=document.getElementById("uploadImg");
var chatFriends = document.getElementById("chatFriends");
function HideChat() {
  uploadImg.setAttribute("hidden", "true");
  chatFriends.setAttribute("hidden", "true");
}
async function SetDataChat(username, room) {
  uploadImg.removeAttribute("hidden");
  chatFriends.removeAttribute("hidden");
  console.log(username + " " + room);
  await chatFriends.contentWindow.SetDataChat(username, room);
}
function Upload() {
  
}
function Text(message) {
  chatFriends.contentWindow.Text(message);
}
function AudioAdvert(str) {
  if (str == "true")
    //mute
    SetAudioControl("true");
  //Unmute
  else {
    if (typeof room !== "undefined") UserCount(room.participants);
    else SetAudioControl("false");
  }
}

function Mute(participant) {
  // console.log(isMute);
  if (isMute == "true") {
    participant.audioTracks.forEach((audioTrack) => {
      audioTrack.track.disable();
    });
  } else {
    participant.audioTracks.forEach((audioTrack) => {
      audioTrack.track.enable();
    });
  }
}
function LocalID(id) {
  localID = id;
}
function HideVideo(participant) {
  // console.log(isVideoHidden);
  if (isVideoHidden == "true") {
    participant.videoTracks.forEach((videoTrack) => {
      videoTrack.track.disable();
    });
  } else {
    participant.videoTracks.forEach((videoTrack) => {
      videoTrack.track.enable();
    });
  }
}
function SetAudioControl(value) {
  isMute = value;
  muteAudio.click();
}
function SetVideoControl(value) {
  isVideoHidden = value;
  hideVideo.click();
}
function triggerExample1() {
  // get the container
  const element = document.querySelector("#id");
  // Create a fake `textarea` and set the contents to the text
  // you want to idValue
  const storage = document.createElement("textarea");
  storage.value = element.innerHTML;
  element.appendChild(storage);

  // idValue the text in the fake `textarea` and remove the `textarea`
  storage.select();
  storage.setSelectionRange(0, 99999);
  document.execCommand("idValue");
  element.removeChild(storage);
}
function SetMeetingID(id, token) {
  startVideoChat(id, token);
  chat.removeAttribute("hidden");
  participants.removeAttribute("hidden");
}
function HideDiv() {
  chat.setAttribute("hidden", "true");
  participants.setAttribute("hidden", "true");
}
function ShowDiv() {
  chat.removeAttribute("hidden");
  participants.removeAttribute("hidden");
}
function EndCall() {
  room = current_room;
  HideDiv();
  if (typeof room !== "undefined") {
    endCall.click();
  } else {
    RemoveUser();
  }
}
function ViewToggled() {
  HideDiv();
}
function CharacterToggled() {
  ShowDiv();
}
function Redirect(link) {
  // console.log("link: " + link);
  if (link == "") return;
  window.open(link, "blank").focus();
}
function UserCount(users) {}
function startVideoChat(room, token) {
  // Start video chat and listen to participant connected events
  Twilio.Video.connect(token, {
    room: room,
    audio: true,
    video: { width: 320, height: 180 },
  }).then((room) => {
    // Once we're connected to the room, add the local participant to the page
    participantConnected(room.localParticipant);
    current_room = room;
    if (typeof room !== "undefined") UserCount(room.participants);

    // Add any existing participants to the page.
    room.participants.forEach(participantConnected);
    // Listen for other participants to join and add them to the page when they
    // do.
    room.on("participantConnected", participantConnected);
    room.on("participantDisconnected", participantDisconnected);

    hideVideo.addEventListener("click", (e) => {
      HideVideo(room.localParticipant);
    });
    muteAudio.addEventListener("click", (e) => {
      Mute(room.localParticipant);
    });
    endCall.addEventListener("click", (e) => {
      RemoveUser();
    });
    // Eject the participant from the room if they reload or leave the page
    window.addEventListener("beforeunload", tidyUp(room));
    window.addEventListener("pagehide", tidyUp(room));
  });
}
function RemoveUser() {
  room = current_room;
  if (room) {
    // console.log("end");

    room.localParticipant.videoTracks.forEach((videoTrack) => {
      // videoTrack.track.disable();
      // videoTrack.track.stop();
      // videoTrack.track.unpublish();
      videoTrack.track.detach();
    });
    room.localParticipant.audioTracks.forEach((audioTrack) => {
      // audioTrack.track.disable();
      // audioTrack.track.stop();
      // audioTrack.track.unpublish();
      audioTrack.track.detach();
    });
    room.disconnect();
    var userDiv = document.getElementById(room.localParticipant.identity);
    if (userDiv) userDiv.remove();
  }
}
function participantConnected(participant) {
  if (typeof room !== "undefined") UserCount(room.participants);

  if (document.querySelectorAll(".bar").length == 4) return;
  muteAudio.click();
  hideVideo.click();

  if (document.getElementById(participant.identity) === null) {
    // Create new <div> for participant and add it to the page
    let el = document.createElement("div");
    el.setAttribute("id", participant.identity);
    el.setAttribute("class", "bar");
    participants.appendChild(el);

    let bubble = document.createElement("img");
    bubble.setAttribute("src", "bubble.png");
    bubble.setAttribute("class", "inner");
    let bg = document.createElement("img");
    bg.setAttribute("id", "vbackground");
    bg.setAttribute("src", "bg.png");
    el.appendChild(bubble);
    el.appendChild(bg);

    let barA = document.querySelectorAll(".bar")[0];
    let barB = document.querySelectorAll(".bar")[1];
    let barC = document.querySelectorAll(".bar")[2];
    let barD = document.querySelectorAll(".bar")[3];

    if (barA != null) {
      barA.style.transform = "scale(1.33,1.33)";
      barA.style.marginLeft = "6vw";
      barA.style.marginTop = "-2vh";
    }
    if (barB != null) {
      barB.style.transform = "scale(1.064,1.064)";
      barB.style.marginLeft = "70vw";
      barB.style.marginTop = "-5vh";
    }
    if (barC != null) {
      barC.style.transform = "scale(0.8512,0.8512)";
      barC.style.marginLeft = "21vw";
      barC.style.marginTop = "31vh";
    }
    if (barD != null) {
      barD.style.transform = "scale(0.816,0.816)";
      barD.style.marginLeft = "64vw";
      barD.style.marginTop = "32vh";
    }
  }
  // console.log(participant.identity);
  // Find all the participant's existing tracks and publish them to our page
  participant.tracks.forEach((trackPublication) => {
    trackPublished(trackPublication, participant);
  });
  // Listen for the participant publishing new tracks
  participant.on("trackPublished", trackPublished);
}

function trackPublished(trackPublication, participant) {
  // Get the participant's <div> we created earlier

  // Find out if the track has been subscribed to and add it to the page or
  // listen for the subscription, then add it to the page.

  // First create a function that adds the track to the page
  let trackSubscribed = (track) => {
    // track.attach() creates the media elements <video> and <audio> to
    // to display the track on the page.
    let el = document.getElementById(participant.identity);
    el.appendChild(track.attach());
    if (track.kind === "video") {
      if (el.querySelector("video").length === 0) {
        el.appendChild(track.attach());
      }
    }
    if (track.kind === "audio") {
      if (el.querySelector("audio").length === 0) {
        el.appendChild(track.attach());
      }
    }
  };
  // If the track is already subscribed, add it immediately to the page
  if (trackPublication.track) {
    trackSubscribed(trackPublication.track);
  }

  // Otherwise listen for the track to be subscribed to, then add it to the
  // page
  trackPublication.on("subscribed", trackSubscribed);
}

function participantDisconnected(participant) {
  let el = document.getElementById(participant.identity);
  if (el != null) el.remove();
  if (participant != null) participant.removeAllListeners();

  if (typeof room !== "undefined") UserCount(room.participants);
}

function trackUnpublished(trackPublication) {
  if (trackPublication.track != null) {
    // console.log(trackPublication.track);
    trackPublication.track.detach().forEach(function (mediaElement) {
      mediaElement.remove();
    });
  }
}

function tidyUp(room) {
  return function (event) {
    if (event.persisted) {
      return;
    }
    if (room) {
      room.disconnect();
      room = null;
    }
  };
}
