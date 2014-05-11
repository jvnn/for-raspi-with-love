import sys
import random
import glib, gobject
import pygst
pygst.require("0.10")
import gst

class Player:

    def __init__(self, songs):
        self.comm_interface = None
        self.songs = songs
        self.player = gst.Pipeline("player")
        self.radio = None
        source = gst.element_factory_make("filesrc", "file-source")
        decoder = gst.element_factory_make("mad", "mp3-decoder")
        conv = gst.element_factory_make("audioconvert", "converter")
        sink = gst.element_factory_make("alsasink", "alsa-output")

        self.player.add(source, decoder, conv, sink)
        gst.element_link_many(source, decoder, conv, sink)

        bus = self.player.get_bus()
        bus.add_signal_watch()
        bus.connect("message", self.__on_message)

    def set_comm_interface(self, comm_interface):
        self.comm_interface = comm_interface

    def play_random(self):
        self.__stop_radio()
        state = self.player.get_state()
        if state[1] != gst.STATE_PLAYING:
            song = self.songs[random.randint(0, len(self.songs)-1)]
            self.__start_playing(song)

    def stop_playing(self, report=True):
        self.__stop_radio()
        self.player.set_state(gst.STATE_NULL)
        if report and self.comm_interface:
            self.comm_interface("song:...")

    def next_song(self):
        self.stop_playing(False)
        self.play_random()

    def start_radio(self, uri, name):
        self.stop_playing(False)
        self.__stop_radio()
        self.radio = gst.Pipeline("radio")
        pbin = gst.element_factory_make("playbin", "playbin")
        self.radio.add(pbin)
        pbin.set_property("uri", uri)
        self.radio.set_state(gst.STATE_PLAYING)
        if self.comm_interface:
            self.comm_interface("song:{}".format(name))

    def __start_playing(self, song):
        self.player.get_by_name("file-source").set_property("location", song)
        self.player.set_state(gst.STATE_PLAYING)
        if self.comm_interface:
            self.comm_interface("song:{}".format(song))

    def __stop_radio(self):
        if self.radio:
            self.radio.set_state(gst.STATE_NULL)
            self.radio = None

    def __on_message(self, bus, message):
        t = message.type
        if t == gst.MESSAGE_EOS:
            # next song
            self.stop_playing(False)
            self.play_random()
        elif t == gst.MESSAGE_ERROR:
            self.stop_playing(False)
            self.play_random()
            err, debug = message.parse_error()
            print("error: " + str(err))



# Testing:
if __name__ == "__main__":
    player = Player(sys.argv[1].split(';'))
    player.play_random()
    gobject.threads_init()
    loop = glib.MainLoop()
    loop.run()
