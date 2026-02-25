export interface PaginatedQuery {
    /**
     * Number of items to return. Can be used along with {@link offset}
     * for pagination.
     */
    limit?: number;
    /**
     * Offset of the first item to return. Can be used along with {@link limit}
     * for pagination.
     */
    offset?: number;
    /**
     * Start date for filtering results. Should be in ISO 8601 format (e.g., "2024-01-01T00:00:00Z").
     * While all models support filtering by date, this is mainly used for {@link Job}s.
     */
    from?: string;
    /**
     * End date for filtering results. Should be in ISO 8601 format (e.g., "2024-01-01T00:00:00Z").
     * While all models support filtering by date, this is mainly used for {@link Job}s.
     */
    to?: string;
}

export interface PaginatedResponse<T> {
    /**
     * Total number of items matching the query.
     */
    total: number;
    /**
     * The maximum number of items that can be returned in this response.
     * This indicates the page size used for pagination, which may be less than or equal
     * to the `limit` specified in the request depending on the total
     * number of items and the offset.
     */
    limit: number;
    /**
     * The number of items to skip before starting to collect the result set. This is used for pagination
     * to determine which subset of items is included in the current response.
     *
     * For example, if `limit` is 10 and `offset` is 20, the response will include items 21-30
     * from the total dataset.
     */
    offset: number;
    /**
     * The actual items returned by the query.
     */
    data: Array<T>;
}
