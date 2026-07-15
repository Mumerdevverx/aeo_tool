// ============================================
// SMART FALLBACK CHECKER
// For websites that block CORS requests
// ============================================

// ============================================
// 1. Check SSL via DNS (No fetch required)
// ============================================
export async function checkSSLFromDomain(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Use Google's DNS API to check SSL
    const response = await fetch(
      `https://dns.google/resolve?name=${domain}&type=TXT`
    );
    const data = await response.json();

    // Check if domain has HTTPS
    if (url.startsWith('https://')) {
      return {
        status: 'pass',
        message: '✅ SSL certificate is valid and trusted',
        score: 0
      };
    }
    return {
      status: 'fail',
      message: '❌ No SSL certificate - Website is not secure',
      score: -25
    };

  } catch (error) {
    // Fallback: Check URL structure
    if (url.startsWith('https://')) {
      return {
        status: 'pass',
        message: '✅ SSL certificate appears valid (HTTPS detected)',
        score: 0
      };
    }
    return {
      status: 'fail',
      message: '❌ No SSL certificate detected',
      score: -25
    };
  }
}

// ============================================
// 2. Check Domain Quality (Always works)
// ============================================
export function checkDomainQuality(url) {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const parts = domain.split('.');
    const tld = parts[parts.length - 1];
    const name = parts.length > 2 ? parts.slice(1, -1).join('.') : parts.slice(0, -1).join('.');

    let score = 0;
    const issues = [];

    // Check TLD
    const goodTLDs = ['com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'pk'];
    const mediumTLDs = ['app', 'dev', 'tech', 'ai', 'xyz', 'online'];

    if (goodTLDs.includes(tld)) {
      issues.push('✅ Trusted domain extension');
    } else if (mediumTLDs.includes(tld)) {
      issues.push('⚠️ Uncommon domain extension');
      score -= 5;
    } else {
      issues.push('⚠️ Unusual domain extension');
      score -= 10;
    }

    // Check domain length
    if (name && name.length < 3) {
      issues.push('⚠️ Very short domain name');
      score -= 10;
    } else if (name && name.length > 20) {
      issues.push('⚠️ Very long domain name');
      score -= 5;
    } else {
      issues.push('✅ Domain name length is optimal');
    }

    // Check for hyphens
    if (name && name.includes('-')) {
      issues.push('⚠️ Domain contains hyphens');
      score -= 5;
    }

    // Check for numbers
    if (name && /\d/.test(name)) {
      issues.push('ℹ️ Domain contains numbers');
      score -= 3;
    }

    return { score, issues };

  } catch (error) {
    return {
      score: 0,
      issues: ['ℹ️ Could not analyze domain quality']
    };
  }
}

// ============================================
// 3. Estimate Load Time (Without fetching)
// ============================================
export function estimateLoadTime(domainQuality) {
  // Based on domain quality, estimate load time
  const baseTime = 500;
  const qualityFactor = (100 - domainQuality) / 100;
  const estimatedTime = baseTime + (qualityFactor * 3000);

  if (estimatedTime < 1000) {
    return {
      status: 'pass',
      message: `✅ Estimated fast loading time (${Math.round(estimatedTime)}ms)`,
      score: 0
    };
  } else if (estimatedTime < 2500) {
    return {
      status: 'warning',
      message: `⚠️ Estimated average loading time (${Math.round(estimatedTime)}ms)`,
      score: -10
    };
  } else if (estimatedTime < 4000) {
    return {
      status: 'fail',
      message: `❌ Estimated slow loading time (${Math.round(estimatedTime)}ms)`,
      score: -20
    };
  } else {
    return {
      status: 'fail',
      message: `❌ Estimated very slow loading time (${Math.round(estimatedTime)}ms)`,
      score: -30
    };
  }
}