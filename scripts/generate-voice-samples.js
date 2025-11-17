#!/usr/bin/env node

/**
 * Script to generate voice samples for all ElevenLabs voices
 * and save them to public/voice-samples/ folder
 * 
 * Usage: node scripts/generate-voice-samples.js
 * 
 * Requires ELEVENLABS_API_KEY environment variable
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Voice configurations matching the app with custom sample texts
const voices = [
  { 
    id: 'XrExE9yKIg1WjnnlVkGX', 
    name: 'Matilda', 
    description: 'Professional Female',
    sampleText: "Welcome to professional voice-over excellence. I'm Matilda, and I bring clarity, confidence, and a warm, engaging tone to every project. Whether you need corporate presentations, educational content, or compelling narratives, my voice delivers professionalism with a human touch. Let's create something remarkable together."
  },
  { 
    id: 'AZnzlk1XvdvUeBnXmlld', 
    name: 'Domi', 
    description: 'Strong Female',
    sampleText: "Powerful. Confident. Unforgettable. I'm Domi, and I bring strength and authority to every word. My voice commands attention, whether you're launching a bold new product, delivering an inspiring message, or creating content that demands to be heard. Ready to make an impact? Let's do this."
  },
  { 
    id: 'EXAVITQu4vr4xnSDxMaL', 
    name: 'Bella', 
    description: 'Soft Female',
    sampleText: "Hello there. I'm Bella, and I believe in the power of gentle, soothing communication. My voice brings warmth and comfort to your content, perfect for meditation guides, heartfelt stories, or any project that needs a calming, approachable presence. Sometimes, the softest voice makes the biggest impact."
  },
  { 
    id: 'ErXwobaYiN019PkySvjV', 
    name: 'Antoni', 
    description: 'Professional Male',
    sampleText: "Good day. I'm Antoni, a professional voice actor specializing in clear, articulate delivery. From corporate training videos to documentary narration, I bring expertise and reliability to every project. My voice is trusted by brands worldwide for its professional clarity and engaging presence. Let's elevate your content."
  },
  { 
    id: 'MF3mGyEYCl7XYWbV9V6O', 
    name: 'Elli', 
    description: 'Young Female',
    sampleText: "Hey! I'm Elli, and I'm all about bringing energy and authenticity to your projects. Whether it's a fun commercial, a trendy podcast, or content for younger audiences, my fresh, vibrant voice connects with listeners in a genuine way. Let's make something awesome together!"
  },
  { 
    id: 'TxGEqnHWrfWFTfGW9XjX', 
    name: 'Josh', 
    description: 'Deep Male',
    sampleText: "This is Josh. My deep, resonant voice brings gravitas and authority to your content. Perfect for dramatic narrations, powerful commercials, or any project that needs a commanding presence. When you need a voice that demands attention and leaves a lasting impression, I'm here to deliver."
  },
  { 
    id: 'VR6AewLTigWG4xSOukaG', 
    name: 'Arnold', 
    description: 'Strong Male',
    sampleText: "I'm Arnold, and I bring raw power and intensity to every project. My strong, assertive voice is perfect for action-packed content, motivational speeches, or any narrative that needs undeniable presence. When you need a voice that cuts through the noise and makes a statement, I'm your choice."
  },
  { 
    id: 'pNInz6obpgDQGcFmaJgB', 
    name: 'Adam', 
    description: 'Calm Male',
    sampleText: "Hello, I'm Adam. My calm, steady voice brings tranquility and trust to your content. Perfect for guided meditations, thoughtful documentaries, or any project that benefits from a soothing, reliable presence. Sometimes the most powerful messages are delivered with quiet confidence."
  },
]

// Get API key from environment
const API_KEY = process.env.ELEVENLABS_API_KEY

if (!API_KEY) {
  console.error('❌ Error: ELEVENLABS_API_KEY environment variable is not set')
  console.error('Please set it before running this script:')
  console.error('  export ELEVENLABS_API_KEY=your_api_key_here')
  console.error('  # or on Windows:')
  console.error('  set ELEVENLABS_API_KEY=your_api_key_here')
  process.exit(1)
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'public', 'voice-samples')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
  console.log(`✅ Created directory: ${outputDir}`)
}

/**
 * Generate a voice sample for a given voice ID
 */
async function generateVoiceSample(voice) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}`
  
  console.log(`\n🎤 Generating sample for ${voice.name} (${voice.description})...`)
  console.log(`   Sample text: "${voice.sampleText.substring(0, 60)}..."`)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text: voice.sampleText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    // Get audio as ArrayBuffer
    const audioBuffer = await response.arrayBuffer()
    
    // Save to file
    const filename = `${voice.id}.mp3`
    const filepath = path.join(outputDir, filename)
    fs.writeFileSync(filepath, Buffer.from(audioBuffer))
    
    const fileSize = (audioBuffer.byteLength / 1024).toFixed(2)
    console.log(`✅ Saved: ${filename} (${fileSize} KB)`)
    
    return { success: true, filename, fileSize, voiceName: voice.name }
  } catch (error) {
    console.error(`❌ Failed to generate sample for ${voice.name}:`, error.message)
    return { success: false, error: error.message, voiceName: voice.name }
  }
}

/**
 * Main function to generate all voice samples
 */
async function main() {
  console.log('🚀 Starting voice sample generation...')
  console.log(`📁 Output directory: ${outputDir}`)
  console.log(`🎯 Total voices: ${voices.length}`)
  console.log(`✨ Each voice has a unique, engaging sample text\n`)

  const results = []
  
  for (const voice of voices) {
    const result = await generateVoiceSample(voice)
    results.push({ voice: voice.name, ...result })
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')
  console.log('='.repeat(50))
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log(`✅ Successful: ${successful.length}/${voices.length}`)
  if (successful.length > 0) {
    successful.forEach(r => {
      console.log(`   ✓ ${r.voice} - ${r.filename} (${r.fileSize} KB)`)
    })
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/${voices.length}`)
    failed.forEach(r => {
      console.log(`   ✗ ${r.voice} - ${r.error}`)
    })
  }
  
  console.log('\n✨ Done! Voice samples are ready in public/voice-samples/')
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

