"""
This Python script takes as its input the intermediate .csv produced
by the prior script, as well as the directory of TextGrids containing
your Praat annotations of the speech tokens. The script assumes
you have annotated with three point tiers, representing acoustic onset
of segments 1, 2, and 3, respectively, and one interval tier for 
annotating the presence of speech errors.

It produces as output a .csv file containing the consolidated data for
the participant, including savgol-filter-smoothed vertical lip aperture
trajectories centered on the moment of initial acoustic onset, values for 
the acoustic onset and offset of the middle phonetic segment, and the 
timing of maximal lip opening (for "Bob") or closure (for "Emma") during
the span of the utterance.
"""

import os
import numpy as np
from scipy.signal import find_peaks
from scipy.signal import peak_prominences
from scipy.signal import savgol_filter

#Replace with participant ID
participantID = 'ParticipantIDString'

#Give the filepath where the intermediate .csv of data, as well as
#TextGrids of acoustic annotations, can be found (for this participant)
path = 'C:/' + participantID + '/'

#Give the path where the final datasheet is to be stored.
path2 = 'C:/'

directory = os.fsencode(path)

detector = 'null'
error = 'n/a'
onset_1 = 0
onset_2 = 0
onset_3 = 0
trial = 0
stimulus = 'null'
onset_1_slot = 0

acoustic_codes = []
traj_onsets = []

cleanfile = open(path + participantID + '_clean.csv', 'r')

#Iterate through TextGrids and grab relevant acoustic landmarks
#(and speech error info).
for file in os.listdir(directory):
    filename = os.fsdecode(file)
    if filename.endswith(".TextGrid"):
        filebits = filename.split('_')
        trial = filebits[1]
        stimulus = filebits[2].split('.')[0]
        infile = open(path + filename, 'r')
        for aline in infile:
            if 'name = "error"' in aline:
                detector = 'error'
            if 'seg1_onset' in aline:
                detector = 'seg1'
            if 'seg2_onset' in aline:
                detector = 'seg2'
            if 'seg3_onset' in aline:
                detector = 'seg3'
            if 'number' in aline:
                chunks = aline.split(' ')
                if detector == 'seg1':
                    onset_1 = str(float(chunks[14])*1000)
                    onset_1_slot = round((float(chunks[14]) * 1000) / 33.3333333)
                    traj_onsets.append((trial, onset_1_slot))
                if detector == 'seg2':
                    onset_2 = str(float(chunks[14])*1000)
                if detector == 'seg3':
                    onset_3 = str(float(chunks[14])*1000)
            if 'text =' in aline:
                if detector == 'error':
                    chunks = aline.split(' ')
                    if chunks[14] != '""':
                        error = 'error'
                    else:
                        error = 'n/a'
        infile.close()
        acoustic_codes.append((trial, stimulus, onset_1, onset_2, onset_3, error))
 
integrated = []       
 
#establish a dataframe to merge data from intermediate .csv and buffered
#acoustic landmarks.
for aline in cleanfile:
    bits = aline.split(',')
    bits2 = []
    for a in bits:
        a2 = a.replace('"', '')
        a3 = a2.replace('\n', '')
        bits2.append(a3)
    integrated.append(bits2)


#Take raw trajectory from merged dataframe, smooth it, and then isolate 
#piece running from acoustic onset until ~366 ms later, and substitute
#that back in as the trajectory data in the merged dataframe.
#Also take the smoothed raw trajectory and compute the timing of the 
#maximal peak/closure and add that to the merged dataframe. Add in 
#relevant acoustic info grabbed from the TextGrids., and compute the 
#differences between maximal peak/closure and the onset/offset of 
#acoustic segment 2.
for i in integrated:
    if i[0] != 'Participant':
        for k in traj_onsets:
            if k[0] == i[1]:
                on_frame = k[1]
        smoothed = savgol_filter(i[4:37], 7, 2)
        i[4:37] = smoothed[(on_frame):(on_frame + 11)]
        inverted = np.array(smoothed, dtype=np.float32)*(-1)
        if i[2] == 'Bob':
            pks, _ = find_peaks(smoothed)
            proms = peak_prominences(smoothed, pks)[0]
            index_max = np.argmax(proms)
            peaktime = pks[index_max] * 33.33
        else:
            pks, _ = find_peaks(inverted)
            proms = peak_prominences(inverted, pks)[0]
            index_max = np.argmax(proms)
            peaktime = pks[index_max] * 33.33
    for j in acoustic_codes:
        if j[0] == i[1]:
            i.append(j[2])
            i.append(j[3])
            i.append(j[4])
            i.append(j[5])
            i.append(str(peaktime))
            i.append(str(peaktime-float(j[3])))
            i.append(str(peaktime-float(j[4])))
            i.append('\n')
        
cleanfile.close()

integrated.remove(integrated[0])

#Identify the maximal and minimal aperture values in each trajectory 
#fragment, and get the means and SDs of all maximal and minimal values
#Identify trials with trajectories for which the maximum value falls
#3 or more SDs above the mean maximum, and for which the minimum value
#falls 3 or more SDs below the mean minimum. Mark these are "errors" for
#later exclusion.
#(This is a set of criteria for identifying those cases in which the
#participant may have turned their face too far off the camera axis for
#lip aperture data to be trustworthy.)
maxima = []
minima = []

for j in integrated:
    print(j[4:14])
    maxima.append(max(j[4:14]))
    minima.append(min(j[4:14]))
    
avg_open = np.mean(maxima)
avg_close = np.mean(minima)

dev_open = np.std(maxima)
dev_close = np.std(minima)



max_count = -1

for x in maxima:
    max_count += 1
    if ((x-avg_open)/dev_open) >= 3:
        integrated[max_count][18] = 'error'
    
        
min_count = -1

for y in minima:
    min_count += 1
    if ((y-avg_close)/dev_close) <= -3:
        integrated[min_count][18] = 'error'


        

outfile = open(path2 + participantID + '_final.csv', 'w')

#Write out the integrated data to the final .csv file.
for entry in integrated:
    for element in entry:
        if element != '\n':
            outfile.write(str(element) + ',')
        else:
            outfile.write(element)    
outfile.close()

