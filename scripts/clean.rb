require 'json'

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
    if encode_filename(result['word']) == w
      next
    end

    if result['word'].nil? or result['word'].empty?
      puts "invalid #{w}"
      raise RuntimeException
      end
    puts "#{w} vs #{result['word']} unmatched"
    new_path = "#{BASE}/#{result['word']}"
    puts "#{w} should be stored #{new_path}"
    #`rm -rf #{BASE}/#{w}`
    #`mkdir -p #{new_path}`
    #`touch #{new_path}/.keep`
    #File.open("#{new_path}/data.json", "w").write(result.to_json)
  rescue
    puts "cannot read #{w}"
    #`rm -rf #{BASE}/#{w}/data.json`
  end
}
