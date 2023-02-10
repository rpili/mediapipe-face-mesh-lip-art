var jsPsychExtensionFaceMesh = (function () {
  'use strict';

  class FaceMeshExtension {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
          this.currentVertData = [];
          this.timepoints = [];
          this.adjustedVertResults = [];
          //this.currentHorizData = [];
          this.initialized = false;
          this.activeTrial = false;
          this.trackingLaunched = false;
          this.detector = {}
          this.detector.face = undefined
          this.initialize = ({sample_rate = 30, vid_width = 640, vid_height = 480}) => {
            this.sample_rate = sample_rate
            this.vid_width = vid_width
            this.vid_height = vid_height
            this.increment = 1000 / sample_rate
            return new Promise((resolve, reject) => {
                resolve();
              });
        }; 
        this.on_start = (params) => {
          params = params || {};
          this.record_on = params.record_data
         //if (this.trackingLaunched == true){
           //  await this.faceMesh.send({image: this.videoElement})};
            this.currentVertData = [];
            this.timepoints = [];
            this.adjustedVertResults = [];
            //this.currentHorizData = [];
            //this.activeTrial = false;
        };    
        this.on_load = () => {
          this.trialOnset = new Date()
            this.currentTrialStart = performance.now();
            this.activeTrial = true;
            this.startSampleInterval();
            return new Promise((resolve, reject) => {
              resolve();
            });
        };     
        this.on_finish =() => {
            //this.stopSampleInterval();
            this.activeTrial = false;
            this.trialOffset = new Date()
            this.correctVariableFramerate()
            return Object.fromEntries(this.adjustedVertResults)
        };

        this.startSampleInterval = () => {
              this.detectProxy = new Proxy(this.detector, {
                set(target, prop, val){
                    const update_feedback = function(){
                        //console.log('update function fired')
                        if (val == null){
                            var feedbackCanvas = document.createElement('canvas');
                            feedbackCanvas.width = 270
                            feedbackCanvas.height = 30
                            feedbackCanvas.style.position = "absolute"
                            feedbackCanvas.style.left = "42%"
                            //feedbackCanvas.style.margin = "auto"
                            //feedbackCanvas.style.marginRight = "auto"
                            feedbackCanvas.style.top = "5%"
                            document.body.appendChild(feedbackCanvas);
                            var cfc = feedbackCanvas.getContext('2d')
                            cfc.fillStyle = "orange"
                            cfc.fillRect(0, 0, feedbackCanvas.width, feedbackCanvas.height);
                            cfc.fillStyle = "White"
                            cfc.font = "20px Calibri";
                            cfc.fillText("Tracker status: Initializing...", 5, 20);
                            cfc.save();
                        }
                        else if (val == 1){
                            var feedbackCanvas = document.createElement('canvas');
                            feedbackCanvas.width = 270
                            feedbackCanvas.height = 30
                            feedbackCanvas.style.position = "absolute"
                            feedbackCanvas.style.left = "42%"
                            //feedbackCanvas.style.margin = "auto"
                            feedbackCanvas.style.top = "5%"
                            document.body.appendChild(feedbackCanvas);
                            var cfc = feedbackCanvas.getContext('2d');
                            cfc.clearRect(0, 0, feedbackCanvas.width, feedbackCanvas.height);
                                cfc.fillStyle = "green"
                                cfc.fillRect(0, 0, feedbackCanvas.width, feedbackCanvas.height);
                                cfc.fillStyle = "White"
                                cfc.font = "20px Calibri";
                                cfc.fillText("Tracker status: Tracking face", 5, 20);
                                cfc.save();
                        }else {
                            var feedbackCanvas = document.createElement('canvas');
                            feedbackCanvas.width = 270
                            feedbackCanvas.height = 30
                            feedbackCanvas.style.position = "absolute"
                            feedbackCanvas.style.left = "42%"
                            //feedbackCanvas.style.margin = "auto"
                            feedbackCanvas.style.top = "5%"
                            document.body.appendChild(feedbackCanvas);
                            var cfc = feedbackCanvas.getContext('2d');
                            var cfc = feedbackCanvas.getContext('2d');
                            cfc.clearRect(0, 0, feedbackCanvas.width, feedbackCanvas.height);
                                cfc.fillStyle = "red"
                                cfc.fillRect(0, 0, feedbackCanvas.width, feedbackCanvas.height);
                                cfc.fillStyle = "White"
                                cfc.font = "20px Calibri";
                                cfc.fillText("Tracker status: No face detected", 5, 20);
                                cfc.save();
                        }
                      }
                    if (val == null){
                        update_feedback()
                        target[prop] = val;
                        return true;
                    }
                    if (val == 1){
                        //console.log('confirming face detected');
                       update_feedback()
                        target[prop] = val;
                        return true;
                    }
                    else if (val == 0){
                        //console.log('confirming face disappeared');
                        update_feedback()
                        target[prop] = val;
                        return true;
                    }
                }
              });
              if (this.trackingLaunched == false){
                this.detectProxy.face = null
                this.start_track()
            }
        }
        this.start_track = () => {
            this.face_detected == null
            this.videoElement = document.createElement('video')
            this.faceMesh = new FaceMesh({locateFile: (file) => {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }});
            this.faceMesh.setOptions({
              maxNumFaces: 1,
              refineLandmarks: true,
              minDetectionConfidence: 0.5,
              minTrackingConfidence: 0.5
            });
            this.faceMesh.onResults(this.update_out);
            this.FMcamera = new Camera(this.videoElement, {
                            onFrame: async () => {
                            this.frameTime = new Date()
                            if (this.trackingLaunched == true){
                            if (this.activeTrial == false){
                              await this.on_load();
                            await this.faceMesh.send({image: this.videoElement})}
                            else{
                              await this.faceMesh.send({image: this.videoElement})}
                            };
                         },
                         width: this.vid_width,
                        height: this.vid_height,
                        frameRate: {
                          //max: this.sample_rate,
                          exact: this.sample_rate,
                        }
                        });
                        this.FMcamera.start();
                this.trackingLaunched = true
            };
            this.update_out = (results) =>{
              this.faceCoords = results.multiFaceLandmarks
              this.unfolding_trajectories(this.faceCoords)
            }
            this.unfolding_trajectories = (results) => {
                if (this.activeTrial == true){
                    if (results.length != this.detectProxy.face){
                    this.detectProxy.face = results.length}
                 //console.log(this.detector.face)
                  //this.faceCoords = results.multiFaceLandmarks
                  //console.log(results.multiFaceLandmarks.length)
                for (const landmarks of results) {
                  var lip_aperture = (((landmarks[0].x*this.vid_width)-(landmarks[17].x*this.vid_width))**2 + ((landmarks[0].y*this.vid_height)-(landmarks[17].y*this.vid_height))**2 + ((landmarks[0].z*this.vid_width)-(landmarks[17].z*this.vid_width)))**(1/2)
                  var lip_spreadness = (((landmarks[78].x*this.vid_width)-(landmarks[308].x*this.vid_width))**2 + ((landmarks[78].y*this.vid_height)-(landmarks[308].y*this.vid_height))**2 + ((landmarks[78].z*this.vid_width)-(landmarks[308].z*this.vid_width)))**(1/2)
                  var nose_bridge = (((landmarks[1].x*this.vid_width)-(landmarks[168].x*this.vid_width))**2 + ((landmarks[1].y*this.vid_height)-(landmarks[168].y*this.vid_height))**2 + ((landmarks[1].z*this.vid_width)-(landmarks[168].z*this.vid_width)))**(1/2)
                  var lip_aperture_normed = (lip_aperture)/(nose_bridge)
                  var lip_spreadness_normed = (lip_spreadness)/(nose_bridge)
                }
                this.frameGap = (this.frameTime.getTime() - this.trialOnset.getTime());
                if (this.record_on != 0){
                this.currentVertData.push([this.frameGap, lip_spreadness_normed]);
                //this.currentVertData.push([`vert_frame_${this.currentVertData.length+1}`, lip_aperture_normed]);
                }
            }};
            this.correctVariableFramerate = async() =>{
                this.trial_dur = this.trialOffset - this.trialOnset
                if (this.record_on != 0){
                    this.numRawFrames = this.currentVertData.length
                if (this.currentVertData[0][0] > 0){
                    this.extrapFirst = this.currentVertData[0][1] + (((0 - this.currentVertData[0][0])/(this.currentVertData[1][0] - this.currentVertData[0][0]))*(this.currentVertData[1][1] - this.currentVertData[0][1])) }
                    this.currentVertData.unshift([0, this.extrapFirst])
                if (this.currentVertData[this.currentVertData.length - 1][0] < this.trial_dur){
                    this.extrapLast = this.currentVertData[this.currentVertData.length - 2][1] + (((this.trial_dur - this.currentVertData[this.currentVertData.length - 2][0])/(this.currentVertData[this.currentVertData.length - 1][0] - this.currentVertData[this.currentVertData.length - 2][0]))*(this.currentVertData[this.currentVertData.length - 1][1] - this.currentVertData[this.currentVertData.length - 2][1])) }
                    this.currentVertData.push([this.trial_dur, this.extrapLast])
                }
                if (this.record_on != 0){
                this.numSteps = Math.floor(this.trial_dur / this.increment)
                for (let step = 1; step < (this.numSteps+1); step++){
                    var timepoint = step*this.increment;
                    this.timepoints.push(timepoint);
                }
                this.adjustedVertResults.push(['Raw frames recorded', this.numRawFrames])
                this.adjustedVertResults.push([`${this.currentVertData[0][0]} ms`, this.currentVertData[0][1]]);
                for (const time of this.timepoints){
                    var frameBuffer = this.currentVertData[0];
                    for (const tempFrame of this.currentVertData){
                        if (tempFrame[0] == time){
                            this.adjustedVertResults.push([`${tempFrame[0]} ms`, tempFrame[1]]);
                            break;
                        }else if (tempFrame[0] < time) {
                            frameBuffer = tempFrame;
                        }else if (tempFrame[0] > time){
                            var estimatedSep = ((frameBuffer[1]*(tempFrame[0] - time)) + (tempFrame[1]*(time - frameBuffer[0]))) / (tempFrame[0] - frameBuffer[0])
                            this.adjustedVertResults.push([`${Math.round(time)} ms`, estimatedSep])
                            break;
                        }
                    }
                }}
            }
    }
    
};
      FaceMeshExtension.info = {
        name: "facemesh",
    };
  return FaceMeshExtension;

})();
