import pandas as pd
def get_data_from_csv(filename):
    df_data = pd.read_csv(filename, encoding='latin1', sep='\t')
    return df_data.to_json()

    

