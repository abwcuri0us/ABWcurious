import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.name || !data.email || !data.dob || !data.location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const submission = await prisma.joinRequest.create({
      data: {
        name: data.name,
        email: data.email,
        dob: data.dob,
        location: data.location,
      },
    });

    return NextResponse.json({ success: true, data: submission }, { status: 201 });
  } catch (error) {
    console.error('Join API Error:', error);
    return NextResponse.json({ error: 'Failed to submit join request' }, { status: 500 });
  }
}
