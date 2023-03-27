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

  let displayPlayBtn = true;
  const audioSource = `${environment.BACKEND_URL}/api/visualizations/${visualizationId}/audio`;
  const audioCtx = new AudioContext();
  // freq analyzer vars
  const freqAnalyser = audioCtx.createAnalyser();
  freqAnalyser.fftSize = 256;
  const freqBufferLength = freqAnalyser.frequencyBinCount;
  const freqDataArray = new Uint8Array(freqBufferLength);
  // time analuzer vars
  const timeAnalyser = audioCtx.createAnalyser();
  timeAnalyser.fftSize = 2048;
  const timeBufferLength = timeAnalyser.frequencyBinCount;
  const timeDataArray = new Uint8Array(timeBufferLength);
  let freqEntities = [];
  const hueRegex = /(?<=hsl\()\d+(?=,)/g;
  let timeSpheres = [];
  let start = false;
  function initializeFreqEntities() {
    let nextX = -4;
    const freqEntNum = 5;
    for (let i = 0; i < freqEntNum; i++) {
      const col = `hsl(${i * (360 / freqEntNum)}, 100%, 53%)`;
      const z = -4 + i * 0.5;
      switch (i % 3) {
        case 0:
          freqEntities[i] = {
            type: "a-cylinder",
            position: `${nextX} 0.75 ${z}`,
            radius: "0.5",
            height: "1",
            color: col,
          };
          break;
        case 1:
          freqEntities[i] = {
            type: "a-box",
            position: `${nextX} 0.75 ${z}`,
            rotation: "0 45 0",
            width: "1",
            height: "1.25",
            color: col,
          };
          break;
        case 2:
          freqEntities[i] = {
            type: "a-sphere",
            position: `${nextX} 1 ${z}`,
            radius: "1",
            color: col,
          };
          break;
      }
      nextX += 1 + (freqEntNum - i) * 0.1;
    }
  }

  function initializeTimeSpheres() {
    const width = 18;
    const height = 4;
    const timeSlice = Math.floor(timeBufferLength / 20);
    const sliceWidth = width / timeSlice;
    let x = -3.5;
    for (let i = 0; i < timeSlice; i++) {
      const v = timeDataArray[i * timeSlice] / 128.0;
      const y = v * (height / 2) + 1;

      timeSpheres[i] = {
        type: "a-sphere",
        position: `${x} ${y} -3`,
        radius: `${sliceWidth * 0.4}`,
        color: `hsl(${i % 360}, 100%, ${Math.min(30 + i * 2, 100)}%)`,
      };

      x += sliceWidth;
    }
  }

  function draw() {
    window.requestAnimationFrame(draw);
    // pause animation when audio is paused
    // may change this later
    displayPlayBtn = audioElmt.paused;
    if (audioElmt.paused) return;

    freqAnalyser.getByteFrequencyData(freqDataArray);
    timeAnalyser.getByteTimeDomainData(timeDataArray);

    if (timeSpheres.length === 0 || freqEntities.length === 0) {
      initializeTimeSpheres();
      AFRAME.registerComponent("freq-entity", {
        init: function () {
          //this.marker.nativeElement.appendChild(this.el);
        },
      });
      initializeFreqEntities();
      AFRAME.registerComponent("time-sphere", {
        init: function () {
          //this.marker.nativeElement.appendChild(this.el);
        },
        tick: function () {
          this.el.object3D.position.lerp(this.el.object3D.position, 0.1);
        },
      });
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

    // change sky color
    /* const r = Math.floor(
      (this.freqDataArray[this.freqDataArray.length / 2] / 255.0) * 150
    );
    const g = Math.floor(
      (this.freqDataArray[this.freqDataArray.length / 2 - 1] / 255.0) * 150
    );
    const b = Math.floor((this.freqDataArray[0] / 255.0) * 150); */
    const skyLight = Math.floor(
      (freqDataArray[freqDataArray.length / 2] / 255.0) * 100
    );

    // change time spheres (wave)
    const height = 4;
    // when maxDiff is too big, wave animation gets too jitty
    // best is actually 0.01, but not enough change
    const maxDiff = 0.08;
    let y =
      (timeDataArray[timeDataArray.length / 2] / 128.0) * (height / 2) + 1;
    let tempPos;
    for (let i = 0; i < timeSpheres.length; i++) {
      // change y position of time sphere
      let tempy = y;
      tempPos = timeSpheres[i].position.split(" ");
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
      timeSpheres[i].position = tempPos.join(" ");

      // change colour of time sphere
      let timeHue;
      if (i === 0) {
        timeHue = parseInt(timeSpheres[i].color.match(hueRegex)[0], 10) + 1;
      } else {
        timeHue = parseInt(timeSpheres[i - 1].color.match(hueRegex)[0], 10);
      }
      timeSpheres[i].color = `hsl(${timeHue % 360}, 100%, ${Math.min(
        30 + i * 2,
        100
      )}%)`;
    }

    // Get the visualization element and put animation in it
    let visualizationDiv = document.getElementById("visualization-container");
    let entitiesHTML = "";
    for (let entity of freqEntities) {
      switch (entity.type) {
        case "a-cylinder":
          entitiesHTML += `<a-cylinder freq-entity position="${entity.position}" radius="${entity.radius}" height="${entity.height}" color="${entity.color}"></a-cylinder>`;
          break;
        case "a-box":
          entitiesHTML += `<a-box freq-entity position="${entity.position}" rotation="${entity.rotation}" width="${entity.width}" height="${entity.height}" color="${entity.color}"></a-box>`;
          break;
        case "a-sphere":
          entitiesHTML += `<a-sphere freq-entity position="${entity.position}" radius="${entity.radius}" color="${entity.color}"></a-sphere>`;
          break;
      }
    }
    let timeSphereHTML = "";
    for (let sphere of timeSpheres) {
      timeSphereHTML += `<a-sphere time-sphere position="${sphere.position}" radius="${sphere.radius}" color="${sphere.color}"></a-sphere>`;
    }
    visualizationDiv.innerHTML = `<a-scene embedded arjs>
          ${entitiesHTML}
          ${timeSphereHTML}
        <a-marker-camera preset="hiro"></a-marker-camera>
      </a-scene>`;
  }

  function startVisualization() {
    if (!start) {
      // audioCtx = new AudioContext();
      // freqAnalyser = audioCtx.createAnalyser();
      // timeAnalyser = audioCtx.createAnalyser();

      const distortion = audioCtx.createWaveShaper();
      const source = audioCtx.createMediaElementSource(audioElmt);

      source.connect(freqAnalyser);
      source.connect(timeAnalyser);
      freqAnalyser.connect(distortion);
      timeAnalyser.connect(distortion);
      distortion.connect(audioCtx.destination);

      start = true;
    }

    // this.freqAnalyser.fftSize = 256;
    // this.freqBufferLength = this.freqAnalyser.frequencyBinCount;
    // this.freqDataArray = new Uint8Array(this.freqBufferLength);

    // this.timeAnalyser.fftSize = 2048;
    // this.timeBufferLength = this.timeAnalyser.frequencyBinCount;
    // this.timeDataArray = new Uint8Array(this.timeBufferLength);

    draw();
    //audioElmt.paused ? audioElmt.play() : audioElmt.pause();
    displayPlayBtn = audioElmt.paused;
  }

  // on click a-scene, start audio
  audioElmt.onplay = () => {
    startVisualization();
  };
})();
