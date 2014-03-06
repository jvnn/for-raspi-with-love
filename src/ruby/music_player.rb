require 'gst'


class Player
  def initialize(songs)
    @songs = songs
    Gst.init
    @player = Gst::Pipeline.new("pipeline")
    source = Gst::ElementFactory.make("filesrc", "file-source")
    decoder = Gst::ElementFactory.make("mad", "mp3-decoder")
    conv = Gst::ElementFactory.make("audioconvert", "converter")
    sink = Gst::ElementFactory.make("alsasink", "alsa-output")
    @player.add(source, decoder, conv, sink)
    source >> decoder >> conv >> sink
    bus = @player.bus
    bus.add_watch do |bus, message|
      case message.type
      when Gst::MessageType::EOS
        # next song
        stop_playing()
        play_random()
      end
      true
    end
  end

  def play_random()
    state = @player.get_state(1*Gst::SECOND)
    # I have no clue why this is "state[1]", and the docs won't tell me either...
    if state[1] != Gst::State::PLAYING
      song = @songs[Random.rand(@songs.length)]
      start_playing(song)
    end
  end

  def next_song()
    if @player.get_state(1*Gst::SECOND)[1] == Gst::State::PLAYING
      stop_playing()
      play_random()
    end
  end

  def stop_playing()
    @player.stop
  end

  private
  def start_playing(song)
    @player.get_by_name("file-source").set_property("location", song)
    @player.play
  end
end

