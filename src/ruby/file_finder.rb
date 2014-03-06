
class FileFinder
  def get_full_dirs(dir, root)
    new_dirs = dir.select do |x| File.directory?(File.join(root, x)) end
    new_dirs.reject! do |x| ['.', '..'].include?(x) end
    new_dirs.map! do |x| File.join(root, x) end
  end

  def get_full_files(dir, root)
    new_files = dir.select do |x| File.file?(File.join(root, x)) end
    new_files.map! do |x| File.join(root, x) end
  end

  def dir_crawler(dirs, files, ending)
    matching = files.select do |f| File.extname(f) == ending end
    if dirs.empty?
      return matching
    end
    root = dirs[0]
    d = Dir.new(root)
    dirs += get_full_dirs(d, root)
    new_files = get_full_files(d, root)
    matching += dir_crawler(dirs[1..-1], new_files, ending)
    return matching
  end

  def get_files(root_path, ending)
    d = Dir.new(root_path)
    dirs = get_full_dirs(d, root_path)
    files = get_full_files(d, root_path)
    dir_crawler(dirs, files, ending)
  end
end

# finder = FileFinder.new
# puts finder.get_files(ARGV[0], '.mp3')
