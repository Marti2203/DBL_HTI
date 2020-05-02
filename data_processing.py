import pandas as pd
def get_data_from_csv(filename):
    df_data = pd.read_csv(filename, encoding='latin1', sep='\t')
    return df_data.to_json()
def get_stimuli_from_csv(filename):
    df_data = pd.read_csv(filename, encoding='latin1', sep='\t')
    return df_data['StimuliName'].unique()
def get_clustered_data_from_csv(filename): # As of right now, this script requires the input to already be filtered by Stimulus
    df_data_clustered = pf.read_csv(filename, encoding='latin1', sep='\t')
    data_by_stimulus = df_data_clustered[['MappedFixationPointX', 'MappedFixationPointY']].copy()
    km = KMeans(n_clusters=5)
    km.fit(data_by_stimulus)
    gaze_centers = pd.DataFrame(km.cluster_centers_, columns=data_by_stimulus.columns)

    data_by_stimulus['labels'] = km.labels_
    df_diffs = pd.DataFrame(X_km.groupby('labels').agg({'MappedFixationPointX':['max', 'min'], 'MappedFixationPointY':['max', 'min']}))
    df_diffs.columns = ['xMax', 'xMin', 'yMax', 'yMin']
    df_diffs['radius'] = (df_diffs['xMax']**2 + df_diffs['yMax']**2)**(1/2)-(df_diffs['xMin']**2 + df_diffs['yMin']**2)**(1/2)
    return df_diffs


    

