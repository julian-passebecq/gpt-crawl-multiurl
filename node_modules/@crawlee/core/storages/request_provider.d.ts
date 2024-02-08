import { ListDictionary, LruCache } from '@apify/datastructures';
import type { Log } from '@apify/log';
import type { BatchAddRequestsResult, Dictionary, ProcessedRequest, QueueOperationInfo, RequestQueueClient, RequestQueueInfo, StorageClient } from '@crawlee/types';
import type { IStorage, StorageManagerOptions } from './storage_manager';
import { Configuration } from '../configuration';
import type { ProxyConfiguration } from '../proxy_configuration';
import { Request } from '../request';
import type { RequestOptions, InternalSource, Source } from '../request';
export declare abstract class RequestProvider implements IStorage {
    readonly config: Configuration;
    id: string;
    name?: string;
    timeoutSecs: number;
    clientKey: string;
    client: RequestQueueClient;
    protected proxyConfiguration?: ProxyConfiguration;
    log: Log;
    internalTimeoutMillis: number;
    requestLockSecs: number;
    assumedTotalCount: number;
    assumedHandledCount: number;
    private initialCount;
    protected queueHeadIds: ListDictionary<string>;
    protected requestCache: LruCache<RequestLruItem>;
    /** @internal */
    inProgress: Set<string>;
    protected recentlyHandledRequestsCache: LruCache<boolean>;
    protected queuePausedForMigration: boolean;
    constructor(options: InternalRequestProviderOptions, config?: Configuration);
    /**
     * @ignore
     */
    inProgressCount(): number;
    /**
     * Returns an offline approximation of the total number of requests in the queue (i.e. pending + handled).
     *
     * Survives restarts and actor migrations.
     */
    getTotalCount(): number;
    /**
     * Adds a request to the queue.
     *
     * If a request with the same `uniqueKey` property is already present in the queue,
     * it will not be updated. You can find out whether this happened from the resulting
     * {@apilink QueueOperationInfo} object.
     *
     * To add multiple requests to the queue by extracting links from a webpage,
     * see the {@apilink enqueueLinks} helper function.
     *
     * @param requestLike {@apilink Request} object or vanilla object with request data.
     * Note that the function sets the `uniqueKey` and `id` fields to the passed Request.
     * @param [options] Request queue operation options.
     */
    addRequest(requestLike: Source, options?: RequestQueueOperationOptions): Promise<RequestQueueOperationInfo>;
    /**
     * Adds requests to the queue in batches of 25.
     *
     * If a request that is passed in is already present due to its `uniqueKey` property being the same,
     * it will not be updated. You can find out whether this happened by finding the request in the resulting
     * {@apilink BatchAddRequestsResult} object.
     *
     * @param requestsLike {@apilink Request} objects or vanilla objects with request data.
     * Note that the function sets the `uniqueKey` and `id` fields to the passed requests if missing.
     * @param [options] Request queue operation options.
     */
    addRequests(requestsLike: Source[], options?: RequestQueueOperationOptions): Promise<BatchAddRequestsResult>;
    /**
     * Adds requests to the queue in batches. By default, it will resolve after the initial batch is added, and continue
     * adding the rest in background. You can configure the batch size via `batchSize` option and the sleep time in between
     * the batches via `waitBetweenBatchesMillis`. If you want to wait for all batches to be added to the queue, you can use
     * the `waitForAllRequestsToBeAdded` promise you get in the response object.
     *
     * @param requests The requests to add
     * @param options Options for the request queue
     */
    addRequestsBatched(requests: (string | Source)[], options?: AddRequestsBatchedOptions): Promise<AddRequestsBatchedResult>;
    /**
     * Gets the request from the queue specified by ID.
     *
     * @param id ID of the request.
     * @returns Returns the request object, or `null` if it was not found.
     */
    getRequest<T extends Dictionary = Dictionary>(id: string): Promise<Request<T> | null>;
    abstract fetchNextRequest<T extends Dictionary = Dictionary>(options?: RequestOptions): Promise<Request<T> | null>;
    /**
     * Marks a request that was previously returned by the
     * {@apilink RequestQueue.fetchNextRequest}
     * function as handled after successful processing.
     * Handled requests will never again be returned by the `fetchNextRequest` function.
     */
    markRequestHandled(request: Request): Promise<RequestQueueOperationInfo | null>;
    /**
     * Reclaims a failed request back to the queue, so that it can be returned for processing later again
     * by another call to {@apilink RequestQueue.fetchNextRequest}.
     * The request record in the queue is updated using the provided `request` parameter.
     * For example, this lets you store the number of retries or error messages for the request.
     */
    reclaimRequest(request: Request, options?: RequestQueueOperationOptions): Promise<RequestQueueOperationInfo | null>;
    protected abstract ensureHeadIsNonEmpty(): Promise<void>;
    /**
     * Resolves to `true` if the next call to {@apilink RequestQueue.fetchNextRequest}
     * would return `null`, otherwise it resolves to `false`.
     * Note that even if the queue is empty, there might be some pending requests currently being processed.
     * If you need to ensure that there is no activity in the queue, use {@apilink RequestQueue.isFinished}.
     */
    isEmpty(): Promise<boolean>;
    /**
     * Resolves to `true` if all requests were already handled and there are no more left.
     * Due to the nature of distributed storage used by the queue,
     * the function might occasionally return a false negative,
     * but it will never return a false positive.
     */
    isFinished(): Promise<boolean>;
    protected _reset(): void;
    /**
     * Caches information about request to beware of unneeded addRequest() calls.
     */
    protected _cacheRequest(cacheKey: string, queueOperationInfo: RequestQueueOperationInfo): void;
    /**
     * Adds a request straight to the queueHeadDict, to improve performance.
     */
    protected _maybeAddRequestToQueueHead(requestId: string, forefront: boolean): void;
    /**
     * Removes the queue either from the Apify Cloud storage or from the local database,
     * depending on the mode of operation.
     */
    drop(): Promise<void>;
    /**
     * Returns the number of handled requests.
     *
     * This function is just a convenient shortcut for:
     *
     * ```javascript
     * const { handledRequestCount } = await queue.getInfo();
     * ```
     */
    handledCount(): Promise<number>;
    /**
     * Returns an object containing general information about the request queue.
     *
     * The function returns the same object as the Apify API Client's
     * [getQueue](https://docs.apify.com/api/apify-client-js/latest#ApifyClient-requestQueues)
     * function, which in turn calls the
     * [Get request queue](https://apify.com/docs/api/v2#/reference/request-queues/queue/get-request-queue)
     * API endpoint.
     *
     * **Example:**
     * ```
     * {
     *   id: "WkzbQMuFYuamGv3YF",
     *   name: "my-queue",
     *   userId: "wRsJZtadYvn4mBZmm",
     *   createdAt: new Date("2015-12-12T07:34:14.202Z"),
     *   modifiedAt: new Date("2015-12-13T08:36:13.202Z"),
     *   accessedAt: new Date("2015-12-14T08:36:13.202Z"),
     *   totalRequestCount: 25,
     *   handledRequestCount: 5,
     *   pendingRequestCount: 20,
     * }
     * ```
     */
    getInfo(): Promise<RequestQueueInfo | undefined>;
    /**
     * Fetches URLs from requestsFromUrl and returns them in format of list of requests
     */
    protected _fetchRequestsFromUrl(source: InternalSource): Promise<RequestOptions[]>;
    /**
     * Adds all fetched requests from a URL from a remote resource.
     */
    protected _addFetchedRequests(source: InternalSource, fetchedRequests: RequestOptions[], options: RequestQueueOperationOptions): Promise<ProcessedRequest[]>;
    /**
     * @internal wraps public utility for mocking purposes
     */
    private _downloadListOfUrls;
    /**
     * Opens a request queue and returns a promise resolving to an instance
     * of the {@apilink RequestQueue} class.
     *
     * {@apilink RequestQueue} represents a queue of URLs to crawl, which is stored either on local filesystem or in the cloud.
     * The queue is used for deep crawling of websites, where you start with several URLs and then
     * recursively follow links to other pages. The data structure supports both breadth-first
     * and depth-first crawling orders.
     *
     * For more details and code examples, see the {@apilink RequestQueue} class.
     *
     * @param [queueIdOrName]
     *   ID or name of the request queue to be opened. If `null` or `undefined`,
     *   the function returns the default request queue associated with the crawler run.
     * @param [options] Open Request Queue options.
     */
    static open(queueIdOrName?: string | null, options?: StorageManagerOptions): Promise<RequestProvider>;
}
interface RequestLruItem {
    uniqueKey: string;
    isHandled: boolean;
    id: string;
    hydrated: Request | null;
    lockExpiresAt: number | null;
}
export interface RequestProviderOptions {
    id: string;
    name?: string;
    client: StorageClient;
    /**
     * Used to pass the proxy configuration for the `requestsFromUrl` objects.
     * Takes advantage of the internal address rotation and authentication process.
     * If undefined, the `requestsFromUrl` requests will be made without proxy.
     */
    proxyConfiguration?: ProxyConfiguration;
}
/**
 * @deprecated Use {@apilink RequestProviderOptions} instead.
 */
export interface RequestQueueOptions extends RequestProviderOptions {
}
/**
 * @internal
 */
export interface InternalRequestProviderOptions extends RequestProviderOptions {
    logPrefix: string;
    requestCacheMaxSize: number;
    recentlyHandledRequestsMaxSize: number;
}
export interface RequestQueueOperationOptions {
    /**
     * If set to `true`:
     *   - while adding the request to the queue: the request will be added to the foremost position in the queue.
     *   - while reclaiming the request: the request will be placed to the beginning of the queue, so that it's returned
     *   in the next call to {@apilink RequestQueue.fetchNextRequest}.
     * By default, it's put to the end of the queue.
     * @default false
     */
    forefront?: boolean;
}
/**
 * @internal
 */
export interface RequestQueueOperationInfo extends QueueOperationInfo {
    uniqueKey: string;
}
export interface AddRequestsBatchedOptions extends RequestQueueOperationOptions {
    /**
     * Whether to wait for all the provided requests to be added, instead of waiting just for the initial batch of up to `batchSize`.
     * @default false
     */
    waitForAllRequestsToBeAdded?: boolean;
    /**
     * @default 1000
     */
    batchSize?: number;
    /**
     * @default 1000
     */
    waitBetweenBatchesMillis?: number;
}
export interface AddRequestsBatchedResult {
    addedRequests: ProcessedRequest[];
    /**
     * A promise which will resolve with the rest of the requests that were added to the queue.
     *
     * Alternatively, we can set {@apilink AddRequestsBatchedOptions.waitForAllRequestsToBeAdded|`waitForAllRequestsToBeAdded`} to `true`
     * in the {@apilink BasicCrawler.addRequests|`crawler.addRequests()`} options.
     *
     * **Example:**
     *
     * ```ts
     * // Assuming `requests` is a list of requests.
     * const result = await crawler.addRequests(requests);
     *
     * // If we want to wait for the rest of the requests to be added to the queue:
     * await result.waitForAllRequestsToBeAdded;
     * ```
     */
    waitForAllRequestsToBeAdded: Promise<ProcessedRequest[]>;
}
export {};
//# sourceMappingURL=request_provider.d.ts.map