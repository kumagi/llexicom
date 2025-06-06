require 'json'
require 'workers'
require 'zlib'

all = Dir.glob("dict/en/ja/*")

words = all.select{|w|
  File.exist?("#{w}/data.json")
}.sort!

pool = Workers::Pool.new(on_exception: proc {|e|
                           puts "A worker encountered an exception: #{e.class}: #{e.message}"
                         })

words.each_slice(100) {|batch|
  pool.perform do
    jsons = batch.map{|w|
      JSON.parse(File.open("#{w}/data.json").read)
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
    File.open("bin/#{first_word}.json.lz", "w").write(Zlib::Deflate.deflate(merged.to_json))
  end
}

pool.dispose(30)
index = Dir.glob("*", base: "bin").map{|m|
  /(.*).json.br/ =~ m
  $1
}
File.open("index.json", "w").write(index.to_json)
