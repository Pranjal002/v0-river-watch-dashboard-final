import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        statusCode: 200,
        message: 'Logged out successfully'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        statusCode: 500,
        errors: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
