# External Wine API Integration

This document describes the integration with the external wine API at `https://winery-backend.onrender.com/api`.

## Overview

The wine e-commerce platform now supports integration with an external wine API to fetch and sync wine data. This integration provides:

- Automatic fetching of wines from the external API
- Fallback to internal API when external API is unavailable
- Synchronization of external wines to the internal database
- Admin interface for managing external wine data

## API Endpoints

### External API Endpoints

- **Token Endpoint**: `POST https://winery-backend.onrender.com/api/token/`
- **Wines Endpoint**: `GET https://winery-backend.onrender.com/api/wines/`
  - Supports pagination: `?page=1&limit=12`
  - Supports sorting: `?sortBy=name&sortOrder=asc`
  - Supports filtering: `?inStock=true`
  - Full example: `?page=1&limit=12&sortBy=name&sortOrder=asc&inStock=true`

### Internal API Endpoints

- **External Wines**: `GET /api/wines/external`
  - Supports same parameters as external API
- **Sync Wines**: `POST /api/wines/external?action=sync`

## Configuration

### Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# External Wine API Configuration
WINE_API_BASE_URL=https://winery-backend.onrender.com/api
EXTERNAL_WINE_API_USERNAME=your_username
EXTERNAL_WINE_API_PASSWORD=your_password
```

### Authentication

The external API uses JWT token authentication. The integration automatically:

1. Requests a token using username/password credentials
2. Caches the token until expiry
3. Automatically refreshes tokens when they expire
4. Handles authentication failures gracefully

## Usage

### Fetching External Wines

```typescript
import { wineService } from '../services/api/wineService';

// Get wines from external API only
const externalWines = await wineService.getExternalWines();

// Get wines with external API priority and internal fallback
const wines = await wineService.getWines();
```

### Using the React Hook

```typescript
import { useExternalWines } from '../hooks/useExternalWines';

function WineComponent() {
  // Get first 10 wines, sorted by name, only in-stock wines
  const { wines, loading, error, refetch, syncWines } = useExternalWines({ 
    page: 1,
    limit: 10, 
    sortBy: 'name',
    sortOrder: 'asc',
    inStock: true
  });

  const handleSync = async () => {
    const result = await syncWines();
    if (result) {
      console.log(`Synced ${result.synced} wines`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <button onClick={handleSync}>Sync to Database</button>
      {wines.map(wine => (
        <div key={wine.id}>{wine.name}</div>
      ))}
    </div>
  );
}
```

### Admin Interface

The admin dashboard includes an "External Wine API" tab that provides:

- View all wines from the external API
- Refresh wine data
- Sync wines to the internal database
- View sync results and errors

## Data Transformation

The external API returns wine data in a different format than the internal system. The integration automatically transforms:

```typescript
// External API format
interface ExternalWineData {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  wine_type: string;
  region: string;
  vintage: number;
  alcohol_content: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

// Internal format
interface Wine {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  color: string;
  history: string;
  vintage: number;
  region: string;
  alcoholContent: number;
  category: string;
  inStock: boolean;
  stockQuantity: number;
}
```

## Error Handling

The integration includes comprehensive error handling:

### Authentication Errors
- Invalid credentials
- Token expiry
- Network failures during authentication

### API Errors
- Network timeouts
- Server errors (5xx)
- Rate limiting
- Invalid responses

### Retry Logic
- Automatic retry for network errors
- Exponential backoff for failed requests
- Maximum retry limits to prevent infinite loops

## Fallback Strategy

When the external API is unavailable, the system automatically falls back to the internal API:

1. **Primary**: Fetch from external API
2. **Fallback**: Use internal API if external fails
3. **Graceful Degradation**: Continue operation with available data

## Synchronization

The sync feature allows importing external wines into the internal database:

```typescript
const syncResult = await wineService.syncExternalWines();
// Returns: { synced: number, errors: string[] }
```

### Sync Process
1. Fetch all wines from external API
2. Transform data to internal format
3. Attempt to create each wine in internal database
4. Report success count and any errors
5. Handle duplicate wines gracefully

## Testing

The integration includes comprehensive tests:

- **Unit Tests**: Service layer functionality
- **Integration Tests**: API endpoint behavior
- **Component Tests**: React component interactions
- **Hook Tests**: Custom hook behavior

Run tests with:
```bash
npm run test
```

## Performance Considerations

### Caching
- JWT tokens are cached until expiry
- Consider implementing wine data caching for better performance

### Rate Limiting
- Respect external API rate limits
- Implement request queuing if needed

### Pagination
- External API may support pagination
- Consider implementing pagination for large datasets

## Security

### Credentials
- Store API credentials securely in environment variables
- Never commit credentials to version control
- Use different credentials for different environments

### Token Management
- Tokens are stored in memory only
- Automatic token refresh prevents expired token issues
- Failed authentication is logged for monitoring

## Monitoring

### Logging
- Authentication attempts and failures
- API request/response cycles
- Sync operations and results
- Error conditions and recovery

### Metrics
- External API response times
- Success/failure rates
- Sync operation statistics
- Fallback usage frequency

## Troubleshooting

### Common Issues

1. **Authentication Failures (400 Error)**
   - The external API may not require authentication for read operations
   - Check if username/password are needed in environment variables
   - Verify external API is accessible
   - Check network connectivity
   - The integration will automatically try without authentication first

2. **No Wines Returned**
   - Verify external API endpoint is correct
   - Check API response format
   - Ensure proper data transformation
   - The system will fall back to internal API and then mock data

3. **Sync Failures**
   - Check internal API endpoints
   - Verify database connectivity
   - Review error messages in sync results

### Testing the Integration

1. **Test API Endpoint**: Visit `/test-api` to debug the external API connection
2. **Admin Dashboard**: Use the "External Wine API" tab in the admin dashboard
3. **Check Console**: Look for console logs indicating which data source is being used

### Fallback Strategy

The system uses a three-tier fallback approach:
1. **Primary**: External Wine API
2. **Secondary**: Internal API
3. **Tertiary**: Mock data (ensures the app always works)

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will provide detailed logging of:
- API requests and responses
- Authentication flow
- Data transformation
- Error details

## Future Enhancements

### Planned Features
- Real-time sync with webhooks
- Incremental sync (only changed wines)
- Conflict resolution for duplicate wines
- Performance metrics dashboard
- Automated sync scheduling

### API Improvements
- Pagination support for large datasets
- Filtering and search on external API
- Bulk operations for better performance
- GraphQL integration for flexible queries