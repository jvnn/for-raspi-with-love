require 'gst'


class Player
  def initialize(songs)
    @songs = songs
    @out_interface = nil
    Gst.init
    @radio = nil
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
        stop_playing(false)
        play_random()
      end
      true
    end
  end

  def play_random()
    stop_radio
    state = @player.get_state(1*Gst::SECOND)
    # I have no clue why this is "state[1]", and the docs won't tell me either...
    if state[1] != Gst::State::PLAYING
      song = @songs[Random.rand(@songs.length)]
      start_playing(song)
    end
  end

  def next_song()
    if @player.get_state(1*Gst::SECOND)[1] == Gst::State::PLAYING
      stop_playing(false)
      play_random()
    end
  end

  def stop_playing(report = true)
    stop_radio
    @player.stop
    if report and not @out_interface.nil?
      @out_interface.call("song:...")
    end
  end

  def set_interface(&data_interface)
    @out_interface = data_interface
  end

  def start_radio(uri)
    stop_playing(false)
    stop_radio
    @radio = Gst::Pipeline.new("pipeline")
    bin = Gst::ElementFactory.make("playbin", "playbin")
    @radio.add(bin)
    bin.set_property("uri", uri)
    @radio.play
    if not @out_interface.nil?
      @out_interface.call("song:#{uri}")
    end
  end

  private
  def start_playing(song)
    @player.get_by_name("file-source").set_property("location", song)
    if not @out_interface.nil?
      @out_interface.call("song:#{song}")
    end
    @player.play
  end

  def stop_radio()
    if not @radio.nil?
      @radio.stop
      @radio = nil
    end
  end
end

