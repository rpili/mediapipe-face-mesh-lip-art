"""
This Python script takes as its input the directory of TextGrids 
containing your Praat annotations of the speech tokens. The script assumes
you have annotated with one interval tier for annotating the presence 
of speech errors, and one point tier for annotating acoustic onset.

It produces as output a .csv file containing the consolidated data for
the participant, including savgol-filter-smoothed vertical lip aperture
trajectories centered on the moment of stimulus onset (corrected for
the stimulus delay created by turning on the microphone).
"""

import os
from scipy.signal import savgol_filter

#Replace with participant ID
participant = 'ParticipantIDString'
#Filepath containing the original jsPsych output .csv as well as the
#TextGrid annotations of the speech tokens.
filepath = "C:/" + participant + "/"
#what to call the participant in the final datasheet
participant_simple = 'participantIDStringSimple'

mainsource = open(filepath + participant + '.csv', 'r')

praat_data = []

#Iterate through TextGrids and grab relevant acoustic and speech error
#info.
for file in os.listdir(filepath):
    filename = os.path.join(filepath, file)
    if file.endswith(".TextGrid"):
        acoust_lat = 0
        error = "none"
        index = 0
        filebits = file.split('_')
        index = int(filebits[1])
        indata = open(filename, "r")
        for aline in indata:
            if "number =" in aline:
                chunks = aline.split(" ")
                acoust_lat = (1000*float(chunks[14])) - 350
            if "text =" in aline:
                chunks = aline.split(" ")
                if chunks[14] != '""':
                    error = chunks[14].split('"')[1]
        indata.close()
        praat = (index, acoust_lat, error)
        praat_data.append(praat)
        

outfile = open(filepath + participant + '_final' + '.csv', 'w')

prior_vowel = 'none'

#Grab trajectory data from original raw jsPsych output, smooth it,
#correct the timing based on the estimated stimulus onset delay reported
#by the mic recording plugin. Write relevant data to the final .csv file.
for aline in mainsource:
    adjusted_acoust_lat = 0
    chunks = aline.split(',')
    if len(chunks) > 23:
        raw_traj = []
        first_in_block = "no"
        for i in praat_data:
            if str(i[0]) == chunks[4].split('"')[1]:
                if i[0] in (51,113,165,237,300,362,424,486):
                    first_in_block = "yes"                    
                stim_delay = int(str(chunks[21]).split('"')[1])
                stim_delay_frames = int(round(stim_delay/33.333333, 0))
                adjusted_acoust_lat = i[1] - stim_delay
                for a in chunks[27:76]:
                    bits = a.split('"')
                    sep = float(bits[1])
                    raw_traj.append(sep)
                smoothed = savgol_filter(raw_traj, 7, 2)
                outfile.write(participant_simple + ',')
                outfile.write(str(i[0]) + ',')
                for p in chunks[22:26]:
                    outfile.write(p + ',')
                for q in smoothed[(0+stim_delay_frames):(40+stim_delay_frames)]:
                    outfile.write(str(q) + ',')
                outfile.write(i[2] + ',')
                outfile.write(first_in_block + ',')
                outfile.write(prior_vowel + ',')
                outfile.write(str(adjusted_acoust_lat) + ',')
                outfile.write('\n')
                prior_vowel = chunks[25]


mainsource.close()
outfile.close()