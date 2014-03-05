require 'glib2'
require 'socket'
require './music_player'

class Controller
  def initialize()
    @server = TCPServer.new(8989)
  end

  def run()
    serverchan = GLib::IOChannel.new(@server)
    serverchan.add_watch(GLib::IOChannel::IN) do |chan, cond|
      @client = @server.accept
      clientchan = GLib::IOChannel.new(@client)
      clientchan.add_watch(GLib::IOChannel::IN) do |chan, cond|
        case cond
        when GLib::IOChannel::IN
          data = @client.gets
          if data == nil
            puts "lost connection"
            @client.close
            false
          else
            puts data
            true
          end
        end
      end
      true
    end
    
    player = Player.new
    player.start_playing(ARGV[0])
    loop = GLib::MainLoop.new(nil, false)
    loop.run
  end
end

ctrl = Controller.new
ctrl.run
