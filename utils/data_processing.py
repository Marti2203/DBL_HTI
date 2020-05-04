import pandas as pd
from sklearn.cluster import KMeans  # for clustering
def get_users_for_stimuli(filename,stimuli):
    df_data = pd.read_csv(filename, encoding='latin1', sep='\t')
    mask = df_data['StimuliName'] == stimuli
    return df_data[mask]['user'].unique().tolist()


def get_stimuli_from_csv(filename):
    df_data = pd.read_csv(filename, encoding='latin1', sep='\t')
    return df_data['StimuliName'].unique()

def get_filtered_data_for_stimulus(filename, stimulus):
    df_data = pd.read_csv(filename, encoding='latin1', sep='\t')
    df_data_filtered = df_data[df_data['StimuliName'] == stimulus]
    return df_data_filtered

def get_clustered_data_from_frame(df_data_clustered): # As of right now, this script requires the input to already be filtered by Stimulus
    data_by_stimulus = df_data_clustered[['MappedFixationPointX', 'MappedFixationPointY']].copy()

    km_ = KMeans(n_clusters=1)
    km_.fit(data_by_stimulus)
    i_out = km_.inertia_
    K = range(2,15)
    for k in K:
        km = KMeans(n_clusters=k)
        km.fit(data_by_stimulus)
        i = km.inertia_
        if (i_out-i > i_out*0.1):
            i_out = i
        else:
            break
    
    gaze_centers = pd.DataFrame(km.cluster_centers_, columns=data_by_stimulus.columns)

    data_by_stimulus['labels'] = km.labels_
    df_diffs = pd.DataFrame(data_by_stimulus.groupby('labels').agg({'MappedFixationPointX':['max', 'min'], 'MappedFixationPointY':['max', 'min']}))
    df_diffs.columns = ['xMax', 'xMin', 'yMax', 'yMin']
    #df_diffs['radius'] = df_diffs['xMax']**2 + df_diffs['yMax']**2)**(1/2)-(df_diffs['xMin']**2 + df_diffs['yMin']**2)**(1/2)
    gaze_centers['radius'] = ((df_diffs['xMax']-df_diffs['xMin'])**2 + (df_diffs['yMax']-df_diffs['yMin'])**2)**(1/2)

    return gaze_centers


    

