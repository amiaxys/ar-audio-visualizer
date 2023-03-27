(function () {
  "use strict";

  // Get the current URL parameters
  let urlParams = new URLSearchParams(window.location.search);

  // Get the visualization ID from the URL parameters
  let visualizationId = urlParams.get("id");

  // Get the audio element and set the source to the audio file
  let audioDiv = document.getElementById("audio-container");
  audioDiv.innerHTML = `<audio id="audio" controls autoplay><source src="${environment.BACKEND_URL}/api/visualizations/${visualizationId}/audio" type="audio/mpeg"></audio>`;

  let audioElmt = document.getElementById("audio");
})();
