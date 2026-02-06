import { NextRequest, NextResponse } from 'next/server';

// Mock database of users - In production, use a real database
const users = [
  {
    id: '1',
    email: 'manish@admin.com',
    password: 'Test@123', // In production, store hashed passwords
    name: 'Manish Admin',
    role: 'admin'
  }
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          statusCode: 400,
          errors: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    // Find user (in production, query your database)
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { 
          statusCode: 401,
          errors: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Create a simple JWT-like token (in production, use a proper JWT library)
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // Simple base64 encoding (for demo only - use proper JWT in production)
    const accessToken = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    return NextResponse.json(
      {
        statusCode: 200,
        data: {
          accessToken,
          refreshToken: 'refresh-token-placeholder',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { 
        statusCode: 500,
        errors: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
