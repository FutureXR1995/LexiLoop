# Azure Static Web Apps - Required Secrets Configuration

## GitHub Repository Secrets
Configure these secrets in GitHub Repository Settings → Secrets and variables → Actions:

### 🔑 Database Configuration
```
DATABASE_URL=postgresql://lexiloopuser:ZhouYao159967606@lexiloop-jp-db-3507.postgres.database.azure.com:5432/lexiloop?sslmode=require
```

### 🔐 Authentication Configuration
```
NEXTAUTH_SECRET=[Generate a random 32+ character string]
NEXTAUTH_URL=https://agreeable-mushroom-0ab8a6a00.5.azurestaticapps.net
```

### 🤖 AI Services Configuration
```
CLAUDE_API_KEY=[Your Anthropic Claude API key]
```

### 🎤 Azure Speech Services Configuration
```
AZURE_SPEECH_KEY=[Your Azure Speech Services key]
AZURE_SPEECH_REGION=[Your Azure region, e.g. eastus, westus2]
```

### 🏭 Azure Static Web Apps Token
```
AZURE_STATIC_WEB_APPS_API_TOKEN_AGREEABLE_MUSHROOM_0AB8A6A00=[Get from Azure Portal]
```

## How to Get Azure Static Web Apps Deployment Token

1. **Login to Azure Portal**: https://portal.azure.com/
2. **Navigate to your Static Web App**: Search for "agreeable-mushroom-0ab8a6a00"
3. **Go to Overview page**
4. **Click "Manage deployment token"**
5. **Copy the deployment token**
6. **Add it to GitHub Repository Secrets**

**Important**: This token is required for GitHub Actions to deploy to Azure Static Web Apps.

## Azure Static Web Apps Environment Variables
Configure these in Azure Portal → Static Web Apps → Configuration:

### Application Settings
```
DATABASE_URL=postgresql://lexiloopuser:ZhouYao159967606@lexiloop-jp-db-3507.postgres.database.azure.com:5432/lexiloop?sslmode=require
NEXTAUTH_SECRET=[Same as GitHub secret]
NEXTAUTH_URL=https://agreeable-mushroom-0ab8a6a00.5.azurestaticapps.net
CLAUDE_API_KEY=[Your Anthropic Claude API key]
AZURE_SPEECH_KEY=[Your Azure Speech Services key]
AZURE_SPEECH_REGION=[Your Azure region]
NODE_ENV=production
```

## How to Generate NEXTAUTH_SECRET
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

## Required Steps:
1. ✅ Database connection tested and working
2. 🔄 Add all secrets to GitHub Repository Settings
3. 🔄 Add all environment variables to Azure Static Web Apps Configuration
4. 🔄 Get Claude API key from Anthropic Console
5. 🔄 Get Azure Speech Services key from Azure Portal
6. ✅ GitHub Actions workflow file created

## Testing After Configuration:
- `/api/health` - Should return health status
- `/api/ai-generate-story` - Should generate stories using Claude API
- `/api/speech-synthesize` - Should synthesize speech using Azure TTS
- `/api/vocabulary-words` - Should return vocabulary from database
- `/data-api/rest/User` - Should return user data from database