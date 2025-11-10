import { apiRequest } from "./client";

export interface Wine {
  id: string;
  name: string;
  description?: string;
  type?: string;
  category?: string;
  region?: string;
  country?: string;
  vintage?: number;
  price: number;
  stock?: number;
  sku?: string;
  imageUrl?: string;
  pairingNotes?: string;
  tastingNotes?: string;
  reorderLevel?: number;
  reorderQuantity?: number;
  costPrice?: number;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface WineFilters {
  region?: string;
  country?: string;
  type?: string;
  category?: string;
  ordering?: string;
  priceMin?: number;
  priceMax?: number;
  vintageMin?: number;
  vintageMax?: number;
  availability?: "in-stock" | "low-stock" | "out-of-stock";
  tags?: string[];
}

export interface WineListParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
  search?: string;
  ordering?: string;
  filters?: WineFilters;
  token?: string;
  signal?: AbortSignal;
  retries?: number;
  retryDelayMs?: number;
  retryOnStatuses?: number[];
}

export interface WineListResponse {
  data: Wine[];
  total: number;
  next?: string | null;
  previous?: string | null;
}

export interface WineInput {
  name: string;
  description: string;
  type?: string;
  category?: string;
  region?: string;
  country?: string;
  vintage?: number;
  price: number;
  stock?: number;
  sku?: string;
  imageUrl?: string;
  reorderLevel?: number;
  reorderQuantity?: number;
  costPrice?: number;
  location?: string;
  pairingNotes?: string;
  tastingNotes?: string;
}

export interface WineMutationOptions {
  token: string;
  signal?: AbortSignal;
  retries?: number;
  retryDelayMs?: number;
  retryOnStatuses?: number[];
}

type ApiWine = {
  id: number | string;
  name?: string;
  description?: string;
  type?: string;
  category?: string;
  region?: string;
  country?: string;
  vintage?: number | string;
  price?: number | string;
  stock?: number | string;
  sku?: string;
  image?: string;
  image_url?: string;
  imageUrl?: string;
  pairing_notes?: string;
  tasting_notes?: string;
  reorder_level?: number | string;
  reorder_quantity?: number | string;
  cost_price?: number | string;
  location?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
};

type RawWineListResponse =
  | {
      results: ApiWine[];
      count?: number;
      next?: string | null;
      previous?: string | null;
    }
  | {
      data: ApiWine[];
      total?: number;
      next?: string | null;
      previous?: string | null;
    }
  | ApiWine[]
  | null
  | undefined;

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function mapApiWine(raw: ApiWine): Wine {
  const price = toNumber(raw.price);
  const stock = raw.stock != null ? toNumber(raw.stock, 0) : undefined;
  const vintage =
    raw.vintage != null && raw.vintage !== ""
      ? toNumber(raw.vintage, undefined as unknown as number)
      : undefined;

  const reorderLevel =
    raw.reorder_level != null ? toNumber(raw.reorder_level, undefined as unknown as number) : undefined;
  const reorderQuantity =
    raw.reorder_quantity != null
      ? toNumber(raw.reorder_quantity, undefined as unknown as number)
      : undefined;

  const costPrice =
    raw.cost_price != null ? toNumber(raw.cost_price, undefined as unknown as number) : undefined;

  const imageUrl = (raw.image_url || raw.image || raw.imageUrl) ?? undefined;

  return {
    id: String(raw.id),
    name: raw.name ?? "",
    description: raw.description ?? "",
    type: raw.type ?? raw.category ?? undefined,
    category: raw.category ?? undefined,
    region: raw.region ?? undefined,
    country: raw.country ?? undefined,
    vintage: typeof vintage === "number" && !Number.isNaN(vintage) ? vintage : undefined,
    price,
    stock,
    sku: raw.sku ?? undefined,
    imageUrl,
    pairingNotes: raw.pairing_notes as string | undefined,
    tastingNotes: raw.tasting_notes as string | undefined,
    reorderLevel: typeof reorderLevel === "number" && !Number.isNaN(reorderLevel) ? reorderLevel : undefined,
    reorderQuantity:
      typeof reorderQuantity === "number" && !Number.isNaN(reorderQuantity) ? reorderQuantity : undefined,
    costPrice: typeof costPrice === "number" && !Number.isNaN(costPrice) ? costPrice : undefined,
    location: raw.location ?? undefined,
    createdAt: raw.created_at ?? undefined,
    updatedAt: raw.updated_at ?? undefined,
  };
}

function buildWineQuery(params: WineListParams): Record<string, string | number | boolean | undefined> {
  const query: Record<string, string | number | boolean | undefined> = {
    search: params.search,
    ordering: params.ordering,
    limit: params.limit,
    offset: params.offset,
  };

  if (typeof params.page === "number" && typeof params.pageSize === "number") {
    query.limit = params.pageSize;
    query.offset = params.pageSize * Math.max(params.page - 1, 0);
  } else {
    if (typeof params.pageSize === "number" && query.limit === undefined) {
      query.limit = params.pageSize;
    }
    if (typeof params.page === "number" && query.offset === undefined && query.limit !== undefined) {
      query.offset = (query.limit as number) * Math.max(params.page - 1, 0);
    }
  }

  if (params.filters) {
    const { filters } = params;
    query.region = filters.region;
    query.country = filters.country;
    query.type = filters.type;
    query.category = filters.category;
    query.ordering = filters.ordering ?? query.ordering;
    query.price_min = filters.priceMin;
    query.price_max = filters.priceMax;
    query.vintage_min = filters.vintageMin;
    query.vintage_max = filters.vintageMax;
    query.availability = filters.availability;
    if (filters.tags && filters.tags.length > 0) {
      query.tags = filters.tags.join(",");
    }
  }

  return query;
}

function normaliseListResponse(response: RawWineListResponse): WineListResponse {
  if (response && !Array.isArray(response) && "results" in response && Array.isArray(response.results)) {
    const mapped = response.results.map(mapApiWine);
    return {
      data: mapped,
      total: typeof response.count === "number" ? response.count : mapped.length,
      next: response.next ?? null,
      previous: response.previous ?? null,
    };
  }

  if (response && !Array.isArray(response) && "data" in response && Array.isArray(response.data)) {
    const mapped = response.data.map(mapApiWine);
    return {
      data: mapped,
      total:
        typeof response.total === "number"
          ? response.total
          : Array.isArray(response.data)
            ? response.data.length
            : mapped.length,
      next: response.next ?? null,
      previous: response.previous ?? null,
    };
  }

  const fallback = Array.isArray(response) ? response : [];
  return {
    data: fallback.map(mapApiWine),
    total: fallback.length,
    next: null,
    previous: null,
  };
}

function serialiseWineInput(input: Partial<WineInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.description !== undefined) payload.description = input.description;
  if (input.type !== undefined) payload.type = input.type;
  if (input.category !== undefined) payload.category = input.category;
  if (input.region !== undefined) payload.region = input.region;
  if (input.country !== undefined) payload.country = input.country;
  if (input.vintage !== undefined) payload.vintage = input.vintage;
  if (input.price !== undefined) payload.price = input.price;
  if (input.stock !== undefined) payload.stock = input.stock;
  if (input.sku !== undefined) payload.sku = input.sku;
  if (input.imageUrl !== undefined) payload.image_url = input.imageUrl;
  if (input.reorderLevel !== undefined) payload.reorder_level = input.reorderLevel;
  if (input.reorderQuantity !== undefined) payload.reorder_quantity = input.reorderQuantity;
  if (input.costPrice !== undefined) payload.cost_price = input.costPrice;
  if (input.location !== undefined) payload.location = input.location;
  if (input.pairingNotes !== undefined) payload.pairing_notes = input.pairingNotes;
  if (input.tastingNotes !== undefined) payload.tasting_notes = input.tastingNotes;

  return payload;
}

/**
 * Fetches wines with pagination, search, and filtering support.
 */
export async function fetchWines(params: WineListParams = {}): Promise<WineListResponse> {
  const query = buildWineQuery(params);
  const response = await apiRequest<RawWineListResponse>("/api/wines/", {
    method: "GET",
    token: params.token,
    signal: params.signal,
    retries: params.retries,
    retryDelayMs: params.retryDelayMs,
    retryOnStatuses: params.retryOnStatuses,
    query,
  });
  return normaliseListResponse(response);
}

export async function searchWines(params: WineListParams = {}): Promise<WineListResponse> {
  return fetchWines(params);
}

export async function filterWinesByCategory(category: string, params: Omit<WineListParams, "filters"> = {}) {
  const response = await apiRequest<RawWineListResponse>("/api/wines/search/", {
    method: "GET",
    token: params.token,
    signal: params.signal,
    retries: params.retries,
    retryDelayMs: params.retryDelayMs,
    retryOnStatuses: params.retryOnStatuses,
    query: {
      ...buildWineQuery(params),
      category,
    },
  });
  return normaliseListResponse(response);
}

/**
 * Retrieves a single wine by id.
 */
export async function getWineById(id: string, options: { token?: string; signal?: AbortSignal } = {}) {
  if (!id) {
    throw new Error("A wine id is required");
  }
  const response = await apiRequest<ApiWine>(`/api/wines/${id}/`, {
    method: "GET",
    token: options.token,
    signal: options.signal,
  });
  return mapApiWine(response);
}

/**
 * Creates a new wine entry. Requires a staff/admin access token.
 */
export async function createWine(
  input: WineInput,
  options: WineMutationOptions
): Promise<Wine> {
  if (!options.token) {
    throw new Error("An access token is required to create a wine");
  }

  const payload = serialiseWineInput(input);

  const response = await apiRequest<ApiWine>("/api/wines/", {
    method: "POST",
    token: options.token,
    signal: options.signal,
    body: payload,
    retries: options.retries,
    retryDelayMs: options.retryDelayMs,
    retryOnStatuses: options.retryOnStatuses,
  });
  return mapApiWine(response);
}

/**
 * Updates an existing wine. Requires a staff/admin access token.
 */
export async function updateWine(
  id: string,
  input: Partial<WineInput>,
  options: WineMutationOptions
): Promise<Wine> {
  if (!id) {
    throw new Error("A wine id is required to update a wine");
  }
  if (!options.token) {
    throw new Error("An access token is required to update a wine");
  }

  const payload = serialiseWineInput(input);

  const response = await apiRequest<ApiWine>(`/api/wines/${id}/`, {
    method: "PATCH",
    token: options.token,
    signal: options.signal,
    body: payload,
    retries: options.retries,
    retryDelayMs: options.retryDelayMs,
    retryOnStatuses: options.retryOnStatuses,
  });
  return mapApiWine(response);
}

/**
 * Deletes a wine record. Requires a staff/admin access token.
 */
export async function deleteWine(
  id: string,
  options: WineMutationOptions
): Promise<{ success: boolean }> {
  if (!id) {
    throw new Error("A wine id is required to delete a wine");
  }
  if (!options.token) {
    throw new Error("An access token is required to delete a wine");
  }

  await apiRequest<unknown>(`/api/wines/${id}/`, {
    method: "DELETE",
    token: options.token,
    signal: options.signal,
    retries: options.retries,
    retryDelayMs: options.retryDelayMs,
    retryOnStatuses: options.retryOnStatuses,
  });

  return { success: true };
}
