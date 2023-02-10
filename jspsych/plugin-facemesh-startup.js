var jsPsychFacemeshStartup = (function (jspsych) {
  'use strict';

  const info = {
      name: "facemesh-startup",
      parameters: {
          /** The drawing function to apply to the canvas. Should take the canvas object as argument. */
          stimulus: {
              type: jspsych.ParameterType.FUNCTION,
              pretty_name: "Stimulus",
              default: function(c){setInterval(function(){
                var ctx = c.getContext("2d");
                ctx.fillStyle = "whitesmoke"
                ctx.save();
                ctx.clearRect(0, 0, c.width, c.height);
                ctx.fillRect(0, 0, c.width, c.height)
                ctx.setTransform(-1,0,0,1,c.width,0);
                if (this.jsPsych.extensions["facemesh"].faceCoords != undefined){
                    for (const landmarks of this.jsPsych.extensions["facemesh"].faceCoords){
                        drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL,
                                       {color: 'Black', lineWidth: 0.3});
                        drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE,
                                        {color: 'Black', lineWidth: 0.3});
                        drawConnectors(ctx, landmarks, FACEMESH_LEFT_IRIS,
                                            {color: 'Black', lineWidth: 0.3});
                        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE,
                                                {color: 'Black', lineWidth: 0.3});
                        drawConnectors(ctx, landmarks, FACEMESH_RIGHT_IRIS,
                                                    {color: 'Black', lineWidth: 0.3});
                        drawConnectors(ctx, landmarks, FACEMESH_LIPS, {color: 'black', lineWidth: 3.5});
                        }}
                
                ctx.restore()}, 50)},
              },
          /** Array containing the label(s) for the button(s). */
          choices: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Choices",
              default: ['Continue'],
              array: true,
          },
          /** The html of the button. Can create own style. */
          button_html: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Button HTML",
              default: '<button class="jspsych-btn">%choice%</button>',
              array: true,
          },
          /** Any content here will be displayed under the button. */
          prompt: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Prompt",
              default: `
              <p>Enable webcam and allow tracker to initialize (this may take up to 40 seconds).</p>
              <p>Some jitter is normal. However, if tracking is refusing to settle down, ensure you are under good lighting, unmasked, and sitting close to the webcam.</p>
              <p>Once satisfied, click "Continue"</p>`,
          },
          /** How long to show the trial. */
          trial_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Trial duration",
              default: null,
          },
          /** The vertical margin of the button. */
          margin_vertical: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin vertical",
              default: "0px",
          },
          /** The horizontal margin of the button. */
          margin_horizontal: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin horizontal",
              default: "8px",
          },
          /** If true, then trial will end when user responds. */
          response_ends_trial: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Response ends trial",
              default: true,
          },
          /** Array containing the height (first value) and width (second value) of the canvas element. */
          canvas_size: {
              type: jspsych.ParameterType.INT,
              array: true,
              pretty_name: "Canvas size",
              default: [360, 480],
          },
      },
  };
  /**
   * **Facemesh Startup**
   *
   * jsPsych plugin for initializing face-tracking via FaceMesh, for use with the FaceMesh extension.
   *
   * @author Peter A. Krause, modified from prior work on jsPsych canvas plugins by Chris Jungerius and Josh de Leeuw
   * @see {@link ...}
   */
  class FacemeshStartupPlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {
          // create canvas
          var html = '<div id="jspsych-facemesh-startup-stimulus">' +
              '<canvas id="jspsych-canvas-stimulus" height="' +
              trial.canvas_size[0] +
              '" width="' +
              trial.canvas_size[1] +
              '"></canvas>' +
              "</div>";
          //display buttons
          var buttons = [];
          if (Array.isArray(trial.button_html)) {
              if (trial.button_html.length == trial.choices.length) {
                  buttons = trial.button_html;
              }
              else {
                  console.error("Error in canvas-button-response plugin. The length of the button_html array does not equal the length of the choices array");
              }
          }
          else {
              for (var i = 0; i < trial.choices.length; i++) {
                  buttons.push(trial.button_html);
              }
          }
          html += '<div id="jspsych-facemesh-startup-btngroup">';
          for (var i = 0; i < trial.choices.length; i++) {
              var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
              html +=
                  '<div class="jspsych-facemesh-startup-button" style="display: inline-block; margin:' +
                      trial.margin_vertical +
                      " " +
                      trial.margin_horizontal +
                      '" id="jspsych-facemesh-startup-button-' +
                      i +
                      '" data-choice="' +
                      i +
                      '">' +
                      str +
                      "</div>";
          }
          html += "</div>";
          //show prompt if there is one
          if (trial.prompt !== null) {
              html += trial.prompt;
          }
          display_element.innerHTML = html;
          //draw
          let c = document.getElementById("jspsych-canvas-stimulus");
          trial.stimulus(c);
          // start time
          var start_time = performance.now();
          // add event listeners to buttons
          for (var i = 0; i < trial.choices.length; i++) {
              display_element
                  .querySelector("#jspsych-facemesh-startup-button-" + i)
                  .addEventListener("click", (e) => {
                  var btn_el = e.currentTarget;
                  var choice = btn_el.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
                  after_response(choice);
              });
          }

          var btns = document.querySelectorAll(".jspsych-facemesh-startup-button button");
          var testForEnable = () =>{
            if (this.jsPsych.extensions["facemesh"].faceCoords == undefined){
                for (var i = 0; i < btns.length; i++) {
                    btns[i].setAttribute("disabled", "disabled");
                }}else{
                    for (var i = 0; i < btns.length; i++) {
                        btns[i].removeAttribute("disabled", "disabled");
                }}
          };
          setInterval(function(){testForEnable()}, 70)
          

          // function to end trial when it is time
          const end_trial = () => {
              // kill any remaining setTimeout handlers
              this.jsPsych.pluginAPI.clearAllTimeouts();
              // clear the display
              display_element.innerHTML = "";
              // move on to the next trial
              this.jsPsych.finishTrial();
          };
          // function to handle responses by the subject
         
          function after_response(choice) {
              if (trial.response_ends_trial) {
                  end_trial();
              }
          }
      }   
  }
  FacemeshStartupPlugin.info = info;

  return FacemeshStartupPlugin;

})(jsPsychModule);
