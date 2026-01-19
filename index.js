// Tencent Cloud Serverless Function Entry Point
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 读取配置
const configPath = path.join(__dirname, 'config/proxies.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 代理请求处理函数
exports.main = async (event, context) => {
  try {
    const { path = '/', httpMethod = 'GET', headers = {}, body = '' } = event;
    
    // 如果是根路径，返回index.html
    if (path === '/') {
      const htmlPath = path.join(__dirname, 'index.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
          ...config.security.headers
        },
        body: htmlContent
      };
    }
    
    // 检查是否是被阻止的文件类型
    const blockedExt = config.security.blockedExtensions.find(ext => 
      path.toLowerCase().endsWith(ext)
    );
    if (blockedExt) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'text/plain',
          ...config.security.headers
        },
        body: 'Forbidden'
      };
    }
    
    // 防盗链检查
    if (config.security.hotlinkProtection && config.security.hotlinkProtection.enabled) {
      const referer = headers.Referer || headers.referer || '';
      const allowedReferers = config.security.hotlinkProtection.allowedReferers;
      let isAllowed = false;
      
      // 检查Referer是否在允许列表中
      for (const allowed of allowedReferers) {
        if (allowed === '*') {
          isAllowed = true;
          break;
        } else if (allowed.startsWith('*.')) {
          const domain = allowed.slice(2);
          const regex = new RegExp(`^https?:\\/\\/([^\\/]*\\.)?${domain}(\\/.*)?$`);
          if (regex.test(referer)) {
            isAllowed = true;
            break;
          }
        } else if (allowed === 'localhost' || allowed === '127.0.0.1') {
          const regex = new RegExp(`^https?:\\/\\/${allowed}(:.*)?(\\/.*)?$`);
          if (regex.test(referer)) {
            isAllowed = true;
            break;
          }
        } else {
          const regex = new RegExp(`^https?:\\/\\/${allowed}(\\/.*)?$`);
          if (regex.test(referer)) {
            isAllowed = true;
            break;
          }
        }
      }
      
      if (!isAllowed) {
        return {
          statusCode: 403,
          headers: {
            'Content-Type': 'text/plain',
            ...config.security.headers
          },
          body: 'Hotlinking Forbidden'
        };
      }
    }
    
    // 查找匹配的代理规则
    let targetUrl = null;
    
    for (const rule of config.rules) {
      const source = rule.source;
      if (source.endsWith('/*')) {
        const prefix = source.slice(0, -2);
        if (path.startsWith(prefix)) {
          const rest = path.slice(prefix.length);
          targetUrl = rule.destination.replace('$1', rest);
          break;
        }
      } else if (source === '/gemini' && path.startsWith('/gemini')) {
        const rest = path.slice('/gemini'.length);
        targetUrl = rule.destination.replace('$1', rest || '/');
        break;
      }
    }
    
    if (!targetUrl) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'text/plain',
          ...config.security.headers
        },
        body: 'Not Found'
      };
    }
    
    // 发送代理请求
    const response = await axios({
      url: targetUrl,
      method: httpMethod,
      headers: {
        // 移除可能导致问题的头
        ...headers,
        Host: new URL(targetUrl).host,
        'X-Forwarded-For': event.clientIP || headers['X-Forwarded-For'] || ''
      },
      data: body,
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    // 构建响应头
    const responseHeaders = {
      ...response.headers,
      ...config.security.headers,
      'Access-Control-Allow-Origin': config.security.cors.allowOrigin,
      'Access-Control-Allow-Methods': config.security.cors.allowMethods.join(', '),
      'Access-Control-Allow-Headers': config.security.cors.allowHeaders.join(', '),
      'Cache-Control': config.performance.cacheControl
    };
    
    // 返回响应
    return {
      statusCode: response.status,
      headers: responseHeaders,
      body: Buffer.from(response.data).toString('base64'),
      isBase64Encoded: true
    };
    
  } catch (error) {
    console.error('Proxy Error:', error.message);
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Content-Type': 'text/plain',
        ...config.security.headers
      },
      body: 'Internal Server Error'
    };
  }
};