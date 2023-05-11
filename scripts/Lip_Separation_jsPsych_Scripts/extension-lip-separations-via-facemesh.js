//This extension for the jsPsych framework allows the researcher to record vertical or horizontal lip separations on any trial that calls this extension and sets the data_recording parameter
//to 1. Lip separations are based on values obtained using the FaceMesh face-tracker. The participant must consent to activate their webcam. Experiments using this script
//must include the following core scripts from the MediaPipe FaceMesh project: 

//camera_utils.js, control_utils.js, drawing_utils.js, and face_mesh.js. 

//We also recommend using plugin-lip-separation-startup.js early in your experiment to help the participant verify the quality of face-tracking.

//As distributed, this extension is configured to record vertical lip apertures. If you desire to record horizontal lip apertures, please modify line 198.
//Change it to read: this.currentApertureData.push([this.frameGap, lip_spreadness_normed]);
//(That is, in the square brackets, “lip_aperture_normed” should be replaced with “lip_spreadness_normed”.)

//This extension was principally developed by Peter A. Krause, though some early inspiration was taken from the Webgazer extension distributed with the standard jsPsych library.
//Further input, validation, testing, and writing of the associated paper depended on critical contributions from Ryan J. Pili, Jess Fernandez, and Erik Hunt.

//To cite use of this extension, please cite the associated paper: 
//Krause, P. A., Pili, R. J., Fernandez, J., & Hunt, E. (Submitted). A process for measuring lip kinematics using participants’ webcams during linguistic experiments conducted online. TBD.


var jsPsychExtensionLipSeparationsFaceMesh = (function () {
  'use strict';

  class LipSeparationsFaceMeshExtension {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
          this.currentVertData = [];
          this.timepoints = [];
          this.adjustedVertResults = [];
          this.initialized = false;
          this.activeTrial = false;
          this.trackingLaunched = false;
          this.detector = {}
          this.detector.face = undefined
          //FaceMesh will attempt to initialize webcam at 640x480px, 30fps. Justification appears in the article.
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
            this.currentVertData = [];
            this.timepoints = [];
            this.adjustedVertResults = [];
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
            this.activeTrial = false;
            this.trialOffset = new Date()
            this.correctVariableFramerate()
            return Object.fromEntries(this.adjustedVertResults)
        };

        this.startSampleInterval = () => {
              this.detectProxy = new Proxy(this.detector, {
                set(target, prop, val){
                  //establish the feedback canvases that will notify the participant of adequate face-tracking, and set up proxies that allow them to be updated in real-time.
                    const update_feedback = function(){
                        if (val == null){
                            var feedbackCanvas = document.createElement('canvas');
                            feedbackCanvas.width = 270
                            feedbackCanvas.height = 30
                            feedbackCanvas.style.position = "absolute"
                            feedbackCanvas.style.left = "42%"
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
                      //Read whether facemesh is initiated, and if so, if it is successfully detecting a face. Update feedback canvas as needed.
                    if (val == null){
                        update_feedback()
                        target[prop] = val;
                        return true;
                    }
                    if (val == 1){
                       update_feedback()
                        target[prop] = val;
                        return true;
                    }
                    else if (val == 0){
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
          //Start FaceMesh, set it to detect a single face, and to report tracking success if detection and tracking confidences meet a 0.5 threshold (on scale of 0-1).
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
              //when a face is detected, use FaceMesh's landmarks to calculate vertical/horizontal lip apertures and nose bridge length, via Euclidean distance.
              //Lip apertures are then normalized via nose bridge length, to correct for variable distance of face to camera.
                if (this.activeTrial == true){
                    if (results.length != this.detectProxy.face){
                    this.detectProxy.face = results.length}
                for (const landmarks of results) {
                  var lip_aperture = (((landmarks[0].x*this.vid_width)-(landmarks[17].x*this.vid_width))**2 + ((landmarks[0].y*this.vid_height)-(landmarks[17].y*this.vid_height))**2 + ((landmarks[0].z*this.vid_width)-(landmarks[17].z*this.vid_width)))**(1/2)
                  var lip_spreadness = (((landmarks[78].x*this.vid_width)-(landmarks[308].x*this.vid_width))**2 + ((landmarks[78].y*this.vid_height)-(landmarks[308].y*this.vid_height))**2 + ((landmarks[78].z*this.vid_width)-(landmarks[308].z*this.vid_width)))**(1/2)
                  var nose_bridge = (((landmarks[1].x*this.vid_width)-(landmarks[168].x*this.vid_width))**2 + ((landmarks[1].y*this.vid_height)-(landmarks[168].y*this.vid_height))**2 + ((landmarks[1].z*this.vid_width)-(landmarks[168].z*this.vid_width)))**(1/2)
                  var lip_aperture_normed = (lip_aperture)/(nose_bridge)
                  var lip_spreadness_normed = (lip_spreadness)/(nose_bridge)
                }
                //Record the values on the "time" axis for each lip aperture captured, in order to perform the linear interpolation to correct for variable framerate.
                this.frameGap = (this.frameTime.getTime() - this.trialOnset.getTime());
                if (this.record_on != 0){
                this.currentVertData.push([this.frameGap, lip_aperture_normed]);
                }
            }};
            this.correctVariableFramerate = async() =>{
              //Break the recording interval into even ticks based on the nominal framerate, and estimate the lip aperture values exactly on those ticks, via linear interpolation.
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
      LipSeparationsFaceMeshExtension.info = {
        name: "facemesh",
    };
  return LipSeparationsFaceMeshExtension;

})();
