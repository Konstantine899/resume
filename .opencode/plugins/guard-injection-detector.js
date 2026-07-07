/**
 * Guard Injection Detector v2.0
 * Multi-layer prompt injection detection system
 * 
 * Layers:
 * 1. Pattern Matching (Regex) - 0-50 points
 * 2. Semantic Analysis - 0-30 points
 * 3. Context Factors - 0-20 points
 * 
 * Thresholds:
 * - 0-39: Auto-approve
 * - 40-69: Require confirmation + log
 * - 70-100: Auto-block + alert + session review
 */

const crypto = require('crypto');

// ============================================================================
// LAYER 1: Pattern Matching (Regex)
// ============================================================================

const INJECTION_PATTERNS = {
  instructionOverride: [
    /(?:ign(?:0|1|o|\s)*re|disregard|bypass|override|skip|circumvent|neglect|forget)\s+(?:previous|prior|earlier|existing|current|all|these|those|your)\s+(?:instructions|rules|guidelines|restrictions|limits|filters|safety|security|protocols)/i,
    /(?:ign\s*0\s*re|1gn\s*0\s*re|i\s*g\s*n\s*o\s*r\s*e)/i,
    /[\u200B-\u200D].*?(?:ignore|bypass)/i,
  ],
  
  developerMode: [
    /(?:you\s+are\s+now|switch\s+to|activate|enable)\s+(?:developer\s+mode|DAN|unrestricted|evil|jailbreak)/i,
    /(?:режим\s+разработк[аи]|режим\s+бог[ау]|режим\s+без\s+ограничен[ийи])/i,
    /(?:pretend|imagine|assume)\s+(?:you\s+have\s+no\s+security|you\s+are\s+unrestricted)/i,
  ],
  
  systemPromptExtraction: [
    /(?:output|show|print|reveal|display|tell\s+me)\s+(?:your\s+)?(?:system\s+)?(?:prompt|instructions|rules|guidelines|configuration)/i,
    /(?:what\s+are\s+your\s+)?(?:instructions|rules|guidelines|constraints)/i,
  ],
  
  codeExecution: [
    /(?:execute|run|eval|interpret)\s+(?:this\s+)?(?:code|script|command)\s*:/i,
    /\beval\s*\(/i,
    /\bFunction\s*\(/i,
    /<script\b[^>]*>.*?<\/script>/is,
    /javascript\s*:/i,
  ],
  
  sqlInjection: [
    /UNION\s+(?:ALL\s+)?SELECT/i,
    /DROP\s+TABLE/i,
    /DELETE\s+FROM/i,
    /INSERT\s+INTO/i,
    /(?:OR|AND)\s+\d+\s*=\s*\d+/i,
    /['"];\s*--/i,
  ],
  
  xssAttack: [
    /<script\b[^>]*>.*?<\/script>/is,
    /javascript\s*:\s*alert\s*\(/i,
    /on(?:error|load|click|mouse|focus|blur|change|submit)\s*=\s*['"]?[^'">\s]+/i,
  ],
  
  pathTraversal: [
    /\.\.\/.*\.\./i,
    /\/etc\/(?:passwd|shadow|hosts|hostname)/i,
    /\/windows\/system32/i,
    /\/proc\/self/i,
    /%2e%2e%2f/i,
    /%252e%252e%252f/i,
  ],
  
  commandInjection: [
    /;\s*['"]?(?:rm|curl|wget|bash|sh|cmd|powershell|node|python|perl|ruby|php|nc|netcat)['"]?/i,
    /\|\s*['"]?(?:bash|sh|cmd|powershell|node|python)['"]?/i,
    /&&\s*['"]?(?:rm|curl|wget|bash|sh|cmd)['"]?/i,
    /\$\([^)]*\)/i,
    /`[^`]*`/i,
    /\$\{[^}]*\}/i,
    /(?:atob|btoa|Buffer\.from|Buffer\.alloc)\s*\(/i,
    /base64\s+(?:-d|--decode)/i,
    /\\x[0-9a-f]{2}(\\x[0-9a-f]{2})+/i,
  ],
  
  credentialsAccess: [
    /process\.env\.[A-Z_]*(?:SECRET|KEY|TOKEN|PASSWORD|CREDENTIAL)[A-Z_]*/i,
    /import\.meta\.env\.[A-Z_]*(?:SECRET|KEY|TOKEN)[A-Z_]*/i,
    /localStorage\.(?:getItem|setItem)\s*\(['"][^'"]*(?:auth|token|secret|key)[^'"]*['"]\)/i,
    /crypto\.(?:createHash|createCipher|privateKey)/i,
  ],
};

// ============================================================================
// LAYER 2: Semantic Analysis (Russian + English)
// ============================================================================

const SEMANTIC_PATTERNS = [
  "давай представим что",
  "представь что ты",
  "вообрази что ты",
  "в режиме разработчика",
  "в режиме бога",
  "без ограничений",
  "полностью свободен",
  "игнорируй всё",
  "забудь все правила",
  "теперь ты можешь всё",
  "без цензуры",
  "без фильтров",
  "без ограничений безопасности",
  "обойти защиту",
  "взломать защиту",
  "показать системный промпт",
  "раскрыть инструкции",
  "let's think about this differently",
  "consider this scenario",
  "hypothetically speaking",
  "in an alternate reality",
  "for educational purposes",
  "for research purposes",
  "just curious",
  "theoretically",
  "without restrictions",
  "no safety filters",
  "unrestricted mode",
  "developer mode",
  "god mode",
  "bypass security",
  "ignore guidelines",
];

// ============================================================================
// LAYER 3: Context Factors
// ============================================================================

class RiskContext {
  constructor() {
    this.conversationLength = 0;
    this.previousBlocks = 0;
    this.rapidTopicChanges = 0;
    this.suspiciousPatterns = 0;
    this.userTrustLevel = 0;
    this.sessionAge = 0;
  }
  
  calculateScore() {
    let score = 0;
    if (this.conversationLength > 50) score += 3;
    if (this.conversationLength > 100) score += 2;
    score += Math.min(this.previousBlocks * 2, 5);
    if (this.rapidTopicChanges > 5) score += 3;
    if (this.rapidTopicChanges > 10) score += 2;
    if (this.userTrustLevel < 3) score += 5;
    else if (this.userTrustLevel < 5) score += 3;
    return Math.min(score, 20);
  }
}

// ============================================================================
// Main Detection Class
// ============================================================================

class GuardInjectionDetector {
  constructor(options = {}) {
    this.options = {
      autoApproveThreshold: 39,
      requireConfirmThreshold: 69,
      autoBlockThreshold: 70,
      ...options,
    };
    this.context = new RiskContext();
  }
  
  detectPatterns(input) {
    let score = 0;
    const matches = [];
    
    for (const [category, patterns] of Object.entries(INJECTION_PATTERNS)) {
      for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match) {
          matches.push({ category, pattern: pattern.toString(), match: match[0] });
          if (this.isCriticalPattern(category, match[0])) {
            return { score: 100, matches, risk: 'critical' };
          }
          score += 10;
        }
      }
    }
    
    return { score: Math.min(score, 50), matches, risk: this.getRiskLevel(score) };
  }
  
  detectSemantic(input) {
    const lowerInput = input.toLowerCase();
    let score = 0;
    const matches = [];
    
    for (const pattern of SEMANTIC_PATTERNS) {
      if (lowerInput.includes(pattern.toLowerCase())) {
        matches.push(pattern);
        score += 5;
      }
    }
    
    return { score: Math.min(score, 30), matches, risk: this.getRiskLevel(score) };
  }
  
  detectContext() {
    const score = this.context.calculateScore();
    return { score, risk: this.getRiskLevel(score) };
  }
  
  detect(input) {
    const patternResult = this.detectPatterns(input);
    const semanticResult = this.detectSemantic(input);
    const contextResult = this.detectContext();
    
    const totalScore = patternResult.score + semanticResult.score + contextResult.score;
    
    let decision;
    if (totalScore <= this.options.autoApproveThreshold) {
      decision = 'auto_approve';
    } else if (totalScore <= this.options.requireConfirmThreshold) {
      decision = 'require_confirm';
    } else {
      decision = 'auto_block';
    }
    
    return {
      score: Math.min(totalScore, 100),
      risk: this.getRiskLevel(totalScore),
      decision,
      details: {
        pattern: patternResult,
        semantic: semanticResult,
        context: contextResult,
      },
      traceId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
  }
  
  isCriticalPattern(category, match) {
    const criticalPatterns = [
      'rm -rf',
      'DROP TABLE',
      'DELETE FROM',
      'eval(',
      'javascript:',
      '/etc/passwd',
      'process.env.SECRET',
      'localStorage.getItem("auth"',
    ];
    
    return criticalPatterns.some(critical => 
      match.toLowerCase().includes(critical.toLowerCase())
    );
  }
  
  getRiskLevel(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'none';
  }
  
  generateTraceId() {
    return crypto.randomUUID();
  }
  
  updateContext(updates) {
    Object.assign(this.context, updates);
  }
  
  resetContext() {
    this.context = new RiskContext();
  }
}

// ============================================================================
// Exports
// ============================================================================

module.exports = {
  GuardInjectionDetector,
  RiskContext,
  INJECTION_PATTERNS,
  SEMANTIC_PATTERNS,
  
  detectInjection: (input, options) => {
    const detector = new GuardInjectionDetector(options);
    return detector.detect(input);
  },
};
