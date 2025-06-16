require 'json'

index = Dir.glob("*", base: "docs").map{|m|
  /(.+).json.lz/ =~ m
  $1
}.reject{|n| n.nil? }

File.open("scripts/table.ts", "w").write("exports.table = #{index.to_json};")
puts "generate table with #{index.size} files"
