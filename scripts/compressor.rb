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
  pp key
  if result[key].nil?
    result[key] = []
  end
  result[key] << w
  result
}

pp words_decoded
exit

`mkdir -p docs`

pool = Workers::Pool.new(on_exception: proc {|e|
                           puts "A worker encountered an exception: #{e.class}: #{e.message}"
                         })
words.each_slice(100) {|batch|
  pool.perform do
    jsons = batch.map{|w|
      result = JSON.parse(File.open("dict/en/ja/#{w}/data.json").read)
      if result.nil?
        puts "failed to parse #{w}"
      end
      result
    }.reject{|n|
      n.nil?
    }
    merged = jsons.inject({}) {|result, data|
      if data.class == Array
        data = data[0]
      end
      result[data['word']] = data
      result
    }
    first_word = jsons[0]['word']
    File.open("docs/#{first_word}.json.lz", "w").write(Zlib::Deflate.deflate(merged.to_json))
  end
}

pool.dispose(30)
index = Dir.glob("*", base: "docs").map{|m|
  /(.*).json.lz/ =~ m
  $1
}

File.open("scripts/table.ts", "w").write("exports.table = #{index.to_json};")
