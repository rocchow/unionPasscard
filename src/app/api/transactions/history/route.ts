import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

interface Transaction {
  id: string
  customer_id: string
  staff_id: string
  venue_id?: string
  amount: number
  description: string
  type: 'purchase' | 'usage' | 'refund' | 'adjustment'
  status: 'completed' | 'pending' | 'cancelled' | 'refunded'
  created_at: string
  customer_name?: string
  staff_name?: string
  venue_name?: string
  previous_balance?: number
  new_balance?: number
}

// Mock transactions data - in real app this would come from database
const mockTransactions: Transaction[] = [
  {
    id: 'txn_1704067200000',
    customer_id: 'user123',
    staff_id: 'staff456',
    venue_id: 'sgv-et',
    amount: 45.00,
    description: 'KTV Room 3 - 2 hours',
    type: 'usage',
    status: 'completed',
    created_at: '2024-01-01T10:30:00Z',
    customer_name: 'John Smith',
    staff_name: 'Alice Staff',
    venue_name: 'ET',
    previous_balance: 195.75,
    new_balance: 150.75
  },
  {
    id: 'txn_1704153600000',
    customer_id: 'user456',
    staff_id: 'staff789',
    venue_id: 'sgv-long-feng',
    amount: 28.50,
    description: 'Hotpot dinner for 2',
    type: 'usage',
    status: 'completed',
    created_at: '2024-01-02T18:45:00Z',
    customer_name: 'Jane Doe',
    staff_name: 'Bob Staff',
    venue_name: 'Long Feng Hotpot',
    previous_balance: 304.00,
    new_balance: 275.50
  },
  {
    id: 'txn_1704240000000',
    customer_id: 'user123',
    staff_id: 'staff456',
    venue_id: 'sgv-zui-ktown',
    amount: 15.25,
    description: 'Drinks and snacks',
    type: 'usage',
    status: 'completed',
    created_at: '2024-01-03T20:15:00Z',
    customer_name: 'John Smith',
    staff_name: 'Alice Staff',
    venue_name: 'Zui Beer (K town)',
    previous_balance: 166.00,
    new_balance: 150.75
  }
]

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const staffId = searchParams.get('staffId')
    const venueId = searchParams.get('venueId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let filteredTransactions = [...mockTransactions]

    // Filter by user role and permissions
    if (currentUser.role === 'customer') {
      // Customers can only see their own transactions
      filteredTransactions = filteredTransactions.filter(t => t.customer_id === currentUser.id)
    } else if (currentUser.role && ['staff', 'company_admin', 'super_admin'].includes(currentUser.role)) {
      // Staff can see all transactions, or filter by specific criteria
      if (userId) {
        filteredTransactions = filteredTransactions.filter(t => t.customer_id === userId)
      }
      if (staffId) {
        filteredTransactions = filteredTransactions.filter(t => t.staff_id === staffId)
      }
      if (venueId) {
        filteredTransactions = filteredTransactions.filter(t => t.venue_id === venueId)
      }
    } else {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
    }

    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Apply pagination
    const total = filteredTransactions.length
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit)

    return NextResponse.json({
      transactions: paginatedTransactions,
      total,
      limit,
      offset,
      has_more: offset + limit < total
    })

  } catch (error) {
    console.error('Transaction history error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
