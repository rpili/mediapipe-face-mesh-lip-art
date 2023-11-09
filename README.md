# mediapipe-face-mesh-lip-art

## Description

A word reading task paradigm built in jsPsych with lip articulation tracking through MediaPipe's FaceMesh. The purpose of this repository is to allow researchers to quickly deploy word reading tasks online and collect auditory and articulatory measures. 

## Contents

This repository contains all files required for running word reading tasks with auditory and articulatory measures. Data preprocessing scripts for preparing articulatory trajectories are also provided. 

- `jspsych/`: The entire base [jsPsych 7.2.3](https://github.com/jspsych/jsPsych/releases) installation for local hosting. Includes nested novel plugins and extension for mediapipe FaceMesh lip articulation tracking.  
- `scripts/FaceMesh_Core_Scripts`: Core FaceMesh control scripts from [MediaPipe](https://google.github.io/mediapipe/).
- `scripts/Lip_Separation_jsPsych_Scripts`: FaceMesh extension (and optional start-up plugin) for collecting articulatory measures in a jsPsych experiment.
- `scripts/Validation_Experiment_Data_Parsing_Python_Scripts`: Data processing scripts for preparing articulatory trajectories for analysis.
- `scripts/Validation_Experiment_jsPsych_Scripts`: jsPsych experiment control scripts.

## Installation

Clone this repository

`git clone https://github.com/rpili/mediapipe-face-mesh-lip-art.git`

## Usage

To execute a study using our custom FaceMesh extension (and its associated startup plugin) a researcher will require the following:
- A recent distribution of the jsPsych script library.
	- This is freely downloadable from https://www.jspsych.org/. 	
	- The base jsPsych 7.2.3 installation is also available in `jspsych/`.
- Our custom FaceMesh lip-tracking extension.
	- `extension-lip-separations-via-facemesh.js`
- Our custom startup plugin, which is recommended but not required. 
	- `plugin-lip-separations-startup.js`
- The following core FaceMesh scripts:
	- `camera_utils.js`
	- `control_utils.js`
	- `drawing_utils.js`
	- `face_mesh.js`
	- The above scripts are part of the MediaPipe project, https://google.github.io/mediapipe/.
-	One or more study control scripts specific to the study, written in JavaScript, using the custom syntax for jsPsych’s features.
	- `scripts/Validation_Experiment_jsPsych_Scripts` contains ready-to-use word reading experiments. 
-	If recording of the participant’s verbal audio is desired, a jsPsych-compatible plugin or extension to accomplish this. Two candidates are:
	-	`plugin-html-audio-response.js`, as included in the standard jsPsych library.
	-	`plugin-html-audio-response_2.js`, our modification of the standard audio plugin.
-	If the study is going to be conducted over the web, a web-hosting service to which all the required JavaScript files can be posted, and to which data outputs can be saved for each run.
-	Possibly, a means of taking the raw jsPsych data, which will likely download as a single, quite complicated .csv file, and parsing it into a usable form, such as by using Python scripts.

## Credits

## License
