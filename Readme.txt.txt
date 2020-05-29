MPIIDPEye Dataset.

For the MPIIDPEye dataset we recruited 20 participants (10 male, 10 female).
The recording of a single participant consists of three separate recording sessions, in which a participant reads one out of three different documents: comic (R1), online newspaper (R2), and textbook (R3). 
All documents include a varying rate of text and images. 
Each of these documents was about a 10 minute read, depending on a user's reading skill (about 30 minutes in total). 
We did not calibrate the eye tracker but only analysed users' eye movements from the eye videos.
From the recorded eye movement data we extracted a total of 52 eye movement features, covering fixations, saccades, blinks, and pupil diameter (see annotation scheme below).
Similar to [Bulling et al. TPAMI'11] we also computed wordbook (WB) features that encode sequences of n saccades. We extracted these features using a sliding window of 30 seconds (step size of 0.5 seconds).


Eye Tracking Data Annotation Scheme

#0. pupil position x
#1. pupil position y
#2. timestamp
#3. confidence
#4. pupil diameter


Eye Movement Features Annotation Scheme

#0. rate of fixations
#1. rate of saccades
#2. rate of small saccades
#3. rate of large saccades
#4. rate of positive saccades
#5. rate of negative saccades
#6. ratio saccades / fixations
#7. ratio small / saccades
#8. ratio large sacc
#9. ratio pos sacc
#10. ratio neg sacc
#11. mean sacc amplitude
#12. var sacc amplitude
#13. max sacc amplitude
#14. mean fix duration
#15. var fix duration
#16. max fix duration
#17. mean var x
#18. mean var y
#19. var var x
#20. var var y
#21. mean mean diameter during fixations
#22. var mean diameter during fixations
#23. mean var diameter during fixations
#24. var var diameter during fixations
#25. mean blink duration
#26. var blink duration
#27. blink rate
#28. non zero entries WB1
#29. max WB1
#30. min WB1
#31. diff max-min WB1
#32. mean WB1
#33. var WB1
#34. non zero entries WB2
#35. max WB2
#36. min WB2
#37. diff max-min WB2
#38. mean WB2
#39. var WB2
#40. non zero entries WB3
#41. max WB3
#42. min WB3
#43. diff max-min WB3
#44. mean WB3
#45. var WB3
#46. non zero entries WB4
#47. max WB4
#48. min WB4
#49. diff max-min WB4
#50. mean WB4
#51. var WB4
