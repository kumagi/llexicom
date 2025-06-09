require 'json'
require 'workers'
require 'zlib'

def encode_filename(word)
  word.gsub(/[A-Z]/) { |c| "_#{c}_" }
end

def decode_filename(encoded)
  encoded.gsub(/_([A-Z])_/) { $1 }
end

all = Dir.glob("*", base: "dict/en/ja")

words = all.select{|w|
  File.exist?("dict/en/ja/#{w}/data.json")
}.sort!

words_decoded = words.inject({}){|result, w|
  key = decode_filename(w).downcase
  if result[key].nil?
    result[key] = []
  end
  result[key] << w
  result
}

`mkdir -p docs`
`rm -rf docs/*.json.lz`

targets = words_decoded.keys.sort

pool = Workers::Pool.new(on_exception: proc {|e|
                           puts "A worker encountered an exception: #{e.class}: #{e.message}"
                         })
targets.each_slice(100) {|batch|
  pool.perform do
    json = batch.inject({}){|result, w|
      jsons_for_word = words_decoded[w].map{|encoded_path|
        data = JSON.parse(File.open("dict/en/ja/#{encoded_path}/data.json").read)
        data = data[0] if data.class == Array
        #puts("processed dict/en/ja/#{encoded_path}/data.json")
        data
      }.reject{|n| n.nil?}
      result[w] = jsons_for_word
      result
    }
    first_word = json.keys.reject{|n| n.nil?}.sort[0]
    File.open("docs/#{first_word}.json.lz", "w").write(Zlib::Deflate.deflate(json.to_json))
  rescue => e
    pp e
  end
}

pool.dispose(30)
