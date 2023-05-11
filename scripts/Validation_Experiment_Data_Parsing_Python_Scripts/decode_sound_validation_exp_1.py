"""
This Python script takes as its input a raw .csv file produced by the
Validation Experiment 1 jsPsych script.

It produces .wav files for each speech token, which you can then annotate via 
Praat. It also produces an intermediate .csv file, which contains raw
articulatory trajectories separated out from some of the other jsPsych
metadata. This intermediate file, as well as the TextGrids of your 
acoustic annotations, will serve as inputs to the the next script in the 
chain, which generates a final consolidated datasheet for the participant.
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
#We'll create a cleaned-up datasheet with the articulatory trajectories,
#while we're digging around for the recorded sound information.
#(This cleaned up sheet will also be used as input when the final datasheet is 
#made with the acoustic annotations integrated.)
clean_data = open(filepath + participant + '_clean.csv', 'w')
#Create a header for the cleaned up trajectory data sheet. 
clean_data.write('Participant' + ',' + 'Trial' + ',' + 'Stimulus' + ',' + 'Raw_Frames_Recorded' + 
                 ',' + 't0' + ',' + 't33' + ',' + 't67' + ',' + 't100' + ',' + 't133' + ','
                 + 't167' + ',' + 't200' + ',' + 't233' + ',' + 't267' + ',' + 't300' + ','
                 + 't333' + ',' + 't367' + ',' + 't400' + ',' + 't433' + ',' + 't467' + ','
                 + 't500' + ',' + 't533' + ',' + 't567' + ',' + 't600' + ',' + 't633' + ','
                 + 't667' + ',' + 't700' + ',' + 't733' + ',' + 't767' + ',' + 't800' + ','
                 + 't833' + ',' + 't867' + ',' + 't900' + ',' + 't933' + ',' + 't967' + ','
                 + 't1000' + ',' + 't1033' + ',' + 't1067' + '\n')

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
    
#Iterate through the raw datasheet, run the encoded sound through the decoder function,
#and generate the cleaned-up datasheet with the raw articulatory trajectories.
#(Once again, this cleaned-up datasheet is not final; you still need to annotate
#the .wav files in praat and then run the subsequent Python script.)   
for aline in infile:
    chunks = aline.split(',')
    if len(chunks) > 1:
        if chunks[23] == 'consistent' or chunks[23] == 'inconsistent':
            stim_name = chunks[21].split('"')[1]
            speech = chunks[2]
            trial_index = chunks[4].split('"')[1]
            decode_sound(speech, participant, trial_index, stim_name)
            clean_data.write(participant + ',' + trial_index + ',' + stim_name + ','
                    + chunks[22] + ',' + chunks[23] + ',' + chunks[24] + ','
                                 + chunks[25] + ',' + chunks[26] + ',' + chunks[27] + ',' + chunks[28] + ','
                                 + chunks[29] + ',' + chunks[30] + ',' + chunks[31] + ',' + chunks[32] + ','
                                 + chunks[33] + ',' + chunks[34] + ',' + chunks[35] + ',' + chunks[36] + ','
                                 + chunks[37] + ',' + chunks[38] + ',' + chunks[39] + ',' + chunks[40] + ','
                                 + chunks[41] + ',' + chunks[42] + ',' + chunks[43] + ',' + chunks[44] + ','
                                 + chunks[45] + ',' + chunks[46] + ',' + chunks[47] + ',' + chunks[48] + ','
                                 + chunks[49] + ',' + chunks[50] + ',' + chunks[51] + ',' + chunks[52] + ','
                                 + chunks[53] + ',' + chunks[54] + ',' + chunks[55] + '\n') 
        
infile.close()
clean_data.close()
