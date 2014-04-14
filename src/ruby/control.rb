require 'glib2'
require 'socket'
require './music_player'
require './file_finder'

# change this to something less hard-coded later...
RADIO_URI = 'http://liferadio.liwest.at:8000/liferadio2'

class Controller
  def initialize()
    @server = TCPServer.new(8989)
    file_finder = FileFinder.new
    songs = file_finder.get_files(ARGV[0], '.mp3')
    if songs.empty?
      puts "No songs found from directory " + ARGV[0]
      exit(1)
    end
    @player = Player.new(songs)
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
            handle_command(data.strip)
            true
          end
        end
      end
      @player.set_interface do |data|
        if not @client.closed?
          @client.write(data)
        end
      end
      true
    end
    
    loop = GLib::MainLoop.new(nil, false)
    loop.run
  end

  private
  def handle_command(data)
    category, cmd, param = data.split
    case category
    when "music"
      case cmd
      when "play"
        @player.play_random
      when "stop"
        @player.stop_playing
      when "next"
        @player.next_song
      when "radio"
        @player.start_radio RADIO_URI
      else
        puts "Ruby controller: invalid command for music category: " + cmd
      end
    when "timeout"
      case cmd
      when "music"
        time_s = param.to_i
        GLib::Timeout.add_seconds(time_s) do
          @player.stop_playing
          false
        end
      else
        puts "Ruby controller: invalid command for timeout category: " + cmd
      end
    else
      puts "Ruby controller: invalid category: " + category
    end
  end
end

if ARGV.length != 1
  puts "Usage: ruby control.rb <music_directory>"
  exit(1)
end

ctrl = Controller.new
ctrl.run
