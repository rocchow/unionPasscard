import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

interface ProcessTransactionRequest {
  qrData: string
  amount: number
  description?: string
  staffId: string
  venueId?: string
}

interface CustomerInfo {
  id: string
  name: string
  email?: string
  phone?: string
  membership: {
    id: string
    company_name: string
    balance: number
    status: 'active' | 'inactive' | 'suspended'
  }
}

interface TransactionResult {
  success: boolean
  transaction_id?: string
  new_balance?: number
  error?: string
  customer_info?: CustomerInfo
}

// Mock customer data - in real app this would come from database
const mockCustomers: Record<string, CustomerInfo> = {
  'user123': {
    id: 'user123',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    membership: {
      id: 'sgv-basic-1',
      company_name: 'SGV',
      balance: 150.75,
      status: 'active'
    }
  },
  'user456': {
    id: 'user456',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 987-6543',
    membership: {
      id: 'sgv-premium-1',
      company_name: 'SGV',
      balance: 275.50,
      status: 'active'
    }
  }
}

// Mock transactions storage - in real app this would be database
interface MockTransaction {
  id: string
  user_id: string
  amount: number
  type: 'usage' | 'topup'
  description: string
  status: 'completed' | 'pending' | 'failed'
  created_at: string
  staff_id?: string
  venue_id?: string
}

const mockTransactions: MockTransaction[] = []

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has staff privileges
    if (!currentUser.role || !['staff', 'company_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
    }

    const body: ProcessTransactionRequest = await request.json()
    const { qrData, amount, description, staffId, venueId } = body

    // Validate input
    if (!qrData || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid transaction data' }, { status: 400 })
    }

    // Parse QR data
    let parsedQR
    try {
      parsedQR = JSON.parse(qrData)
    } catch {
      return NextResponse.json({ error: 'Invalid QR code format' }, { status: 400 })
    }

    const { userId } = parsedQR
    if (!userId) {
      return NextResponse.json({ error: 'Invalid QR code: missing user ID' }, { status: 400 })
    }

    // Get customer info
    const customer = mockCustomers[userId]
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Check membership status
    if (customer.membership.status !== 'active') {
      return NextResponse.json({ 
        error: `Membership is ${customer.membership.status}` 
      }, { status: 400 })
    }

    // Check sufficient balance
    if (amount > customer.membership.balance) {
      return NextResponse.json({ 
        error: 'Insufficient balance',
        customer_info: customer 
      }, { status: 400 })
    }

    // Process transaction
    const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const newBalance = customer.membership.balance - amount

    // Update customer balance (in real app, this would be database update)
    mockCustomers[userId].membership.balance = newBalance

    // Record transaction
    const transaction = {
      id: transactionId,
      user_id: userId,
      staff_id: staffId,
      venue_id: venueId,
      amount: amount,
      description: description || 'Purchase',
      type: 'usage' as const,
      status: 'completed' as const,
      created_at: new Date().toISOString()
    }

    mockTransactions.push(transaction)

    const result: TransactionResult = {
      success: true,
      transaction_id: transactionId,
      new_balance: newBalance,
      customer_info: mockCustomers[userId]
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Transaction processing error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET endpoint to fetch customer info from QR
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has staff privileges
    if (!currentUser.role || !['staff', 'company_admin', 'super_admin'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const qrData = searchParams.get('qrData')

    if (!qrData) {
      return NextResponse.json({ error: 'Missing QR data' }, { status: 400 })
    }

    // Parse QR data
    let parsedQR
    try {
      parsedQR = JSON.parse(qrData)
    } catch {
      return NextResponse.json({ error: 'Invalid QR code format' }, { status: 400 })
    }

    const { userId } = parsedQR
    if (!userId) {
      return NextResponse.json({ error: 'Invalid QR code: missing user ID' }, { status: 400 })
    }

    // Get customer info
    const customer = mockCustomers[userId]
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ customer_info: customer })

  } catch (error) {
    console.error('Customer lookup error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
