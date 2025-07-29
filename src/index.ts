#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { HostawayApiService } from './services/api.js';
import { AuthService } from './services/auth.js';

// Get credentials from environment
const clientId = process.env.HOSTAWAY_CLIENT_ID;
const clientSecret = process.env.HOSTAWAY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Error: HOSTAWAY_CLIENT_ID and HOSTAWAY_CLIENT_SECRET environment variables are required');
  process.exit(1);
}

// Initialize services
const authService = new AuthService(clientId, clientSecret);
const apiService = new HostawayApiService(authService);

// Create MCP server
const server = new Server(
  {
    name: 'hostaway-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define input schemas for tools
const SearchListingsSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
  sortOrder: z.enum(['name', 'nameReversed', 'order', 'orderReversed', 'contactName', 'contactNameReversed', 'latestActivity', 'latestActivityDesc']).optional(),
  city: z.string().optional(),
  match: z.string().optional(),
  country: z.string().optional(),
  contactName: z.string().optional(),
  propertyTypeId: z.number().optional(),
  includeResources: z.number().optional(),
  availabilityDateStart: z.string().optional(),
  availabilityDateEnd: z.string().optional(),
  availabilityGuestNumber: z.number().optional(),
  userId: z.number().optional(),
  latestActivityStart: z.string().optional(),
  latestActivityEnd: z.string().optional(),
  isBookingEngineActive: z.boolean().optional(),
});

const GetListingDetailsSchema = z.object({
  listingId: z.number(),
});

const GetPricingSettingsSchema = z.object({
  listingId: z.number(),
});

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search-listings',
        description: 'Search for property listings with various filters',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number of items in the list' },
            offset: { type: 'number', description: 'Number of items to skip from beginning of the list' },
            sortOrder: { 
              type: 'string', 
              enum: ['name', 'nameReversed', 'order', 'orderReversed', 'contactName', 'contactNameReversed', 'latestActivity', 'latestActivityDesc'],
              description: 'Sort order for results' 
            },
            city: { type: 'string', description: 'Filter by city' },
            match: { type: 'string', description: 'Search a listing by listing name' },
            country: { type: 'string', description: 'Filter by country' },
            contactName: { type: 'string', description: 'Filter by contact name' },
            propertyTypeId: { type: 'number', description: 'Filter by property type ID' },
            includeResources: { type: 'number', description: 'If 1, response includes supplementary resources (default 0)' },
            availabilityDateStart: { type: 'string', description: 'Check-in date (YYYY-MM-DD format)' },
            availabilityDateEnd: { type: 'string', description: 'Check-out date (YYYY-MM-DD format)' },
            availabilityGuestNumber: { type: 'number', description: 'Listing person capacity' },
            userId: { type: 'number', description: 'Limit listings to those the user has access to' },
            latestActivityStart: { type: 'string', description: 'Filter by latest activity start date' },
            latestActivityEnd: { type: 'string', description: 'Filter by latest activity end date' },
            isBookingEngineActive: { type: 'boolean', description: 'Filter by active on booking engine status' },
          },
        },
      },
      {
        name: 'get-listing-details',
        description: 'Get detailed information about a specific listing',
        inputSchema: {
          type: 'object',
          required: ['listingId'],
          properties: {
            listingId: { type: 'number', description: 'ID of the listing' },
          },
        },
      },
      {
        name: 'get-pricing-settings',
        description: 'Get pricing settings for a specific listing',
        inputSchema: {
          type: 'object',
          required: ['listingId'],
          properties: {
            listingId: { type: 'number', description: 'ID of the listing' },
          },
        },
      },
      {
        name: 'get-bed-types',
        description: 'Get all available bed types for mapping',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'search-listings': {
        const validated = SearchListingsSchema.parse(args);
        const listings = await apiService.getListings(validated);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(listings, null, 2),
            },
          ],
        };
      }

      case 'get-listing-details': {
        const validated = GetListingDetailsSchema.parse(args);
        const listing = await apiService.getListing(validated.listingId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(listing, null, 2),
            },
          ],
        };
      }

      case 'get-pricing-settings': {
        const validated = GetPricingSettingsSchema.parse(args);
        const pricingSettings = await apiService.getPricingSettings(validated.listingId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(pricingSettings, null, 2),
            },
          ],
        };
      }

      case 'get-bed-types': {
        const bedTypes = await apiService.getBedTypes();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(bedTypes, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Hostaway MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});