function start_track () {
    const faceMesh = new FaceMesh({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }});
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    faceMesh.onResults(update_output);
    
    
    //function update_output(results){
      //  FMR = results;
        //unfolding_trajectories(results);
    //};
    
    
    const camera = new Camera(videoElement, {
                    onFrame: async () => {
                    await faceMesh.send({image: videoElement});
                 },
                 width: 640,
                height: 480,
                frameRate: {
                  ideal: 30
                }
                });
                camera.start();
    
    };