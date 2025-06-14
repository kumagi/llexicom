require 'json'

def encode_filename(word)
  word.gsub(/[A-Z]/) { |c| "_#{c}_" }
end

def decode_filename(encoded)
  encoded.gsub(/_([A-Z])_/) { $1 }
end

CORRECTED="corrected.json"
BASE="dict/en/ja"

def build(client_constructor, parallels = 30)

  all = Dir.glob("*", base: BASE).sort
  words = all.reject {|w|
    File.exist?("#{BASE}/#{w}/data.json")
  }
  words.shuffle!
  puts "#{words.size} words left"
  
  workers = []
  corrected = {}
  if File.exist?(CORRECTED)
    corrected = JSON.parse(File.read(CORRECTED))
  end

  begin
    workers = parallels.times.map {
      Thread.new {
        cli = client_constructor.call
        loop do
          if words.length == 0
            break
          end
          word = words.pop

          retried = 0
          begin
            dest = "#{BASE}/#{word}/data.json"
            next if File.exist?(dest)
            decoded_word = decode_filename(word)
            data = cli.prompt(decoded_word)
            if data['word'] != decoded_word
              puts "#{decoded_word} vs #{data['word']} unmatch"
              new_path = "#{BASE}/#{encode_filename(data['word'])}"
              unless File.exist?("#{new_path}/data.json")
                `mkdir -p '#{new_path}'`
                `touch #{new_path}/.keep`
                File.open("#{new_path}/data.json", "w").write(data.to_json)
                puts "wrote #{new_path}"
              end
              `rm -rf #{BASE}/#{word}`
              corrected[decoded_word] = data['word'] if data['word']
              next
            end
            File.open("#{BASE}/#{word}/data.json", "w").write(data.to_json)
            puts "fetched #{word}"
          rescue => e
            pp e
            pp e.backtrace
            retried += 1
            if retried < 6
              puts "retrying #{word} as #{e}"
              retry
            end
            puts "compromised #{word}"
          end
        end
      }
    }
    workers.each{|w| w.join }
  ensure
    File.open(CORRECTED, "w").write(corrected.to_json)
  end
end 
