# project-c01-dropouts

**Project Title:** AR Audio Visualizer

**Team Name:** C01 Dropouts

**URL:** https://www.audiovisualizer.live

### Video Demonstration

[![Audio Visualizer Demo](https://img.youtube.com/vi/NE4l6bfglJc/0.jpg)](https://www.youtube.com/watch?v=NE4l6bfglJc "Audio Visualizer Demo")

### Team Members:

- Arianne Franchesca Lavada (1006078904)
- Yuqi Liang (1006931616)
- Siddhant Singh (1005242266)

### Description:

3D AR audio visualizer that utilizes uploaded sound files or recorded environmental noise from microphone.

### Complexity Points:

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) (1)
- [Three.js](https://threejs.org/) (2)
- [AR.js](https://github.com/AR-js-org/AR.js) (3)
- [A-Frame](https://aframe.io/) (3)

### Bonus Complexity Points:

- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) (1)

### Alpha Version:

- We aim to be able to upload sound files to the application and create a functional 3D visualization of the pitch or volume of the sound file as the file plays.
  - Create a landing page
  - Create a form for uploading sound files
  - Use Three.js and A-Frame to create visual animations for the changes in sound as defined by Web Audio API

### Beta Version:

- We aim to be able to utilize recorded sound from the device microphone and create an aesthetically pleasing and complex animation of the sounds in AR.
  - Change form for uploading sound files
    - Add the choice to use recorded microphone sound and integrate that into the already done visual animation functions
    - Allow uploading of metadata files about an AR visualization that can be exported after user inputs a sound file, so that the specific visualization can be replicated/looks similar with a different sound file
  - Enhance the animation created using Three.js and A-Frame and connect it to AR using AR.js
  - Store metadata on AR visualizations and sound files in backend so that users can recreate their visualizations

### Final Version:

- We aim to allow the user to choose from multiple options to change the resulting AR visualization as the visualization is ongoing and/or beforehand.
  - E.g., style of animation, sensitivity of audio visualization (how closely does the animation match the sound), color themes, etc.
- **Optional:** Add an option to store AR sound visualizations from different users in a “playlist”.
