import { PrismaClient } from '../../generated/client'

export interface QueryMetrics {
  model: string
  action: string
  duration: number
  timestamp: Date
  params?: any
}

export interface DatabaseHealth {
  isHealthy: boolean
  connectionCount: number
  slowQueries: number
  errorRate: number
  lastCheck: Date
}

export class DatabaseMonitor {
  private queryMetrics: QueryMetrics[] = []
  private errorCount = 0
  private slowQueryThreshold = 100
  private metricsRetentionMinutes = 60

  constructor(private prisma: PrismaClient) {
    this.setupMiddleware()
    this.startMetricsCleanup()
  }

  private setupMiddleware(): void {
    this.prisma.$use(async (params, next) => {
      const start = Date.now()
      
      try {
        const result = await next(params)
        const duration = Date.now() - start

        this.recordMetric({
          model: params.model || 'unknown',
          action: params.action,
          duration,
          timestamp: new Date(),
          params: process.env.NODE_ENV === 'development' ? params.args : undefined,
        })

        if (duration > this.slowQueryThreshold) {
          this.logSlowQuery(params, duration)
        }

        return result
      } catch (error) {
        this.errorCount++
        throw error
      }
    })
  }

  private recordMetric(metric: QueryMetrics): void {
    this.queryMetrics.push(metric)
  }

  private logSlowQuery(params: any, duration: number): void {
    const message = `Slow query detected: ${params.model}.${params.action} took ${duration}ms`
    
    if (process.env.NODE_ENV === 'production') {
      console.warn(message)
    } else {
      console.warn(message, { args: params.args })
    }
  }

  private startMetricsCleanup(): void {
    setInterval(() => {
      const cutoff = new Date(Date.now() - this.metricsRetentionMinutes * 60 * 1000)
      this.queryMetrics = this.queryMetrics.filter(m => m.timestamp > cutoff)
    }, 60 * 1000)
  }

  getHealth(): DatabaseHealth {
    const recentMetrics = this.getRecentMetrics(5)
    const slowQueries = recentMetrics.filter(m => m.duration > this.slowQueryThreshold).length
    const totalQueries = recentMetrics.length
    const errorRate = totalQueries > 0 ? this.errorCount / totalQueries : 0

    return {
      isHealthy: errorRate < 0.05 && slowQueries < totalQueries * 0.1,
      connectionCount: 1,
      slowQueries,
      errorRate,
      lastCheck: new Date(),
    }
  }

  getRecentMetrics(minutes: number): QueryMetrics[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.queryMetrics.filter(m => m.timestamp > cutoff)
  }

  getMetricsSummary() {
    const metrics = this.getRecentMetrics(60)
    const byModel: Record<string, { count: number; avgDuration: number }> = {}
    const byAction: Record<string, { count: number; avgDuration: number }> = {}

    for (const metric of metrics) {
      const modelKey = metric.model
      const actionKey = metric.action

      if (!byModel[modelKey]) {
        byModel[modelKey] = { count: 0, avgDuration: 0 }
      }
      if (!byAction[actionKey]) {
        byAction[actionKey] = { count: 0, avgDuration: 0 }
      }

      byModel[modelKey].count++
      byModel[modelKey].avgDuration = 
        (byModel[modelKey].avgDuration * (byModel[modelKey].count - 1) + metric.duration) / 
        byModel[modelKey].count

      byAction[actionKey].count++
      byAction[actionKey].avgDuration = 
        (byAction[actionKey].avgDuration * (byAction[actionKey].count - 1) + metric.duration) / 
        byAction[actionKey].count
    }

    return {
      totalQueries: metrics.length,
      slowQueries: metrics.filter(m => m.duration > this.slowQueryThreshold).length,
      averageDuration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length || 0,
      byModel,
      byAction,
      errorCount: this.errorCount,
      period: '60 minutes',
    }
  }

  async checkDatabaseConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return true
    } catch {
      return false
    }
  }

  async getTableSizes(): Promise<Array<{ table: string; size: string; rows: string }>> {
    try {
      const result = await this.prisma.$queryRaw<Array<{ table_name: string; total_size: string; row_estimate: string }>>`
        SELECT 
          schemaname || '.' || tablename AS table_name,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
          to_char(n_live_tup, 'FM999,999,999,999') AS row_estimate
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 20
      `

      return result.map(row => ({
        table: row.table_name,
        size: row.total_size,
        rows: row.row_estimate,
      }))
    } catch (error) {
      console.error('Failed to get table sizes:', error)
      return []
    }
  }

  async getSlowQueries(limit = 10): Promise<Array<{ query: string; calls: number; mean_time: number }>> {
    try {
      const result = await this.prisma.$queryRaw<Array<{ query: string; calls: string; mean_exec_time: number }>>`
        SELECT 
          query,
          calls::text,
          mean_exec_time
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat_statements%'
        ORDER BY mean_exec_time DESC
        LIMIT ${limit}
      `

      return result.map(row => ({
        query: row.query.substring(0, 100) + '...',
        calls: parseInt(row.calls),
        mean_time: Math.round(row.mean_exec_time),
      }))
    } catch (error) {
      console.error('Failed to get slow queries:', error)
      return []
    }
  }

  resetMetrics(): void {
    this.queryMetrics = []
    this.errorCount = 0
  }
}

export const createDatabaseMonitor = (prisma: PrismaClient): DatabaseMonitor => {
  return new DatabaseMonitor(prisma)
}