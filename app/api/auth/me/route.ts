import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { 
          statusCode: 401,
          errors: 'Unauthorized' 
        },
        { status: 401 }
      );
    }

    try {
      // Decode the token (simple base64 for demo)
      const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

      // Check if token is expired
      if (decodedToken.exp && decodedToken.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.json(
          { 
            statusCode: 401,
            errors: 'Token expired' 
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          statusCode: 200,
          data: {
            id: decodedToken.id,
            email: decodedToken.email,
            name: decodedToken.name,
            role: decodedToken.role
          }
        },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { 
          statusCode: 401,
          errors: 'Invalid token' 
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { 
        statusCode: 500,
        errors: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
