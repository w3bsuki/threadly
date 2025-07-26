'use client'

import { useState, useCallback, useTransition } from 'react'
import { ServerActionResult, ActionState } from '../types'

export interface UseServerActionOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  onSettled?: () => void
}

export function useServerAction<TInput, TOutput>(
  action: (input: TInput) => Promise<ServerActionResult<TOutput>>,
  options?: UseServerActionOptions
) {
  const [state, setState] = useState<ActionState<TOutput>>({ status: 'idle' })
  const [isPending, startTransition] = useTransition()

  const execute = useCallback(
    async (input: TInput) => {
      setState({ status: 'loading' })

      try {
        const result = await action(input)

        if (result.success) {
          setState({ status: 'success', data: result.data })
          options?.onSuccess?.(result.data)
        } else {
          setState({ status: 'error', error: result.error })
          options?.onError?.(result.error)
        }

        return result
      } catch (error) {
        const errorData = {
          message: error instanceof Error ? error.message : 'An error occurred',
          code: 'UNKNOWN_ERROR',
        }
        setState({ status: 'error', error: errorData })
        options?.onError?.(errorData)
        
        return {
          success: false,
          error: errorData,
        } as ServerActionResult<TOutput>
      } finally {
        options?.onSettled?.()
      }
    },
    [action, options]
  )

  const executeWithTransition = useCallback(
    (input: TInput) => {
      startTransition(() => {
        execute(input)
      })
    },
    [execute]
  )

  const reset = useCallback(() => {
    setState({ status: 'idle' })
  }, [])

  return {
    execute,
    executeWithTransition,
    state,
    isPending: state.status === 'loading' || isPending,
    isIdle: state.status === 'idle',
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    data: state.status === 'success' ? state.data : undefined,
    error: state.status === 'error' ? state.error : undefined,
    reset,
  }
}

export function useOptimisticServerAction<TInput, TOutput, TOptimistic = TOutput>(
  action: (input: TInput) => Promise<ServerActionResult<TOutput>>,
  options?: UseServerActionOptions & {
    optimisticUpdate?: (currentData: TOptimistic | undefined, input: TInput) => TOptimistic
  }
) {
  const [optimisticData, setOptimisticData] = useState<TOptimistic | undefined>()
  const serverAction = useServerAction(action, {
    ...options,
    onSuccess: (data) => {
      setOptimisticData(undefined)
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      setOptimisticData(undefined)
      options?.onError?.(error)
    },
  })

  const execute = useCallback(
    async (input: TInput) => {
      if (options?.optimisticUpdate) {
        setOptimisticData(options.optimisticUpdate(optimisticData, input))
      }
      return serverAction.execute(input)
    },
    [serverAction, options, optimisticData]
  )

  return {
    ...serverAction,
    execute,
    optimisticData,
  }
}

export function useInfiniteServerAction<TInput extends { cursor?: string }, TOutput extends { nextCursor?: string | null }>(
  action: (input: TInput) => Promise<ServerActionResult<TOutput>>,
  options?: UseServerActionOptions
) {
  const [pages, setPages] = useState<TOutput[]>([])
  const [hasMore, setHasMore] = useState(true)
  const serverAction = useServerAction(action, options)

  const loadMore = useCallback(
    async (input: Omit<TInput, 'cursor'>) => {
      const lastPage = pages[pages.length - 1]
      const cursor = lastPage?.nextCursor

      if (!hasMore || serverAction.isLoading) return

      const result = await serverAction.execute({
        ...input,
        cursor,
      } as TInput)

      if (result.success) {
        setPages((prev) => [...prev, result.data])
        setHasMore(result.data.nextCursor !== null)
      }

      return result
    },
    [pages, hasMore, serverAction]
  )

  const reset = useCallback(() => {
    setPages([])
    setHasMore(true)
    serverAction.reset()
  }, [serverAction])

  return {
    ...serverAction,
    pages,
    hasMore,
    loadMore,
    reset,
  }
}