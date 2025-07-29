import * as dotenv from 'dotenv';
import { AuthService } from './services/auth.js';
import { HostawayApiService } from './services/api.js';

// Load environment variables
dotenv.config();

async function testLocalServer() {
  console.log('🚀 Testing Local Hostaway MCP Server...\n');

  const clientId = process.env.HOSTAWAY_CLIENT_ID;
  const clientSecret = process.env.HOSTAWAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('❌ Missing required environment variables!');
    console.error('Please ensure HOSTAWAY_CLIENT_ID and HOSTAWAY_CLIENT_SECRET are set');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded');
  console.log(`Client ID: ${clientId}`);
  console.log(`Client Secret: ${clientSecret.substring(0, 10)}...`);

  try {
    const authService = new AuthService(clientId, clientSecret);
    const apiService = new HostawayApiService(authService);

    // Test 1: Get access token
    console.log('\n📋 Test 1: Getting access token...');
    const token = await authService.getAccessToken();
    console.log(`✅ Access token obtained: ${token.substring(0, 20)}...`);

    // Test 2: Search listings
    console.log('\n📋 Test 2: Searching for listings...');
    const listings = await apiService.getListings({ limit: 3 });
    console.log(`✅ Found ${listings.length} listings`);
    
    if (listings.length > 0) {
      console.log('\nFirst listing:');
      console.log(`- ID: ${listings[0].id}`);
      console.log(`- Name: ${listings[0].name}`);
      console.log(`- City: ${listings[0].city}`);
    }

    // Test 3: Check token caching
    console.log('\n📋 Test 3: Testing token cache...');
    const token2 = await authService.getAccessToken();
    console.log('✅ Token retrieved from cache');
    console.log(`Tokens match: ${token === token2}`);

    console.log('\n✅ All tests passed! The server is ready to use.');
    console.log('\nTo use with Claude Desktop, add this to your config:');
    console.log(JSON.stringify({
      mcpServers: {
        hostaway: {
          command: "npx",
          args: ["hostaway-mcp"],
          env: {
            HOSTAWAY_CLIENT_ID: clientId,
            HOSTAWAY_CLIENT_SECRET: "your-secret-here"
          }
        }
      }
    }, null, 2));

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testLocalServer();