import os

def get_song_listing(root, ending):

    files = [os.path.join(root, x) for x in os.listdir(root) \
             if os.path.isfile(os.path.join(root, x)) and x.endswith(ending)]
    dirs = [os.path.join(root, x) for x in os.listdir(root) \
            if os.path.isdir(os.path.join(root, x))]

    for directory in dirs:
        files.extend(get_song_listing(directory, ending))

    return files



# Testing:
if __name__ == "__main__":
    import sys
    print(get_song_listing(sys.argv[1], '.mp3'))
