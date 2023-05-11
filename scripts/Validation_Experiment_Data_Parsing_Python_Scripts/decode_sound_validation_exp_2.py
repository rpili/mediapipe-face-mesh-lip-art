"""
This Python script takes as its input a raw .csv file produced by the
Validation Experiment 2 jsPsych script.

It produces .wav files for each speech token, which you can then annotate via 
Praat. The TextGrids of your acoustic annotations will serve as inputs 
to the the next script in the chain, which generates a final consolidated 
datasheet for the participant.
"""

import base64
import subprocess
import os

#Replace with participant ID
participant = 'ParticipantIDString'
#Give the filepath where the raw .csv of data from jsPsych can be found 
#(for this participant)
filepath = "C:/" + participant + "/"

infile = open(filepath + participant + '.csv', 'r')

#The main function for reading in a base64-encoded text string and 
#converting back to .mp3 (and then to .wav)
def decode_sound(encoded_clip, partic_ID, trial_num, stimulus):
    filename = filepath + partic_ID + '_' + trial_num + '_' + stimulus + '.mp3'
    filename2 = filepath + partic_ID + '_' + trial_num + '_' + stimulus + '.wav'
    print(filename2)
    decoded = open(filename, "wb")
    unpacked = base64.b64decode(encoded_clip)
    decoded.write(unpacked)
    decoded.close()
    subprocess.call(['ffmpeg', '-i', filename, filename2])
    os.remove(filename)

#Iterate through the raw datasheet and run the encoded sound through the 
#decoder function.
#You will later need to annotate the .wav files in praat and 
#then run the subsequent Python script.      
    
for aline in infile:
    chunks = aline.split(',')
    if len(chunks) > 22:
        #print(chunks)
        if chunks[24] == '"homogeneous"' or chunks[24] == '"heterogeneous"':
            #print(chunks[23])
            stim_name = chunks[23].split('"')[1]
            speech = chunks[2]
            trial_index = chunks[4].split('"')[1]
            decode_sound(speech, participant, trial_index, stim_name)
  
        
infile.close()
