import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, userId } = body;

    // Placeholder Stripe customer creation
    const mockCustomer = {
      id: `cus_placeholder_${Date.now()}`,
      object: 'customer',
      email: email,
      name: name,
      metadata: {
        userId: userId,
      },
      created: Date.now() / 1000,
      currency: 'gbp',
      default_source: null,
      description: `Customer for ${email}`,
    };

    return NextResponse.json(mockCustomer);
  } catch (error) {
    console.error('Customer creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID required' },
        { status: 400 }
      );
    }

    // Placeholder customer data
    const mockCustomer = {
      id: customerId,
      object: 'customer',
      email: 'customer@example.com',
      name: 'John Doe',
      created: Date.now() / 1000,
      currency: 'gbp',
      subscriptions: {
        data: [
          {
            id: `sub_placeholder_${Date.now()}`,
            status: 'active',
            current_period_end: Date.now() / 1000 + 2592000, // 30 days from now
            price: {
              id: 'price_placeholder',
              unit_amount: 4700,
              currency: 'gbp',
              recurring: {
                interval: 'month',
              },
            },
          },
        ],
      },
    };

    return NextResponse.json(mockCustomer);
  } catch (error) {
    console.error('Customer fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}