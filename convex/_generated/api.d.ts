/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

<<<<<<< HEAD
import type * as mutations from "../mutations.js";
import type * as myFunctions from "../myFunctions.js";
import type * as queries from "../queries.js";
=======
import type * as http from "../http.js";
import type * as myFunctions from "../myFunctions.js";
import type * as scrape from "../scrape.js";
>>>>>>> 157c912d87055510f9bc2a1332b2aa9d7baab5c8

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
<<<<<<< HEAD
  mutations: typeof mutations;
  myFunctions: typeof myFunctions;
  queries: typeof queries;
=======
  http: typeof http;
  myFunctions: typeof myFunctions;
  scrape: typeof scrape;
>>>>>>> 157c912d87055510f9bc2a1332b2aa9d7baab5c8
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
