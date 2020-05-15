import pandas as pd
from sklearn.cluster import KMeans  # for clustering
def get_users_for_stimuli(filename,stimuli):
    df_data = pd.read_csv(filename, encoding='latin1', sep='\t')
    mask = df_data['StimuliName'] == stimuli
    return df_data[mask]['user'].unique().tolist()


def get_stimuli_from_csv(filename):
    df_data = pd.read_csv(filename, encoding='latin1', sep='\t')
    return df_data['StimuliName'].unique()

def get_filtered_data_for_stimulus(filename, stimulus, user=None):
    df_data = pd.read_csv(filename, encoding='latin1', sep='\t')
    df_data_filtered = df_data[df_data['StimuliName'] == stimulus]
    if user is not None :
        df_data_filtered = df_data_filtered[df_data_filtered['user'] == user]
    return df_data_filtered

def get_clustered_data_from_frame(df_data_clustered): # As of right now, this script requires the input to already be filtered by Stimulus

    data_by_user = df_data_clustered[['FixationIndex', 'FixationDuration', 'MappedFixationPointX', 'MappedFixationPointY']].copy()
    data_by_user.columns = [['FixationIndex', 'Duration', 'mx', 'my']]

    # Custom Clustering Algorithm
    data_by_user['diffX'] = (data_by_user['mx'].diff()**2).fillna(0)
    data_by_user['diffY'] = (data_by_user['my'].diff()**2).fillna(0)
    data_by_user['difference'] = data_by_user[['diffX', 'diffY']].sum(axis=1)

    n = 1
    data_by_user['gaze'] = 0
    for index, dif in data_by_user.iterrows():
        if (dif.loc['difference'].iloc[0] < 20000):
        
            data_by_user.at[index, 'gaze'] = n
        else:
            n += 1
            data_by_user.at[index, 'gaze'] = n

    data_by_user.columns = data_by_user.columns.get_level_values(0)

    gaze_centers = data_by_user.groupby(['gaze']).agg({'mx':['mean', 'min', 'max'], 'my':['mean', 'min', 'max']}).reset_index()
    gaze_centers.columns = ['gaze', 'xMean', 'xMin', 'xMax', 'yMean', 'yMin', 'yMax']
    gaze_centers['radius'] = 50 + ((gaze_centers['xMax']-gaze_centers['xMin'])**2 + (gaze_centers['yMax']-gaze_centers['yMin'])**2)**(1/2)

    return gaze_centers


    

