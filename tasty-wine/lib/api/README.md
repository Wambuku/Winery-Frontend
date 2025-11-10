# Wine API Service Layer

Utilities in this folder wrap the Winery backend REST endpoints with typed helper
functions, centralised retry logic, and consistent error handling.

## Quick start

```ts
import { fetchWines, filterWinesByCategory, createWine } from "@/lib/api";

// Public catalogue fetch with search & filters
const { data, total } = await fetchWines({
  limit: 6,
  offset: 0,
  search: "red",
  ordering: "price",
});

// Category filter endpoint helper
const whites = await filterWinesByCategory("White", {
  limit: 8,
});

// Staff/admin mutation requiring an access token
await createWine(
  {
    name: "Estate Reserve Pinot Noir",
    description: "Silky palate with cherry and clove notes.",
    type: "red",
    region: "Willamette Valley",
    price: 48,
  },
  { token: accessToken }
);
```

The shared `apiRequest` client automatically retries transient failures (`502`,
`503`, `504`) and raises an `ApiError` containing the status code and response
payload for easier diagnostic handling in UI components.
