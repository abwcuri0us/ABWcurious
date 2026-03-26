import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Basic validation
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert into DB
    const submission = await prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    });

    return NextResponse.json({ success: true, data: submission }, { status: 201 });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'Failed to submit contact message' }, { status: 500 });
  }
}
