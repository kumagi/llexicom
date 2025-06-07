require 'json'
require 'workers'
require 'zlib'

all = Dir.glob("dict/en/ja/*")

words = all.select{|w|
  File.exist?("#{w}/data.json")
}.sort!
`mkdir -p docs`

pool = Workers::Pool.new(on_exception: proc {|e|
                           puts "A worker encountered an exception: #{e.class}: #{e.message}"
                         })

words.each_slice(100) {|batch|
  pool.perform do
    jsons = batch.map{|w|
      result = JSON.parse(File.open("#{w}/data.json").read)
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
