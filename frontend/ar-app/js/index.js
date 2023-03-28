(function () {
  "use strict";

  // Get the current URL parameters
  let urlParams = new URLSearchParams(window.location.search);

  // Get the visualization ID from the URL parameters
  let visualizationId = urlParams.get("id");

  // Get the audio element and set the source to the audio file
  let audioDiv = document.getElementById("audio-container");
  audioDiv.innerHTML = `<audio id="audio" controls autoplay><source src="${environment.BACKEND_URL}/api/visualizations/${visualizationId}/audio" type="audio/mpeg"></audio>`;

  // register A-Frame components
  if (!AFRAME.components["time-entity"]) {
    AFRAME.registerComponent("time-entity", {
      init: function () {},
      tick: function () {
        // I'm not actually sure if this smooths the movement
        this.el.object3D.position.lerp(this.el.object3D.position, 0.1);
      },
    });
  }

  let audioElmt = document.getElementById("audio");
  audioElmt.crossOrigin = "anonymous";
  let visualization = null;
  let freqEntities = [];
  let timeEntities = [];
  let displayPlayBtn = true;
  let audioSource = `${environment.BACKEND_URL}/api/visualizations/${visualizationId}/audio`;
  let audioCtx = null;

  let freqAnalyser = null;
  let freqBufferLength = 0;
  let freqDataArray = new Uint8Array(0);

  let timeAnalyser = null;
  let timeBufferLength = 0;
  let timeDataArray = new Uint8Array(0);

  let hueRegex = /(?<=hsl\()\d+(?=,)/g;
  let planeColor = "hsl(0, 0%, 0%)";
  let start = false;

  function initializeFreqEntities() {
    let metaFreqTypes = [""];
    if (visualization?.metadata?.options) {
      metaFreqTypes = visualization.metadata?.options?.freqEntities;
    }
    const freqTypes = ["cylinder", "box", "sphere"];
    for (let i = 0; i < Math.min(3, metaFreqTypes.length); i++) {
      if (
        metaFreqTypes[i] === "cylinder" ||
        metaFreqTypes[i] === "box" ||
        metaFreqTypes[i] === "sphere"
      ) {
        freqTypes[i] = metaFreqTypes[i];
      }
    }

    let nextX = -4;
    const freqEntNum = 5;
    for (let i = 0; i < freqEntNum; i++) {
      const col = `hsl(${i * (360 / freqEntNum)}, 100%, 53%)`;
      const z = -4 + i * 0.5;
      switch (i % 3) {
        case 0:
          metaFreqTypes[0];
          freqEntities[i] = {
            type: `a-${freqTypes[0]}`,
            position: `${nextX} 0.75 ${z}`,
            radius: "0.5",
            height: "1",
            color: col,
          };
          break;
        case 1:
          freqEntities[i] = {
            type: `a-${freqTypes[1]}`,
            position: `${nextX} 0.75 ${z}`,
            rotation: "0 45 0",
            width: "1",
            height: "1.25",
            color: col,
          };
          break;
        case 2:
          freqEntities[i] = {
            type: `a-${freqTypes[2]}`,
            position: `${nextX} 1 ${z}`,
            radius: "1",
            color: col,
          };
          break;
      }
      nextX += 1 + (freqEntNum - i) * 0.1;
    }
  }

  function initializeTimeEntities() {
    let metaTimeTypes = [""];
    if (visualization?.metadata?.options) {
      metaTimeTypes = visualization.metadata?.options?.timeEntities;
    }
    const width = 18;
    const height = 4;
    const timeSlice = Math.floor(timeBufferLength / 20);
    const sliceWidth = width / timeSlice;
    let x = -3.5;
    for (let i = 0; i < timeSlice; i++) {
      const v = timeDataArray[i * timeSlice] / 128.0;
      const y = v * (height / 2) + 1;

      let timeType = "a-sphere";
      if (metaTimeTypes[0] === "cylinder" || metaTimeTypes[0] === "box") {
        timeType = "a-" + metaTimeTypes[0];
      }

      timeEntities[i] = {
        type: timeType,
        position: `${x} ${y} -4`,
        radius: `${sliceWidth * 0.4}`,
        width: `${sliceWidth * 0.4 * 2}`,
        height: `${sliceWidth * 0.4 * 2}`,
        color: `hsl(${i % 360}, 100%, ${Math.min(30 + i * 2, 100)}%)`,
      };

      x += sliceWidth;
    }
  }

  function renderEntities(freqEntities, timeEntities) {
    let freqEntitiesElmt;
    for (let i = 0; i < freqEntities.length; i++) {
      freqEntitiesElmt = document.createElement(freqEntities[i].type);
      freqEntitiesElmt.setAttribute("position", freqEntities[i].position);
      freqEntitiesElmt.setAttribute("radius", freqEntities[i].radius);
      freqEntitiesElmt.setAttribute("height", freqEntities[i].height);
      freqEntitiesElmt.setAttribute("width", freqEntities[i].width);
      freqEntitiesElmt.setAttribute("color", freqEntities[i].color);
      freqEntitiesElmt.setAttribute("class", "freq-entity");
      document.getElementById("scene").appendChild(freqEntitiesElmt);
    }
    let timeEntitiesElmt;
    for (let i = 0; i < timeEntities.length; i++) {
      timeEntitiesElmt = document.createElement(timeEntities[i].type);
      timeEntitiesElmt.setAttribute("position", timeEntities[i].position);
      timeEntitiesElmt.setAttribute("radius", timeEntities[i].radius);
      timeEntitiesElmt.setAttribute("height", timeEntities[i].height);
      timeEntitiesElmt.setAttribute("width", timeEntities[i].width);
      timeEntitiesElmt.setAttribute("color", timeEntities[i].color);
      timeEntitiesElmt.setAttribute("rotation", timeEntities[i].rotation);
      timeEntitiesElmt.setAttribute("class", "time-entity");
      document.getElementById("scene").appendChild(timeEntitiesElmt);
    }
    // add a plane to cover the background
    let planceColorElmt = document.createElement("a-plane");
    planceColorElmt.setAttribute("position", "0 0 -4");
    planceColorElmt.setAttribute("rotation", "-90 0 0");
    planceColorElmt.setAttribute("width", "4");
    planceColorElmt.setAttribute("height", "4");
    document.getElementById("scene").appendChild(planceColorElmt);
    // add sky color to plane
    let skyElmt = document.getElementById("sky");
    skyElmt.setAttribute("color", "#000");
    document.getElementById("scene").appendChild(skyElmt);
  }

  function removeEntities() {
    const freqEntitiesElmt = document.getElementsByClassName("freq-entity");
    while (freqEntitiesElmt[0]) {
      freqEntitiesElmt[0].parentNode.removeChild(freqEntitiesElmt[0]);
    }
    const timeEntitiesElmt = document.getElementsByClassName("time-entity");
    while (timeEntitiesElmt[0]) {
      timeEntitiesElmt[0].parentNode.removeChild(timeEntitiesElmt[0]);
    }
  }


  function draw() {
    window.requestAnimationFrame(draw);
    // pause animation when audio is paused
    displayPlayBtn = audioElmt.paused;
    if (audioElmt.paused) return;

    freqAnalyser.getByteFrequencyData(freqDataArray);
    timeAnalyser.getByteTimeDomainData(timeDataArray);

    if (timeEntities.length === 0 || freqEntities.length === 0) {
      initializeTimeEntities();
      initializeFreqEntities();
    }

    // change frequency entities
    const frac = Math.floor(freqDataArray.length / freqEntities.length);

    let freqAvg;
    for (let i = 0; i < freqEntities.length; i++) {
      // change frequency entity size (height/radius)
      freqAvg =
        freqDataArray.slice(i * frac, (i + 1) * frac).reduce((a, b) => a + b) /
        frac;
      if (freqEntities[i].type === "a-sphere") {
        freqEntities[i].radius = `${(freqAvg / 255) * 1.5}`;
      } else {
        freqEntities[i].height = `${(freqAvg / 255) * 2}`;
      }

      // change frequency entity color
      let freqHue = freqEntities[i].color.match(hueRegex)[0];
      freqEntities[i].color = `hsl(${freqHue}, ${Math.floor(
        30 + (freqAvg / 255) * 50
      )}%, 50%)`;

      // uncomment the block below for rainbow entities
      /* freqEntities[i].color = `hsl(${Math.ceil((freqAvg / 255) * 360)}, 100%, ${Math.floor(
        30 + (freqAvg / 255) * 70
      )}%)`; */
    }

    // change plane color
    /* const r = Math.floor(
      (freqDataArray[freqDataArray.length / 2] / 255.0) * 150
    );
    const g = Math.floor(
      (freqDataArray[freqDataArray.length / 2 - 1] / 255.0) * 150
    );
    const b = Math.floor((freqDataArray[0] / 255.0) * 150); */
    const planeLight = Math.floor(
      (freqDataArray[freqDataArray.length / 2] / 255.0) * 100
    );
    planeColor = `hsl(0, 0%, ${planeLight}%)`;

    // change time spheres (wave)
    const height = 4;
    // when maxDiff is too big, wave animation gets too jitty
    // best is actually 0.01, but not enough change
    const maxDiff = 0.05;
    let y =
      (timeDataArray[timeDataArray.length / 2] / 128.0) * (height / 2) + 1;
    let tempPos;
    for (let i = 0; i < timeEntities.length; i++) {
      // change y position of time entity
      let tempy = y;
      tempPos = timeEntities[i].position.split(" ");
      const tempPosY = parseFloat(tempPos[1]);

      if (y > tempPosY) {
        tempy = y - tempPosY;
        y = tempPosY;
        tempPos[1] = tempPosY + Math.min(tempy, maxDiff) + "";
      } else if (y < tempPosY) {
        tempy = tempPosY - y;
        y = tempPosY;
        tempPos[1] = tempPosY - Math.min(tempy, maxDiff) + "";
      } else {
        y = tempPosY;
      }
      timeEntities[i].position = tempPos.join(" ");

      // change colour of time entity
      let timeHue;
      if (i === 0) {
        timeHue = parseInt(timeEntities[i].color.match(hueRegex)[0], 10) + 1;
      } else {
        timeHue = parseInt(timeEntities[i - 1].color.match(hueRegex)[0], 10);
      }
      timeEntities[i].color = `hsl(${timeHue % 360}, 100%, ${Math.min(
        30 + i * 2,
        100
      )}%)`;
    }
    // remove previously rendered entities
    removeEntities();
    // render entities
    renderEntities(freqEntities, timeEntities);
  }

  function startVisualization() {
    if (!start) {
      audioCtx = new AudioContext();
      freqAnalyser = audioCtx.createAnalyser();
      timeAnalyser = audioCtx.createAnalyser();

      const distortion = audioCtx.createWaveShaper();
      const source = audioCtx.createMediaElementSource(audioElmt);

      source.connect(freqAnalyser);
      source.connect(timeAnalyser);
      freqAnalyser.connect(distortion);
      timeAnalyser.connect(distortion);
      distortion.connect(audioCtx.destination);

      start = true;
    }

    freqAnalyser.fftSize = 256;
    freqBufferLength = freqAnalyser.frequencyBinCount;
    freqDataArray = new Uint8Array(freqBufferLength);

    timeAnalyser.fftSize = 2048;
    timeBufferLength = timeAnalyser.frequencyBinCount;
    timeDataArray = new Uint8Array(timeBufferLength);

    draw();
    audioElmt.paused ? audioElmt.play() : audioElmt.pause();
    displayPlayBtn = audioElmt.paused;
  }

  let playButton = document.getElementById("play-button");
  playButton.addEventListener("click", startVisualization);
})();
