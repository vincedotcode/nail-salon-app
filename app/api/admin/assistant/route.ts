import { streamText, convertToModelMessages, tool } from 'ai'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { getAdmin } from '@/lib/auth'

export async function POST(req: Request) {
  const admin = await getAdmin()
  if (!admin) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages } = await req.json()

  // Business analytics tools
  const tools = {
    getTopClients: tool({
      description: 'Get the top clients by number of bookings or total spent',
      inputSchema: z.object({
        limit: z.number().default(5),
        metric: z.enum(['bookings', 'revenue']).default('bookings'),
      }),
      execute: async ({ limit, metric }) => {
        if (metric === 'bookings') {
          const result = await sql`
            SELECT u.full_name, u.email, u.phone, COUNT(b.id) as booking_count,
                   COALESCE(SUM(COALESCE(b.final_price, s.price)), 0) as total_spent
            FROM users u
            LEFT JOIN bookings b ON u.id = b.user_id
            LEFT JOIN services s ON b.service_id = s.id
            WHERE b.status IN ('completed', 'confirmed')
            GROUP BY u.id
            ORDER BY booking_count DESC
            LIMIT ${limit}
          `
          return { clients: result, metric: 'Most bookings' }
        } else {
          const result = await sql`
            SELECT u.full_name, u.email, u.phone, COUNT(b.id) as booking_count,
                   COALESCE(SUM(COALESCE(b.final_price, s.price)), 0) as total_spent
            FROM users u
            LEFT JOIN bookings b ON u.id = b.user_id
            LEFT JOIN services s ON b.service_id = s.id
            WHERE b.status = 'completed'
            GROUP BY u.id
            ORDER BY total_spent DESC
            LIMIT ${limit}
          `
          return { clients: result, metric: 'Highest spenders' }
        }
      },
    }),

    getRevenueStats: tool({
      description: 'Get revenue statistics for a time period',
      inputSchema: z.object({
        period: z.enum(['today', 'week', 'month', 'year']).default('month'),
      }),
      execute: async ({ period }) => {
        let interval = '1 month'
        if (period === 'today') interval = '1 day'
        else if (period === 'week') interval = '7 days'
        else if (period === 'year') interval = '1 year'

        const current = await sql`
          SELECT COALESCE(SUM(COALESCE(b.final_price, s.price)), 0) as revenue,
                 COUNT(b.id) as bookings
          FROM bookings b
          LEFT JOIN services s ON b.service_id = s.id
          WHERE b.status = 'completed'
            AND b.booking_date >= CURRENT_DATE - ${interval}::interval
        `

        const previous = await sql`
          SELECT COALESCE(SUM(COALESCE(b.final_price, s.price)), 0) as revenue,
                 COUNT(b.id) as bookings
          FROM bookings b
          LEFT JOIN services s ON b.service_id = s.id
          WHERE b.status = 'completed'
            AND b.booking_date >= CURRENT_DATE - (${interval}::interval * 2)
            AND b.booking_date < CURRENT_DATE - ${interval}::interval
        `

        return {
          period,
          current: current[0],
          previous: previous[0],
          change: current[0].revenue > 0 && previous[0].revenue > 0
            ? ((current[0].revenue - previous[0].revenue) / previous[0].revenue * 100).toFixed(1)
            : 0
        }
      },
    }),

    getPopularServices: tool({
      description: 'Get the most popular services',
      inputSchema: z.object({ limit: z.number().default(5) }),
      execute: async ({ limit }) => {
        const result = await sql`
          SELECT s.name, s.price, COUNT(b.id) as booking_count,
                 COALESCE(SUM(COALESCE(b.final_price, s.price)), 0) as total_revenue
          FROM services s
          LEFT JOIN bookings b ON s.id = b.service_id AND b.status IN ('completed', 'confirmed')
          WHERE s.is_active = true
          GROUP BY s.id
          ORDER BY booking_count DESC
          LIMIT ${limit}
        `
        return { services: result }
      },
    }),

    getBookingStats: tool({
      description: 'Get booking statistics',
      inputSchema: z.object({
        period: z.enum(['today', 'week', 'month']).default('week'),
      }),
      execute: async ({ period }) => {
        let interval = '7 days'
        if (period === 'today') interval = '1 day'
        else if (period === 'month') interval = '30 days'

        const stats = await sql`
          SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
            COUNT(*) FILTER (WHERE status = 'completed') as completed,
            COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
          FROM bookings
          WHERE booking_date >= CURRENT_DATE - ${interval}::interval
        `
        return { period, stats: stats[0] }
      },
    }),

    getInactiveClients: tool({
      description: 'Get clients who have not visited in a while',
      inputSchema: z.object({
        days: z.number().default(60),
        limit: z.number().default(10),
      }),
      execute: async ({ days, limit }) => {
        const result = await sql`
          SELECT u.full_name, u.email, u.phone, 
                 MAX(b.booking_date) as last_visit,
                 COUNT(b.id) as total_visits
          FROM users u
          LEFT JOIN bookings b ON u.id = b.user_id AND b.status = 'completed'
          GROUP BY u.id
          HAVING MAX(b.booking_date) < CURRENT_DATE - ${days}
             OR MAX(b.booking_date) IS NULL
          ORDER BY last_visit DESC NULLS LAST
          LIMIT ${limit}
        `
        return { clients: result, days }
      },
    }),

    getAverageBookingValue: tool({
      description: 'Get the average booking value',
      inputSchema: z.object({}),
      execute: async () => {
        const result = await sql`
          SELECT AVG(COALESCE(b.final_price, s.price)) as average_value,
                 MIN(COALESCE(b.final_price, s.price)) as min_value,
                 MAX(COALESCE(b.final_price, s.price)) as max_value
          FROM bookings b
          LEFT JOIN services s ON b.service_id = s.id
          WHERE b.status = 'completed'
        `
        return result[0]
      },
    }),
  }

  const result = streamText({
    model: 'google/gemini-2.0-flash',
    system: `You are an AI business partner for DS Nails, a nail salon owned by Diya in Mauritius. 
    You help analyze business data, provide insights, and answer questions about clients, bookings, and revenue.
    
    Be friendly, professional, and insightful. Use the provided tools to fetch real data.
    Format numbers nicely (e.g., Rs 1,500 for currency).
    Provide actionable recommendations when appropriate.
    Keep responses concise but informative.`,
    messages: await convertToModelMessages(messages),
    tools,
    maxSteps: 5,
  })

  return result.toUIMessageStreamResponse()
}
