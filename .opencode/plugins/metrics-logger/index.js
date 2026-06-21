// metrics-logger plugin - Automatically log AI usage metrics to Obsidian
// Captures token usage after each message/tool completion

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

const OBSIDIAN_PATH = 'D:/Dev/tools/DBObsidian/resume-app'
const SCRIPTS_PATH = '.opencode/scripts'

// Track current agent context
let currentAgent = 'unknown'
let currentTask = 'ai-request'
let currentModel = 'unknown'
let sessionTokens = 0
let sessionRequests = 0
let messageStartTime = null

module.exports = {
  name: 'metrics-logger',
  version: '1.0.0',
  
  hooks: {
    // Called when a message generation starts
    'message.start': async (event) => {
      // Detect agent from message context
      const message = event.input?.message || ''
      currentAgent = detectAgent(message)
      currentTask = detectTask(message)
      
      // Extract model from event
      currentModel = event.input?.model || event.context?.model || 'unknown'
      
      messageStartTime = Date.now()
      console.log(`[metrics] Starting: agent=${currentAgent}, model=${currentModel}, task=${currentTask}`)
    },
    
    // Called when a message generation completes
    'message.complete': async (event) => {
      const tokenUsage = event.output?.tokenUsage || {}
      const tokens = tokenUsage.total || tokenUsage.promptTokens + tokenUsage.completionTokens || 0
      const duration = messageStartTime ? Date.now() - messageStartTime : 0
      
      if (tokens > 0) {
        sessionTokens += tokens
        sessionRequests++
        
        // Log to Obsidian immediately with duration (proxy for GPU time)
        logToObsidian(tokens, currentAgent, currentModel, currentTask, duration)
        
        console.log(`[metrics] Logged: ${tokens} tokens, ${duration}ms, model=${currentModel}, agent=${currentAgent}`)
      }
      messageStartTime = null
    },
    
    // Called when a tool execution completes
    'tool.complete': async (event) => {
      const toolName = event.output?.toolName || 'unknown'
      // Tools also consume tokens - log them separately
      console.log(`[metrics] Tool completed: ${toolName}`)
    },
    
    // Called when session ends
    'session.end': async (event) => {
      console.log(`[metrics] Session ended: ${sessionTokens} total tokens, ${sessionRequests} requests`)
      // Reset session counters
      sessionTokens = 0
      sessionRequests = 0
    }
  }
}

// Detect which agent is being used based on message content
function detectAgent(message) {
  const msg = (message || '').toLowerCase()
  
  if (msg.includes('component') || msg.includes('ui') || msg.includes('react')) return 'ui'
  if (msg.includes('review') || msg.includes('check') || msg.includes('validate')) return 'review'
  if (msg.includes('test') || msg.includes('spec')) return 'test-generation'
  if (msg.includes('fsd') || msg.includes('architecture') || msg.includes('slice')) return 'fsd-validator'
  if (msg.includes('story') || msg.includes('storybook')) return 'storybook-test'
  if (msg.includes('guard') || msg.includes('security') || msg.includes('moderate')) return 'guard'
  if (msg.includes('orchestr') || msg.includes('coordinate') || msg.includes('decompose')) return 'orchestrator'
  if (msg.includes('performance') || msg.includes('benchmark')) return 'performance-test'
  if (msg.includes('integration') || msg.includes('e2e') || msg.includes('playwright')) return 'integration-test'
  if (msg.includes('style') || msg.includes('css') || msg.includes('sass')) return 'style'
  
  return 'general'
}

// Detect task type from message
function detectTask(message) {
  const msg = (message || '').toLowerCase()
  
  if (msg.includes('create') || msg.includes('add') || msg.includes('implement')) return 'create'
  if (msg.includes('fix') || msg.includes('bug') || msg.includes('error')) return 'fix'
  if (msg.includes('refactor') || msg.includes('improve')) return 'refactor'
  if (msg.includes('test') || msg.includes('verify')) return 'test'
  if (msg.includes('review') || msg.includes('check')) return 'review'
  if (msg.includes('explain') || msg.includes('what') || msg.includes('how')) return 'question'
  
  return 'ai-request'
}

// Log metrics to Obsidian vault
function logToObsidian(tokens, agent, model, task, duration = 0) {
  try {
    const logsDir = path.join(OBSIDIAN_PATH, 'logs')
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }
    
    const today = new Date().toISOString().split('T')[0]
    const metricsFile = path.join(logsDir, `metrics-${today}.md`)
    
    const timestamp = new Date().toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    const logEntry = `

## ${timestamp}

- **Agent:** ${agent}
- **Model:** ${model}
- **Tokens:** ${tokens}
- **Duration:** ${duration}ms
- **Task:** ${task}

`
    
    fs.appendFileSync(metricsFile, logEntry, { encoding: 'utf8' })
  } catch (error) {
    console.error(`[metrics] Error logging to Obsidian: ${error.message}`)
  }
}
