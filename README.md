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

## Credits

## License
