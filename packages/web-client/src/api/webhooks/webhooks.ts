/**
 * Generated by orval v6.26.0 🍺
 * Do not edit manually.
 * insureai
 * OpenAPI spec version: 0.1.0
 */
import {
  useMutation
} from '@tanstack/react-query'
import type {
  MutationFunction,
  UseMutationOptions,
  UseMutationResult
} from '@tanstack/react-query'
import { customInstance } from '.././mutator/axios';


type SecondParameter<T extends (...args: any) => any> = Parameters<T>[1];


/**
 * @summary Handle Retell Events
 */
export const webhooksHandleRetellEvents = (
    
 options?: SecondParameter<typeof customInstance>,) => {
      
      
      return customInstance<unknown>(
      {url: `/v1/webhooks/retell`, method: 'POST'
    },
      options);
    }
  


export const getWebhooksHandleRetellEventsMutationOptions = <TError = unknown,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof webhooksHandleRetellEvents>>, TError,void, TContext>, request?: SecondParameter<typeof customInstance>}
): UseMutationOptions<Awaited<ReturnType<typeof webhooksHandleRetellEvents>>, TError,void, TContext> => {
const {mutation: mutationOptions, request: requestOptions} = options ?? {};

      


      const mutationFn: MutationFunction<Awaited<ReturnType<typeof webhooksHandleRetellEvents>>, void> = () => {
          

          return  webhooksHandleRetellEvents(requestOptions)
        }

        


  return  { mutationFn, ...mutationOptions }}

    export type WebhooksHandleRetellEventsMutationResult = NonNullable<Awaited<ReturnType<typeof webhooksHandleRetellEvents>>>
    
    export type WebhooksHandleRetellEventsMutationError = unknown

    /**
 * @summary Handle Retell Events
 */
export const useWebhooksHandleRetellEvents = <TError = unknown,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof webhooksHandleRetellEvents>>, TError,void, TContext>, request?: SecondParameter<typeof customInstance>}
): UseMutationResult<
        Awaited<ReturnType<typeof webhooksHandleRetellEvents>>,
        TError,
        void,
        TContext
      > => {

      const mutationOptions = getWebhooksHandleRetellEventsMutationOptions(options);

      return useMutation(mutationOptions);
    }
    /**
 * @summary Handle Cognicue Events
 */
export const webhooksHandleCognicueEvents = (
    
 options?: SecondParameter<typeof customInstance>,) => {
      
      
      return customInstance<unknown>(
      {url: `/v1/webhooks/cognicue`, method: 'POST'
    },
      options);
    }
  


export const getWebhooksHandleCognicueEventsMutationOptions = <TError = unknown,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof webhooksHandleCognicueEvents>>, TError,void, TContext>, request?: SecondParameter<typeof customInstance>}
): UseMutationOptions<Awaited<ReturnType<typeof webhooksHandleCognicueEvents>>, TError,void, TContext> => {
const {mutation: mutationOptions, request: requestOptions} = options ?? {};

      


      const mutationFn: MutationFunction<Awaited<ReturnType<typeof webhooksHandleCognicueEvents>>, void> = () => {
          

          return  webhooksHandleCognicueEvents(requestOptions)
        }

        


  return  { mutationFn, ...mutationOptions }}

    export type WebhooksHandleCognicueEventsMutationResult = NonNullable<Awaited<ReturnType<typeof webhooksHandleCognicueEvents>>>
    
    export type WebhooksHandleCognicueEventsMutationError = unknown

    /**
 * @summary Handle Cognicue Events
 */
export const useWebhooksHandleCognicueEvents = <TError = unknown,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof webhooksHandleCognicueEvents>>, TError,void, TContext>, request?: SecondParameter<typeof customInstance>}
): UseMutationResult<
        Awaited<ReturnType<typeof webhooksHandleCognicueEvents>>,
        TError,
        void,
        TContext
      > => {

      const mutationOptions = getWebhooksHandleCognicueEventsMutationOptions(options);

      return useMutation(mutationOptions);
    }
    