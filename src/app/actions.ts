'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// Extremely critical to avoid multiple connections in Dev mode
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function loginDashboardUser(email: string, pass: string) {
  const user = await prisma.dashboardUser.findUnique({ where: { email } });
  if (!user) return { success: false, error: 'Identity Matrix Not Found' };
  if (user.password !== pass) return { success: false, error: 'Encryption Override Failed' };
  return { success: true, user };
}

export async function registerDashboardUser(data: any) {
  const existing = await prisma.dashboardUser.findUnique({ where: { email: data.email } });
  if (existing) return { success: false, error: 'Vector Binding (Email) already exists in network' };
  
  const user = await prisma.dashboardUser.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      designation: data.designation || 'Client Node',
      contact: data.contact,
      age: "0", // Defaulting mapping
      role: data.role || 'user'
    }
  });
  return { success: true, user };
}

export async function getDashboardUsers() {
  return await prisma.dashboardUser.findMany();
}

export async function adminUpdateUser(id: string, name: string, designation: string) {
  await prisma.dashboardUser.update({ where: { id }, data: { name, designation } });
  return true;
}

export async function adminDeleteUser(id: string) {
  await prisma.dashboardUser.delete({ where: { id } });
  return true;
}

export async function updateProfileIdentity(id: string, data: any) {
  await prisma.dashboardUser.update({
    where: { id },
    data: {
      name: data.name,
      designation: data.designation,
      contact: data.contact,
      age: data.age,
      email: data.email
    }
  });
  return true;
}

export async function deleteOwnAccount(id: string) {
  await prisma.dashboardUser.delete({ where: { id } });
  return true;
}

export async function changeOwnPassword(id: string, password: string) {
  await prisma.dashboardUser.update({ where: { id }, data: { password } });
  return true;
}

export async function getPrivateChat(userId: string) {
  if (!userId) return [];
  return await prisma.privateMessage.findMany({ 
    where: { userId }, 
    orderBy: { timestamp: 'asc' }, 
    take: 200 
  });
}

export async function sendPrivateChat(sender: string, text: string, userId: string) {
  await prisma.privateMessage.create({
    data: {
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      userId
    }
  });
  return true;
}

export async function submitFormDrop(type: string, title: string, details: string, submittedBy: string) {
  await prisma.formDrop.create({
    data: {
      type,
      title,
      details,
      submittedBy,
      date: new Date().toLocaleString()
    }
  });
  return true;
}

export async function getFormDrops() {
  return await prisma.formDrop.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function deleteFormDrop(id: string) {
  await prisma.formDrop.delete({ where: { id } });
  return true;
}

// ── Contact & Feedback Actions ──────────────────────────────────────────────

export async function submitContactQuery(data: { name: string; email: string; subject: string; message: string }) {
  await prisma.contactSubmission.create({ data: { ...data, status: 'new' } });
  return { success: true };
}

export async function getContactSubmissions() {
  return await prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function updateContactStatus(id: string, status: string) {
  await prisma.contactSubmission.update({ where: { id }, data: { status } });
  return true;
}

export async function deleteContactSubmission(id: string) {
  await prisma.contactSubmission.delete({ where: { id } });
  return true;
}

export async function submitFeedback(name: string, email: string, rating: number, comment: string) {
  await prisma.feedback.create({ data: { name, email, rating, comment } });
  return { success: true };
}

export async function getFeedbacks() {
  return await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function deleteFeedback(id: string) {
  await prisma.feedback.delete({ where: { id } });
  return true;
}

// ---------------------------------------------------------------------------
// ORDER MANAGEMENT & PAYMENT LOGIC (Admin & Checkout)
// ---------------------------------------------------------------------------

export async function submitOrder(data: {
  customerName: string;
  customerEmail: string;
  planName: string;
  serviceCategory: string;
  amount: string;
  upiUtrString: string;
}) {
  try {
    const newOrder = await prisma.order.create({ data });
    revalidatePath('/dashboard');
    return { success: true, order: newOrder };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getOrders() {
  try {
    return await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
  } catch (err) {
    return [];
  }
}

export async function verifyOrder(id: string, action: 'verified' | 'rejected') {
  try {
    await prisma.order.update({
      where: { id },
      data: { status: action }
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
