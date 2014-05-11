import sys
import glib, gobject
import socket
import json
import music_player
import file_lister

MUSIC_CONFIG_FILE = 'music_conf.json'

class Controller:

    def __init__(self):
        self.client = None

        with open(MUSIC_CONFIG_FILE, 'r') as f:
            conf = json.load(f)
            self.radio_uris = {}
            for radio_uri in conf["radio_uris"]:
                self.radio_uris[radio_uri["name"]] = radio_uri["uri"]
        self.songs = file_lister.get_song_listing(sys.argv[1], '.mp3')
        if not self.songs:
            print("Error: No songs found from directory " + sys.argv[1])
            sys.exit(1)
        self.player = music_player.Player(self.songs)
        self.player.set_comm_interface(self.__music_player_callback)

    def run(self):
        # set up the control socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.bind(('', 8989))
        sock.listen(1)
        glib.io_add_watch(sock, glib.IO_IN, self.__accept_listener)
        gobject.threads_init()
        loop = glib.MainLoop()
        loop.run()

    def __accept_listener(self, sock, *args):
        self.client, addr = sock.accept()
        glib.io_add_watch(self.client, glib.IO_IN, self.__data_listener)
        return True
        
    def __data_listener(self, conn, *args):
        data = conn.recv(4096)
        if not len(data):
            print("Python controller: data connection closed")
            self.client = None
            return False
        else:
            self.__handle_command(data.strip())
            return True

    def __handle_command(self, data):
        parts = data.split(' ', 2)
        if len(parts) < 2 or len(parts) > 3:
            print("Python controller: ivalid data: {}".format(data))
            return
        elif len(parts) == 2:
            parts.append(None)
        (category, cmd, param) = parts
        
        if category == "music":
            if cmd == "play":
                self.player.play_random()
            elif cmd == "stop":
                self.player.stop_playing()
            elif cmd == "next":
                self.player.next_song()
            elif cmd == "radio" and self.radio_uris.has_key(param):
                self.player.start_radio(self.radio_uris[param], param)
            else:
                print("Python controller: invalid command for music category: {}".
                      format(cmd))
        elif category == "timeout":
            if cmd == "music":
                time_s = int(param)
                glib.timeout_add_seconds(time_s, self.__music_player_timeout)
            else:
                print("Python controller: invalid command for timeout category: {}".
                      format(cmd))
        else:
            print("Python controller: invalid category: {}".format(category))


    def __music_player_callback(self, msg):
        if self.client:
            self.client.send(msg)

    def __music_player_timeout(self):
        self.player.stop_playing()
        return False

if __name__ == "__main__":
    ctrl = Controller()
    ctrl.run()
        
