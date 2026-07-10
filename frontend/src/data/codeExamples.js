export const languageOptions = [
    { value: 'curl', label: 'cURL' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'python', label: 'Python' },
    { value: 'php', label: 'PHP' },
    { value: 'golang', label: 'Go' },
    { value: 'java', label: 'Java' },
    { value: 'ruby', label: 'Ruby' },
];

export const codeExamples = {
    curl: {
        language: 'curl',
        title: 'cURL',
        code: `curl -x http://user:pass@1.2.3.4:8080 \\
  "https://api.proxy-judge.com/judge" \\
  -H "Accept: application/json"`,
    },
    javascript: {
        language: 'javascript',
        title: 'JavaScript',
        code: `const res = await fetch('https://api.proxy-judge.com/judge');
const data = await res.json();

console.log('Anonymity:', data.PROXY_ANONYMITY);
console.log('Location:', data.PROXY_CITY, data.PROXY_COUNTRY);
console.log('Time:', new Date(data.REQUEST_TIME * 1000));`,
    },
    nodejs: {
        language: 'nodejs',
        title: 'Node.js',
        code: `import { ProxyAgent } from 'undici';

const agent = new ProxyAgent('http://user:pass@1.2.3.4:8080');

const res = await fetch('https://api.proxy-judge.com/judge', {
  dispatcher: agent,
});
const data = await res.json();

console.log(\`\${data.PROXY_ANONYMITY} proxy in \${data.PROXY_CITY}, \${data.PROXY_COUNTRY}\`);`,
    },
    python: {
        language: 'python',
        title: 'Python',
        code: `import requests

proxies = {"https": "http://user:pass@1.2.3.4:8080"}

r = requests.get(
    "https://api.proxy-judge.com/judge",
    proxies=proxies,
    timeout=10,
)
data = r.json()

print(f"Anonymity: {data['PROXY_ANONYMITY']}")
print(f"Location:  {data['PROXY_CITY']}, {data['PROXY_COUNTRY']}")`,
    },
    php: {
        language: 'php',
        title: 'PHP',
        code: `<?php
$ch = curl_init('https://api.proxy-judge.com/judge');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_PROXY => 'http://1.2.3.4:8080',
    CURLOPT_PROXYUSERPWD => 'user:pass',
    CURLOPT_TIMEOUT => 10,
]);

$data = json_decode(curl_exec($ch), true);
curl_close($ch);

echo "Anonymity: {$data['PROXY_ANONYMITY']}\\n";
echo "Location:  {$data['PROXY_CITY']}, {$data['PROXY_COUNTRY']}\\n";`,
    },
    golang: {
        language: 'go',
        title: 'Go',
        code: `package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "net/url"
)

func main() {
    proxy, _ := url.Parse("http://user:pass@1.2.3.4:8080")
    client := &http.Client{
        Transport: &http.Transport{Proxy: http.ProxyURL(proxy)},
    }

    resp, err := client.Get("https://api.proxy-judge.com/judge")
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    var data map[string]any
    json.NewDecoder(resp.Body).Decode(&data)
    fmt.Println("Anonymity:", data["PROXY_ANONYMITY"])
}`,
    },
    java: {
        language: 'java',
        title: 'Java',
        code: `import java.net.*;
import java.net.http.*;

var proxy = ProxySelector.of(
    new InetSocketAddress("1.2.3.4", 8080));

var client = HttpClient.newBuilder()
    .proxy(proxy)
    .build();

var request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.proxy-judge.com/judge"))
    .header("Accept", "application/json")
    .GET()
    .build();

var response = client.send(request,
    HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`,
    },
    ruby: {
        language: 'ruby',
        title: 'Ruby',
        code: `require 'net/http'
require 'json'

uri = URI('https://api.proxy-judge.com/judge')

http = Net::HTTP.new(uri.host, uri.port,
                     '1.2.3.4', 8080, 'user', 'pass')
http.use_ssl = true

data = JSON.parse(http.get(uri).body)

puts "Anonymity: #{data['PROXY_ANONYMITY']}"
puts "Location:  #{data['PROXY_CITY']}, #{data['PROXY_COUNTRY']}"`,
    },
};
