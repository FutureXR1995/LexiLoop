#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixPaths(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixPaths(filePath);
    } else if (file.endsWith('.html')) {
      console.log(`Fixing paths in: ${filePath}`);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix CSS and JS paths
      content = content.replace(/href="\/_next\//g, 'href="./_next/');
      content = content.replace(/src="\/_next\//g, 'src="./_next/');
      content = content.replace(/href="\/manifest/g, 'href="./manifest');
      content = content.replace(/href="\/robots/g, 'href="./robots');
      content = content.replace(/href="\/sitemap/g, 'href="./sitemap');
      content = content.replace(/href="\/favicon/g, 'href="./favicon');
      content = content.replace(/href="\/apple-touch/g, 'href="./apple-touch');
      content = content.replace(/href="\/safari-pinned/g, 'href="./safari-pinned');
      content = content.replace(/href="\/mstile/g, 'href="./mstile');
      content = content.replace(/href="\/browserconfig/g, 'href="./browserconfig');
      
      // Fix navigation links in JavaScript code
      content = content.replace(/href="\/learn"/g, 'href="./learn/"');
      content = content.replace(/href="\/library"/g, 'href="./library/"');
      content = content.replace(/href="\/progress"/g, 'href="./progress/"');
      content = content.replace(/href="\/advanced-test"/g, 'href="./advanced-test/"');
      content = content.replace(/href="\/social"/g, 'href="./social/"');
      content = content.replace(/href="\/auth\/login"/g, 'href="./auth/login/"');
      content = content.replace(/href="\/demo"/g, 'href="./demo/"');
      content = content.replace(/href="\/reading"/g, 'href="./reading/"');
      content = content.replace(/href="\/test"/g, 'href="./test/"');
      content = content.replace(/href="\/profile"/g, 'href="./profile/"');
      content = content.replace(/href="\/learning-plan"/g, 'href="./learning-plan/"');
      content = content.replace(/href="\/error-review"/g, 'href="./error-review/"');
      content = content.replace(/href="\/vocabulary"/g, 'href="./vocabulary/"');
      content = content.replace(/href="\/dashboard"/g, 'href="./dashboard/"');
      content = content.replace(/href="\/azure-speech-test"/g, 'href="./azure-speech-test/"');
      content = content.replace(/href="\/claude-ai-test"/g, 'href="./claude-ai-test/"');
      content = content.replace(/href="\/voice-debug"/g, 'href="./voice-debug/"');
      content = content.replace(/href="\/admin"/g, 'href="./admin/"');
      content = content.replace(/href="\/word-books"/g, 'href="./word-books/"');
      content = content.replace(/href="\/style-test"/g, 'href="./style-test/"');
      content = content.replace(/href="\/auth\/register"/g, 'href="./auth/register/"');
      content = content.replace(/href="\/auth\/forgot-password"/g, 'href="./auth/forgot-password/"');
      
      // Fix navigation links - determine current directory depth
      const relativePath = path.relative('./out', filePath);
      const depth = relativePath.split(path.sep).length - 1;
      const prefix = depth === 0 ? './' : '../'.repeat(depth);
      
      // Fix internal navigation links
      content = content.replace(/href="\/learn\//g, `href="${prefix}learn/`);
      content = content.replace(/href="\/library\//g, `href="${prefix}library/`);
      content = content.replace(/href="\/progress\//g, `href="${prefix}progress/`);
      content = content.replace(/href="\/advanced-test\//g, `href="${prefix}advanced-test/`);
      content = content.replace(/href="\/social\//g, `href="${prefix}social/`);
      content = content.replace(/href="\/auth\/login\//g, `href="${prefix}auth/login/`);
      content = content.replace(/href="\/auth\/register\//g, `href="${prefix}auth/register/`);
      content = content.replace(/href="\/auth\/forgot-password\//g, `href="${prefix}auth/forgot-password/`);
      content = content.replace(/href="\/reading\//g, `href="${prefix}reading/`);
      content = content.replace(/href="\/test\//g, `href="${prefix}test/`);
      content = content.replace(/href="\/profile\//g, `href="${prefix}profile/`);
      content = content.replace(/href="\/learning-plan\//g, `href="${prefix}learning-plan/`);
      content = content.replace(/href="\/error-review\//g, `href="${prefix}error-review/`);
      content = content.replace(/href="\/vocabulary\//g, `href="${prefix}vocabulary/`);
      content = content.replace(/href="\/demo\//g, `href="${prefix}demo/`);
      content = content.replace(/href="\/dashboard\//g, `href="${prefix}dashboard/`);
      content = content.replace(/href="\/admin\//g, `href="${prefix}admin/`);
      content = content.replace(/href="\/azure-speech-test\//g, `href="${prefix}azure-speech-test/`);
      content = content.replace(/href="\/claude-ai-test\//g, `href="${prefix}claude-ai-test/`);
      content = content.replace(/href="\/voice-debug\//g, `href="${prefix}voice-debug/`);
      content = content.replace(/href="\/word-books\//g, `href="${prefix}word-books/`);
      content = content.replace(/href="\/style-test\//g, `href="${prefix}style-test/`);
      
      // Fix links to home page
      if (depth > 0) {
        content = content.replace(/href="\//g, `href="${'../'.repeat(depth)}`);
      }
      
      fs.writeFileSync(filePath, content);
    }
  });
}

console.log('🔧 Fixing static paths for file:// access...');
fixPaths('./out');
console.log('✅ Static paths fixed!');