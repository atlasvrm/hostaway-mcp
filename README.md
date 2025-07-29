# Hostaway MCP Server

A Model Context Protocol (MCP) server that provides access to the Hostaway API for vacation rental management. This server allows Claude Desktop to search properties, view details, and access pricing information from your Hostaway account.

## Features

- 🔍 **Search Properties** - Find vacation rentals with extensive filtering options
- 🏠 **View Property Details** - Get comprehensive information about specific properties
- 💰 **Pricing Settings** - Access channel-specific pricing and LOS configurations
- 🛏️ **Bed Types** - Retrieve bed type mappings for property configuration

## Installation

The Hostaway MCP server can be installed directly from GitHub:

### Option 1: Direct execution with npx (Recommended)

No installation needed - Claude Desktop will run it directly:

```json
{
  "mcpServers": {
    "hostaway": {
      "command": "npx",
      "args": ["github:atlasvrm/hostaway-mcp"],
      "env": {
        "HOSTAWAY_CLIENT_ID": "your-id",
        "HOSTAWAY_CLIENT_SECRET": "your-secret"
      }
    }
  }
}
```

### Option 2: Global installation

```bash
npm install -g github:atlasvrm/hostaway-mcp
```

Then use in Claude Desktop:

```json
{
  "mcpServers": {
    "hostaway": {
      "command": "hostaway-mcp",
      "args": [],
      "env": {
        "HOSTAWAY_CLIENT_ID": "your-id",
        "HOSTAWAY_CLIENT_SECRET": "your-secret"
      }
    }
  }
}
```

## Configuration

### 1. Get Your Hostaway API Credentials

1. Log in to your [Hostaway account](https://www.hostaway.com)
2. Navigate to Settings → API
3. Note your:
   - **Client ID** (e.g., "12345")
   - **Client Secret** (e.g., "abcdef123456...")

### 2. Configure Claude Desktop

Add the configuration from the Installation section to your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**Linux:** `~/.config/claude/claude_desktop_config.json`

⚠️ **Important**: Replace `"your-id"` and `"your-secret"` with your actual Hostaway API credentials from step 1.

### 3. Restart Claude Desktop

Completely quit and restart Claude Desktop for the configuration to take effect.

## Available Tools

### search-listings
Search for properties with extensive filtering options:
- `limit` - Maximum number of results
- `offset` - Number of results to skip
- `city` - Filter by city name
- `country` - Filter by country code
- `match` - Search by listing name
- `sortOrder` - Sort results by various criteria
- `availabilityDateStart` / `availabilityDateEnd` - Check availability dates
- `availabilityGuestNumber` - Filter by guest capacity
- And many more filters...

### get-listing-details
Get comprehensive information about a specific listing:
- `listingId` - The property ID (required)

### get-pricing-settings
Get pricing settings and channel-specific configurations:
- `listingId` - The property ID (required)

### get-bed-types
Get all available bed types for property configuration.

## Usage Examples

Once configured, you can ask Claude:

- "Search for properties in Miami"
- "Show me details for property ID 12345"
- "What are the pricing settings for property 12345?"
- "List all available bed types"

## Token Caching

The server caches authentication tokens locally in `~/.hostaway-mcp/token-cache.json` to avoid unnecessary API calls. Tokens are automatically refreshed when they expire.

## Development

### Local Development

```bash
# Clone the repository
git clone https://github.com/atlasvrm/hostaway-mcp.git
cd hostaway-mcp

# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Building

```bash
npm run build
```

### Testing

Create a `.env` file with your credentials:

```bash
HOSTAWAY_CLIENT_ID=your_client_id
HOSTAWAY_CLIENT_SECRET=your_client_secret
```

Then run the test script:

```bash
npm run test:api
```

## Troubleshooting

### "Authentication failed" error
- Verify your Client ID and Client Secret are correct
- Check that your Hostaway API access is active

### "Property not found" error
- Ensure the property ID exists in your Hostaway account
- Verify you have access to the property

### Server not appearing in Claude
- Make sure you've restarted Claude Desktop after configuration
- Check that npx is in your system PATH
- Verify the configuration file is valid JSON

## License

MIT License - see LICENSE file for details

## Support

- **Issues**: [GitHub Issues](https://github.com/atlasvrm/hostaway-mcp/issues)
- **Hostaway API Docs**: [api.hostaway.com/documentation](https://api.hostaway.com/documentation)

---

Built with ❤️ by Atlas Vacation Rentals