#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixJSPaths(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixJSPaths(filePath);
    } else if (file.endsWith('.html')) {
      console.log(`Fixing JS paths in: ${filePath}`);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix JavaScript JSON href values - be very specific
      content = content.replace(/\\"href\\":\\"\/learn\\"/g, '\\"href\\":\\"./learn/\\"');
      content = content.replace(/\\"href\\":\\"\/library\\"/g, '\\"href\\":\\"./library/\\"');
      content = content.replace(/\\"href\\":\\"\/progress\\"/g, '\\"href\\":\\"./progress/\\"');
      content = content.replace(/\\"href\\":\\"\/advanced-test\\"/g, '\\"href\\":\\"./advanced-test/\\"');
      content = content.replace(/\\"href\\":\\"\/social\\"/g, '\\"href\\":\\"./social/\\"');
      content = content.replace(/\\"href\\":\\"\/auth\/login\\"/g, '\\"href\\":\\"./auth/login/\\"');
      content = content.replace(/\\"href\\":\\"\/demo\\"/g, '\\"href\\":\\"./demo/\\"');
      content = content.replace(/\\"href\\":\\"\/reading\\"/g, '\\"href\\":\\"./reading/\\"');
      content = content.replace(/\\"href\\":\\"\/test\\"/g, '\\"href\\":\\"./test/\\"');
      content = content.replace(/\\"href\\":\\"\/profile\\"/g, '\\"href\\":\\"./profile/\\"');
      content = content.replace(/\\"href\\":\\"\/learning-plan\\"/g, '\\"href\\":\\"./learning-plan/\\"');
      content = content.replace(/\\"href\\":\\"\/error-review\\"/g, '\\"href\\":\\"./error-review/\\"');
      content = content.replace(/\\"href\\":\\"\/vocabulary\\"/g, '\\"href\\":\\"./vocabulary/\\"');
      content = content.replace(/\\"href\\":\\"\/dashboard\\"/g, '\\"href\\":\\"./dashboard/\\"');
      content = content.replace(/\\"href\\":\\"\/azure-speech-test\\"/g, '\\"href\\":\\"./azure-speech-test/\\"');
      content = content.replace(/\\"href\\":\\"\/claude-ai-test\\"/g, '\\"href\\":\\"./claude-ai-test/\\"');
      content = content.replace(/\\"href\\":\\"\/voice-debug\\"/g, '\\"href\\":\\"./voice-debug/\\"');
      content = content.replace(/\\"href\\":\\"\/admin\\"/g, '\\"href\\":\\"./admin/\\"');
      content = content.replace(/\\"href\\":\\"\/word-books\\"/g, '\\"href\\":\\"./word-books/\\"');
      content = content.replace(/\\"href\\":\\"\/style-test\\"/g, '\\"href\\":\\"./style-test/\\"');
      content = content.replace(/\\"href\\":\\"\/auth\/register\\"/g, '\\"href\\":\\"./auth/register/\\"');
      content = content.replace(/\\"href\\":\\"\/auth\/forgot-password\\"/g, '\\"href\\":\\"./auth/forgot-password/\\"');
      
      fs.writeFileSync(filePath, content);
    }
  });
}

console.log('🔧 Fixing JavaScript navigation paths...');
fixJSPaths('./out');
console.log('✅ JavaScript paths fixed!');