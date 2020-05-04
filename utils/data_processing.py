import pandas as pd
def get_users_for_stimuli(filename,stimuli):
    df_data = pd.read_csv(filename, encoding='latin1', sep='\t')
    mask = df_data['StimuliName'] == stimuli
    return df_data[mask]['user'].unique().tolist()


def get_stimuli_from_csv(filename):
    df_data = pd.read_csv(filename, encoding='latin1', sep='\t')
    return df_data['StimuliName'].unique()

    

