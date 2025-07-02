'use client'

import { useState } from 'react';

export default function Home() {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('curl');

    // Language options for the selector
    const languageOptions = [
        { value: 'curl', label: 'cURL', icon: '🌐' },
        { value: 'javascript', label: 'JavaScript (Browser)', icon: '🟨' },
        { value: 'nodejs', label: 'Node.js', icon: '🟢' },
        { value: 'python', label: 'Python', icon: '🐍' },
        { value: 'php', label: 'PHP', icon: '🔵' },
        { value: 'golang', label: 'Go', icon: '🔷' },
        { value: 'java', label: 'Java', icon: '☕' },
        { value: 'ruby', label: 'Ruby', icon: '💎' }
    ];

    // Code examples object
    const codeExamples = {
        curl: {
            language: 'curl',
            title: 'cURL',
            code: `curl -X GET "https://proxy-judge.com/api/judge" \\
  -H "Accept: application/json" \\
  -H "User-Agent: MyApp/1.0"`
        },
        javascript: {
            language: 'javascript',
            title: 'JavaScript (Browser)',
            code: `// Using fetch API
fetch('https://proxy-judge.com/api/judge')
  .then(response => response.json())
  .then(data => {
    console.log('Anonymity Level:', data.PROXY_ANONYMITY);
    console.log('Country:', data.PROXY_COUNTRY);
    console.log('City:', data.PROXY_CITY);
    console.log('Request Time:', new Date(data.REQUEST_TIME * 1000));
    
    // Display results in your app
    document.getElementById('result').innerHTML = 
      \`Your proxy is \${data.PROXY_ANONYMITY.toLowerCase()} from \${data.PROXY_CITY}, \${data.PROXY_COUNTRY}\`;
  })
  .catch(error => console.error('Error:', error));`
        },
        nodejs: {
            language: 'javascript',
            title: 'Node.js (axios)',
            code: `const axios = require('axios');

async function analyzeProxy() {
  try {
    const config = {
      method: 'GET',
      url: 'https://proxy-judge.com/api/judge',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MyApp/1.0'
      },
      timeout: 10000
    };
    
    const response = await axios(config);
    
    const { 
      PROXY_ANONYMITY, 
      PROXY_COUNTRY, 
      PROXY_CITY,
      REQUEST_TIME,
      REQUEST_TIME_FLOAT 
    } = response.data;
    
    console.log('\\n=== Proxy Analysis Results ===');
    console.log(\`Anonymity Level: \${PROXY_ANONYMITY}\`);
    console.log(\`Location: \${PROXY_CITY}, \${PROXY_COUNTRY}\`);
    console.log(\`Timestamp: \${new Date(REQUEST_TIME * 1000).toISOString()}\`);
    console.log(\`Precise Time: \${REQUEST_TIME_FLOAT}\`);
    
    return response.data;
    
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// Usage
analyzeProxy()
  .then(data => console.log('Success:', data))
  .catch(err => console.log('Failed:', err.message));`
        },
        python: {
            language: 'python',
            title: 'Python',
            code: `import requests
import json
from datetime import datetime

# Make the request
url = 'https://proxy-judge.com/api/judge'
headers = {
    'User-Agent': 'MyApp/1.0',
    'Accept': 'application/json'
}

try:
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    
    data = response.json()
    
    print(f"Proxy Analysis Results:")
    print(f"  Anonymity: {data['PROXY_ANONYMITY']}")
    print(f"  Country: {data['PROXY_COUNTRY']}")
    print(f"  City: {data['PROXY_CITY']}")
    print(f"  Timestamp: {datetime.fromtimestamp(data['REQUEST_TIME'])}")
    
except requests.RequestException as e:
    print(f"Error: {e}")
except KeyError as e:
    print(f"Missing field in response: {e}")`
        },
        php: {
            language: 'php',
            title: 'PHP',
            code: `<?php
function analyzeProxy() {
    $url = 'https://proxy-judge.com/api/judge';
    
    // Initialize cURL
    $ch = curl_init();
    
    // Set cURL options
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'User-Agent: MyApp/1.0'
        ]
    ]);
    
    // Execute request
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    // Handle errors
    if ($error) {
        throw new Exception("cURL Error: " . $error);
    }
    
    if ($httpCode !== 200) {
        throw new Exception("HTTP Error: " . $httpCode);
    }
    
    // Parse JSON response
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON Parse Error: " . json_last_error_msg());
    }
    
    return $data;
}

// Usage
try {
    $result = analyzeProxy();
    
    echo "=== Proxy Analysis Results ===\\n";
    echo "Anonymity: " . $result['PROXY_ANONYMITY'] . "\\n";
    echo "Country: " . $result['PROXY_COUNTRY'] . "\\n";
    echo "City: " . $result['PROXY_CITY'] . "\\n";
    echo "Timestamp: " . date('Y-m-d H:i:s', $result['REQUEST_TIME']) . "\\n";
    echo "Precise Time: " . $result['REQUEST_TIME_FLOAT'] . "\\n";
    
    // Convert to JSON for API response
    header('Content-Type: application/json');
    echo json_encode($result, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>`
        },
        golang: {
            language: 'go',
            title: 'Go',
            code: `package main

import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"
)

type ProxyResponse struct {
    ProxyCountry    string  \`json:"PROXY_COUNTRY"\`
    ProxyCity       string  \`json:"PROXY_CITY"\`
    ProxyAnonymity  string  \`json:"PROXY_ANONYMITY"\`
    RequestTime     int64   \`json:"REQUEST_TIME"\`
    RequestTimeFloat float64 \`json:"REQUEST_TIME_FLOAT"\`
}

func analyzeProxy() (*ProxyResponse, error) {
    client := &http.Client{
        Timeout: 10 * time.Second,
    }
    
    req, err := http.NewRequest("GET", "https://proxy-judge.com/api/judge", nil)
    if err != nil {
        return nil, fmt.Errorf("creating request: %w", err)
    }
    
    req.Header.Set("Accept", "application/json")
    req.Header.Set("User-Agent", "MyApp/1.0")
    
    resp, err := client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("making request: %w", err)
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
    }
    
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return nil, fmt.Errorf("reading response: %w", err)
    }
    
    var result ProxyResponse
    if err := json.Unmarshal(body, &result); err != nil {
        return nil, fmt.Errorf("parsing JSON: %w", err)
    }
    
    return &result, nil
}

func main() {
    result, err := analyzeProxy()
    if err != nil {
        fmt.Printf("Error: %v\\n", err)
        return
    }
    
    fmt.Println("=== Proxy Analysis Results ===")
    fmt.Printf("Anonymity: %s\\n", result.ProxyAnonymity)
    fmt.Printf("Location: %s, %s\\n", result.ProxyCity, result.ProxyCountry)
    fmt.Printf("Timestamp: %s\\n", time.Unix(result.RequestTime, 0).Format(time.RFC3339))
    fmt.Printf("Precise Time: %.3f\\n", result.RequestTimeFloat)
}`
        },
        java: {
            language: 'java',
            title: 'Java',
            code: `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ProxyAnalyzer {
    
    public static class ProxyResponse {
        @JsonProperty("PROXY_COUNTRY")
        public String proxyCountry;
        
        @JsonProperty("PROXY_CITY")
        public String proxyCity;
        
        @JsonProperty("PROXY_ANONYMITY")
        public String proxyAnonymity;
        
        @JsonProperty("REQUEST_TIME")
        public long requestTime;
        
        @JsonProperty("REQUEST_TIME_FLOAT")
        public double requestTimeFloat;
    }
    
    public static ProxyResponse analyzeProxy() throws Exception {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
            
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://proxy-judge.com/api/judge"))
            .header("Accept", "application/json")
            .header("User-Agent", "MyApp/1.0")
            .timeout(Duration.ofSeconds(10))
            .GET()
            .build();
            
        HttpResponse<String> response = client.send(request, 
            HttpResponse.BodyHandlers.ofString());
            
        if (response.statusCode() != 200) {
            throw new RuntimeException("API returned status: " + response.statusCode());
        }
        
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(response.body(), ProxyResponse.class);
    }
    
    public static void main(String[] args) {
        try {
            ProxyResponse result = analyzeProxy();
            
            System.out.println("=== Proxy Analysis Results ===");
            System.out.println("Anonymity: " + result.proxyAnonymity);
            System.out.println("Location: " + result.proxyCity + ", " + result.proxyCountry);
            System.out.println("Timestamp: " + Instant.ofEpochSecond(result.requestTime));
            System.out.println("Precise Time: " + result.requestTimeFloat);
            
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}`
        },
        ruby: {
            language: 'ruby',
            title: 'Ruby',
            code: `require 'net/http'
require 'json'
require 'uri'
require 'time'

class ProxyAnalyzer
  API_URL = 'https://proxy-judge.com/api/judge'.freeze
  
  def self.analyze_proxy
    uri = URI(API_URL)
    
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 10
    http.read_timeout = 10
    
    request = Net::HTTP::Get.new(uri)
    request['Accept'] = 'application/json'
    request['User-Agent'] = 'MyApp/1.0'
    
    response = http.request(request)
    
    unless response.code == '200'
      raise "API returned status: #{response.code}"
    end
    
    JSON.parse(response.body)
    
  rescue Net::TimeoutError => e
    raise "Request timeout: #{e.message}"
  rescue JSON::ParserError => e
    raise "Invalid JSON response: #{e.message}"
  rescue StandardError => e
    raise "Error analyzing proxy: #{e.message}"
  end
  
  def self.format_results(data)
    timestamp = Time.at(data['REQUEST_TIME'])
    
    puts "=== Proxy Analysis Results ==="
    puts "Anonymity: #{data['PROXY_ANONYMITY']}"
    puts "Country: #{data['PROXY_COUNTRY']}"
    puts "City: #{data['PROXY_CITY']}"
    puts "Timestamp: #{timestamp.strftime('%Y-%m-%d %H:%M:%S %Z')}"
    puts "Precise Time: #{data['REQUEST_TIME_FLOAT']}"
    
    data
  end
end

# Usage
begin
  result = ProxyAnalyzer.analyze_proxy
  ProxyAnalyzer.format_results(result)
  
  # Convert to JSON for API response
  puts "\\nJSON Response:"
  puts JSON.pretty_generate(result)
  
rescue => e
  puts "Error: #{e.message}"
  exit 1
end`
        }
    };

    const copyToClipboard = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedCode(id);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const CodeBlock = ({ code, language, id, title }) => (
        <div className="glass-dark rounded-2xl p-6 shadow-xl hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                    <div className={`w-8 h-8 mr-3 rounded-lg bg-gradient-to-r flex items-center justify-center ${language === 'curl' ? 'from-blue-500 to-cyan-500' :
                        language === 'javascript' ? 'from-yellow-400 to-amber-500' :
                            language === 'python' ? 'from-purple-500 to-pink-500' :
                                language === 'php' ? 'from-indigo-500 to-purple-600' :
                                    language === 'go' ? 'from-cyan-400 to-blue-500' :
                                        language === 'java' ? 'from-orange-500 to-red-500' :
                                            language === 'ruby' ? 'from-red-500 to-pink-500' :
                                                'from-gray-500 to-gray-600'
                        }`}>
                        {language === 'curl' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                        {language === 'javascript' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                        {language === 'python' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                        {language === 'php' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M7.003 3l2.175 12h4.31l1.723-10.13H17.5l-.85 5.13h-1.81l.4-2.41h-1.81l-.79 4.82H9.28L7.003 3zm0 18l2.175-12h4.31l-1.723 10.13H9.456l.85-5.13h1.81l-.4 2.41h1.81l.79-4.82H17.72L19.997 21H7.003z" />
                            </svg>
                        )}
                        {language === 'go' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.059-.117.059H1.811zM.047 11.306c-.047 0-.058-.024-.035-.059l.245-.316c.024-.035.082-.058.129-.058h5.516c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.082-.105.082H.047zM2.828 12.394c-.047 0-.059-.035-.035-.07l.175-.292c.023-.035.070-.059.116-.059h4.764c.047 0 .082.035.082.082l-.023.245c0 .047-.035.082-.082.082H2.828zM21.5 6.915l-3.5 1.166-3.5-1.166 3.5-1.166L21.5 6.915zM12 7.732c0 .47-.387.852-.864.852H9.432c-.476 0-.864-.382-.864-.852V5.268c0-.47.388-.852.864-.852h1.704c.477 0 .864.382.864.852v2.464z" />
                            </svg>
                        )}
                        {language === 'java' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639" />
                            </svg>
                        )}
                        {language === 'ruby' && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926.028 14.065 8.1 3.716l11.894-3.62-.002-.013zM7.91 17.417c-.1-.1-.148-.26-.148-.26s-.31.26-.61.26a1.3 1.3 0 01-1.299-1.299c0-.5.4-1.1.8-1.1.19 0 .4.09.5.19.19.19.3.4.3.64 0 .26-.1.47-.31.64-.14.14-.24.149-.23-.06zm4.439-1.439c-.2-.3-.4-.6-.7-.8a1.15 1.15 0 00-.8-.3c-.3 0-.6.1-.8.3-.3.3-.5.7-.5 1.1 0 .4.2.8.5 1.1.3.3.6.4 1 .4.3 0 .6-.1.8-.3.3-.3.5-.7.5-1.1 0-.2-.1-.3-.1-.4zm2.399.54c0-.4-.1-.8-.4-1.1-.2-.2-.5-.3-.8-.3s-.6.1-.8.3c-.2.2-.3.5-.3.8 0 .4.1.7.3 1 .2.2.5.3.8.3.4 0 .7-.1 1-.4.2-.3.3-.6.2-.6zm-7.659-8.138L16.42 5.87c.258-.194.306-.556.11-.814-.02-.026-.04-.051-.063-.074L12.76 1.277c-.194-.194-.51-.194-.705 0L8.35 4.983c-.194.194-.194.51 0 .705l.01.01zm2.53 1.777c-.26-.26-.68-.26-.94 0-.26.26-.26.68 0 .94.26.26.68.26.94 0 .26-.26.26-.68 0-.94z" />
                            </svg>
                        )}
                    </div>
                    {title}
                </h3>
                <button
                    onClick={() => copyToClipboard(code, id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1 ${copiedCode === id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
                        }`}
                >
                    {copiedCode === id ? (
                        <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <div className="bg-gray-900/60 rounded-xl p-4 border border-gray-700/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <pre className="text-green-400 font-mono text-sm leading-relaxed overflow-x-auto relative z-10">
                    <code>{code}</code>
                </pre>
            </div>
        </div>
    );

    const testEndpoint = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/judge');
            const data = await res.json();
            setResponse(data);
        } catch (error) {
            console.error('Error:', error);
            setResponse({ error: 'Failed to fetch data' });
        }
        setLoading(false);
    };

    // Get selected example
    const selectedExample = codeExamples[selectedLanguage];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            <main className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center items-center">
                {/* Hero Section */}
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-pulse-slow leading-tight pb-4">
                        Proxy Judge
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Analyze your proxy connection and get detailed information about anonymity level, location, and performance.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
                    {/* API Information Card */}
                    <div className="glass-dark rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-white">API Endpoint</h2>
                        </div>

                        <div className="bg-gray-900/50 rounded-xl p-4 mb-6 border border-gray-700">
                            <code className="text-green-400 font-mono text-lg">/api/judge</code>
                        </div>

                        <p className="text-blue-200 mb-6 text-lg">
                            Make a GET request to this endpoint to receive comprehensive proxy analysis data.
                        </p>

                        <button
                            onClick={testEndpoint}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Testing...
                                </div>
                            ) : (
                                'Test Endpoint'
                            )}
                        </button>
                    </div>

                    {/* Response Format Card */}
                    <div className="glass-dark rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-white">Response Format</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <div>
                                    <span className="text-blue-400 font-mono font-semibold">PROXY_COUNTRY:</span>
                                    <span className="text-gray-300 ml-2">ISO country code (e.g., "ES", "US")</span>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <div>
                                    <span className="text-purple-400 font-mono font-semibold">PROXY_CITY:</span>
                                    <span className="text-gray-300 ml-2">City name (e.g., "Madrid", "New York")</span>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <div>
                                    <span className="text-green-400 font-mono font-semibold">PROXY_ANONYMITY:</span>
                                    <span className="text-gray-300 ml-2">Level - "TRANSPARENT", "ANONYMOUS", or "ELITE"</span>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <div>
                                    <span className="text-yellow-400 font-mono font-semibold">REQUEST_TIME_FLOAT:</span>
                                    <span className="text-gray-300 ml-2">Precise timestamp with decimals</span>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-3 h-3 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                <div>
                                    <span className="text-pink-400 font-mono font-semibold">REQUEST_TIME:</span>
                                    <span className="text-gray-300 ml-2">Integer timestamp</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Response Display */}
                {response && (
                    <div className="mt-8 w-full max-w-4xl animate-fade-in">
                        <div className="glass-dark rounded-3xl p-8 shadow-2xl">
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                API Response
                            </h3>
                            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 overflow-x-auto">
                                <pre className="text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                    {JSON.stringify(response, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}

                {/* Usage Examples */}
                <div className="mt-12 w-full max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                        <h2 className="text-4xl font-bold text-white mb-4 md:mb-0">
                            Usage Examples
                        </h2>

                        {/* Language Selector */}
                        <div className="relative">
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="appearance-none bg-gray-800/80 backdrop-blur-sm border border-gray-600 text-white px-4 py-3 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/80 text-lg font-medium min-w-[200px]"
                            >
                                {languageOptions.map((option) => (
                                    <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                                        {option.icon} {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Selected Language Example */}
                    <div className="w-full max-w-4xl mx-auto">
                        <CodeBlock
                            id={selectedLanguage}
                            language={selectedExample.language}
                            title={selectedExample.title}
                            code={selectedExample.code}
                        />
                    </div>
                </div>
            </main>

            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
        </div>
    );
} 