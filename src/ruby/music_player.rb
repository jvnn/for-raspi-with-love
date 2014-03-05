require 'gst'


class Player
  def initialize()
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
        puts "done playing"
        @player.stop
      end
      true
    end
  end

  def start_playing(song)
    @player.get_by_name("file-source").set_property("location", song)
    @player.play
  end
end

