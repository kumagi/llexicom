require 'faraday'
require 'json'

key = JSON.parse(File.open("secret.json").read)["gemini_key"]

class GeminiClient
  def initialize(key)
    @key = key
    @conn = Faraday.new(url: "https://generativelanguage.googleapis.com",
                        headers: {'Content-Type' => 'application/json'})
    @conn.options.timeout = 3000
  end

  def prompt(query)
    result = request(query)
    JSON.parse(result["candidates"][0]["content"]["parts"][0]["text"])
  rescue => e
    print("failed to parse #{e}: #{result}")
    pp result
  end


  private
  def sample_inputs(num=-1)
    `ls example`
    files = `ls example`.split("\n").grep(/json$/)
    words = files.map{|f|
      /(.*).json/ =~ f
      $1
    }

    words.map{|w|
      [
        {
          role: "user",
          parts: [
            text: w
          ]
        },
        {
          role:  "model",
          parts: [
            text: JSON.parse(File.open("example/#{w}.json").read).to_json
          ]
        }
      ]
    }.reduce([], :concat).flatten[0...num*2]
  end

  def request(query)
    contents = sample_inputs(3) + [
      role: "user",
      parts: [
        text: query
      ]
    ]
    body = {
      contents: contents,
      generationConfig: {
        responseMimeType: "application/json",
        #        responseSchema: JSON.parse(File.open("schema.json").read)["schema"],
        temperature: 0.4
      },
      systemInstruction: {
        role: "system",
        parts: [
          text: "Output Japanese translated word description for dictionary. Please fill JSON fields as many as posssible."
        ]
      }
    }
    #target = "/v1beta/models/gemini-2.5-flash-preview-05-20"
    target = "/v1beta/models/gemini-2.0-flash"
    resp = @conn.post("#{target}:generateContent?key=#{@key}"){|req|
      req.body = body.to_json
    }
    JSON.parse(resp.body)
  end
end

all = `ls dict/en/ja/`.split("\n")
words = all.reject{|w|
  File.exist?("dict/en/ja/#{w}/data.json")
}
words.shuffle!

workers = []
m = Mutex.new

workers = 10.times.map {
  Thread.new {
    cli = GeminiClient.new(key)
    loop do
      m.lock
      if words.length == 0
        m.unlock
        break
      end
      word = words.pop
      m.unlock

      retried = 0
      begin
        dest = "dict/en/ja/#{word}/data.json"
        if File.exist?(dest)
          next
        end
        data = cli.prompt(word)
        puts word
        puts data.to_json
        File.open("dict/en/ja/#{word}/data.json", "w") {|f|
          f.write(data.to_json)
        }
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
