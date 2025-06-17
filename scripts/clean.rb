require 'json'
require 'fileutils'

BASE="dict/en/ja"
words = Dir.glob("*", base: BASE).sort
exists = words.clone.select {|w|
  File.exist?("#{BASE}/#{w}/data.json")
}

def encode_filename(word)
  word.gsub(/[A-Z]/) { |c| "_#{c}_" }
end

exists.each{|w|
  begin
    filename = "#{BASE}/#{w}/data.json"
    result = JSON.parse(File.open(filename).read)
    if result['word'].nil? or result['word'].empty?
      puts "invalid #{w}"
      raise RuntimeException.new("word field doesn't exists")
    end

    correct_filename = encode_filename(result['word'])
    if correct_filename == w
      next
    end
    puts "#{w} vs #{correct_filename} unmatched"

    new_path = "#{BASE}/#{correct_filename}"
    new_datafile = "#{new_path}/data.json"
    if File.exist?(new_path)
      begin
        content = JSON.parse(File.open(new_datafile).read)
        puts "valid content already exists in #{content['word']}"
      rescue => e
        puts "something wrong with #{new_datafile} #{e}"
        Fileutils.mkdir_p(new_path)
        File.open(new_datafile, "w").write(result.to_json)
        puts "replaced #{new_datafile} with content of #{filename}"
      end
    end
    puts "#{w} should be stored #{correct_filename}"
    FileUtils.rm_rf("#{BASE}/#{w}")
    puts "rm -rf '#{BASE}/#{w}'"
    FileUtils.mkdir_p(new_path)
    FileUtils.touch("#{new_path}/.keep")
    File.open("#{new_path}/data.json", "w").write(result.to_json)
  rescue => e
    puts "cannot read #{w} #{e} #{File.open(filename).read.size}"
    FileUtils.rm_rf(filename)
  end
}
