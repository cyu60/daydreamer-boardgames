import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Generate a simple token from password + timestamp
function generateToken(password: string): string {
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Daily rotation
  return createHash('sha256').update(`${password}-${timestamp}-admin`).digest('hex');
}

// Verify token is valid
export function verifyAdminToken(token: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  const expectedToken = generateToken(ADMIN_PASSWORD);
  return token === expectedToken;
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Admin not configured' },
        { status: 500 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(ADMIN_PASSWORD);

    return NextResponse.json({
      success: true,
      token,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Verify existing token
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    if (!verifyAdminToken(token)) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
