#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 读取统一配置
const configPath = path.join(__dirname, '../config/proxies.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 生成 Vercel 配置
function generateVercelConfig() {
  const vercelConfig = {
    redirects: [],
    rewrites: [],
    headers: [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: config.performance.cacheControl
          },
          {
            key: 'Content-Encoding',
            value: config.performance.contentEncoding.join(', ')
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: config.security.cors.allowOrigin
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: config.security.cors.allowMethods.join(', ')
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: config.security.cors.allowHeaders.join(', ')
          }
        ]
      }
    ]
  };

  // 添加安全头
  Object.entries(config.security.headers).forEach(([key, value]) => {
    vercelConfig.headers[0].headers.push({
      key,
      value
    });
  });

  // 添加防盗链配置
  if (config.security.hotlinkProtection && config.security.hotlinkProtection.enabled) {
    const allowedReferers = config.security.hotlinkProtection.allowedReferers;
    // Vercel 使用 Edge Functions 实现防盗链，这里添加说明
    console.log('💡 Vercel 防盗链需要通过 Edge Functions 实现，参考：https://vercel.com/docs/functions/edge-functions');
  }

  // 添加阻止规则
  config.security.blockedExtensions.forEach(ext => {
    vercelConfig.redirects.push({
      source: `/(.*)${ext}$`,
      destination: '/',
      statusCode: 403
    });
  });

  // 添加代理规则
  config.rules.forEach(rule => {
    let source = rule.source;
    let destination = rule.destination;

    // 处理特殊情况（如 /gemini 没有通配符）
    if (source === '/gemini/*') {
      source = '/gemini/(.*)';
      destination = destination.replace('$1', '$1');
    } else if (source === '/gemini') {
      vercelConfig.rewrites.push({
        source: '/gemini',
        destination: rule.destination
      });
      return;
    } else {
      source = source.replace('/*', '/(.*)');
    }

    vercelConfig.rewrites.push({
      source,
      destination
    });
  });

  // 添加根路径重定向
  vercelConfig.rewrites.push({
    source: '/',
    destination: '/index.html'
  });

  fs.writeFileSync(
    path.join(__dirname, '../vercel.json'),
    JSON.stringify(vercelConfig, null, 2),
    'utf8'
  );
  console.log('✅ Generated vercel.json');
}

// 生成 Netlify 配置
function generateNetlifyConfig() {
  let netlifyConfig = `[[redirects]]
  from = "/"
  to = "/index.html"
  status = 200
  force = true

`;

  // 添加阻止规则
  config.security.blockedExtensions.forEach(ext => {
    netlifyConfig += `[[redirects]]
  pattern = "/(.*)(${ext}$)"
  to = "/"
  status = 403
  force = true

`;
  });

  // 添加代理规则
  config.rules.forEach(rule => {
    let from = rule.source;
    let to = rule.destination;

    // 处理特殊情况
    if (from === '/gemini/*') {
      from = '/gemini/*';
      to = to.replace('$1', ':splat');
    } else if (from === '/gemini') {
      netlifyConfig += `[[redirects]]
  from = "/gemini"
  to = "${to}"
  status = 200
  force = true

`;
      return;
    } else {
      from = from;
      to = to.replace('$1', ':splat');
    }

    netlifyConfig += `[[redirects]]
  from = "${from}"
  to = "${to}"
  status = 200
  force = true

`;
  });

  // 添加 Headers 配置
  netlifyConfig += `[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "${config.performance.cacheControl}"
    Content-Encoding = "${config.performance.contentEncoding.join(', ')}"
    Access-Control-Allow-Origin = "${config.security.cors.allowOrigin}"
    Access-Control-Allow-Methods = "${config.security.cors.allowMethods.join(', ')}"
    Access-Control-Allow-Headers = "${config.security.cors.allowHeaders.join(', ')}"
`;

  // 添加安全头
  Object.entries(config.security.headers).forEach(([key, value]) => {
    netlifyConfig += `
    ${key} = "${value}"`;
  });

  // 添加防盗链配置
  if (config.security.hotlinkProtection && config.security.hotlinkProtection.enabled) {
    const allowedReferers = config.security.hotlinkProtection.allowedReferers;
    const refererRules = allowedReferers.map(ref => {
      if (ref.startsWith('*.')) {
        return `Referer ~ "^https?://([^/]*\\.)?${ref.slice(2)}(/.*)?$"`;
      } else if (ref === 'localhost' || ref === '127.0.0.1') {
        return `Referer ~ "^https?://${ref}(:.*)?(/.*)?$"`;
      } else {
        return `Referer = "https://${ref}/"`;
      }
    }).join(' || ');

    netlifyConfig += `

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
  [headers.conditions]
    ${refererRules}`;
  }

  fs.writeFileSync(
    path.join(__dirname, '../netlify.toml'),
    netlifyConfig,
    'utf8'
  );
  console.log('✅ Generated netlify.toml');
}

// 生成腾讯云 Serverless 配置
function generateTencentConfig() {
  const tencentYml = `# Tencent Cloud Serverless Configuration

# 版本信息
version: '2.0'
envId: ''

# 函数配置
functions:
  proxy:
    handler: index.main
    runtime: Nodejs16.13
    timeout: 10
    memorySize: 128
    triggers:
      - type: apigw
        name: apigw-proxy
        config:
          protocols: [https]
          serviceTimeout: 15
          environment: release
          endpoints:
            - path: /
              method: ANY
            - path: /{path+}
              method: ANY

# API网关配置
apigw:
  apigw-proxy:
    parameters:
      protocols: [https]
      environment: release
      endpoints:
        - path: /
          method: ANY
        - path: /{path+}
          method: ANY
`;

  fs.writeFileSync(
    path.join(__dirname, '../serverless.yml'),
    tencentYml,
    'utf8'
  );
  console.log('✅ Generated serverless.yml (Tencent Cloud)');
}

// 生成腾讯云静态网站托管配置
function generateTencentHostingConfig() {
  const tencentHostingConfig = {
    version: '3.0',
    routes: []
  };

  // 添加阻止规则
  config.security.blockedExtensions.forEach(ext => {
    tencentHostingConfig.routes.push({
      source: `/*${ext}`,
      status: 403
    });
  });

  // 添加代理规则
  config.rules.forEach(rule => {
    let source = rule.source;
    let target = rule.destination;

    if (source === '/gemini') {
      tencentHostingConfig.routes.push({
        source: '/gemini',
        target,
        action: 'rewrite'
      });
    } else {
      source = source.replace('/*', '/*');
      target = target.replace('$1', '$1');
      tencentHostingConfig.routes.push({
        source,
        target,
        action: 'rewrite'
      });
    }
  });

  // 添加根路径
  tencentHostingConfig.routes.push({
    source: '/',
    target: '/index.html',
    action: 'rewrite'
  });

  fs.writeFileSync(
    path.join(__dirname, '../tencent-hosting.json'),
    JSON.stringify(tencentHostingConfig, null, 2),
    'utf8'
  );
  console.log('✅ Generated tencent-hosting.json');
}

// 执行生成
console.log('🚀 Generating platform configurations...');
generateVercelConfig();
generateNetlifyConfig();
generateTencentConfig();
generateTencentHostingConfig();
console.log('🎉 All configurations generated successfully!');