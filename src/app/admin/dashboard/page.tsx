import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ShieldAlert, Users, Mail, Clock } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Fetch data
  const contacts = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const joins = await prisma.joinRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-vh-100 pt-5 mt-5">
      <div className="container py-5">
        <div className="d-flex align-items-center justify-content-between mb-5">
          <div>
            <h1 className="fw-bold text-white d-flex align-items-center gap-3">
              <ShieldAlert className="text-primary" size={36} />
              System Dashboard
            </h1>
            <p className="text-white-50 mb-0">Authorized Admin Access Only</p>
          </div>
          <Link href="/api/auth/signout" className="btn btn-outline-danger px-4">
            Terminate Session
          </Link>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="glass-card p-4 text-center">
              <Mail className="text-primary mb-3 mx-auto" size={40} />
              <h2 className="display-4 fw-bold text-white mb-0">{contacts.length}</h2>
              <p className="text-white-50 mb-0">Total Contact Messages</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="glass-card p-4 text-center">
              <Users className="text-primary mb-3 mx-auto" size={40} />
              <h2 className="display-4 fw-bold text-white mb-0">{joins.length}</h2>
              <p className="text-white-50 mb-0">Join Requests</p>
            </div>
          </div>
        </div>

        {/* Contact Submissions Table */}
        <h3 className="text-white mb-3 fw-bold">Recent Messages</h3>
        <div className="glass-panel p-0 overflow-hidden rounded-4 mb-5">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th className="bg-transparent text-white-50 py-3 ps-4 border-bottom border-white border-opacity-10">Name</th>
                  <th className="bg-transparent text-white-50 py-3 border-bottom border-white border-opacity-10">Email</th>
                  <th className="bg-transparent text-white-50 py-3 border-bottom border-white border-opacity-10">Subject</th>
                  <th className="bg-transparent text-white-50 py-3 border-bottom border-white border-opacity-10">Message</th>
                  <th className="bg-transparent text-white-50 py-3 pe-4 border-bottom border-white border-opacity-10">Date</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-4 bg-transparent text-white-50">No messages yet.</td></tr>
                )}
                {contacts.map((c) => (
                  <tr key={c.id}>
                    <td className="bg-transparent py-3 ps-4 text-white">{c.name}</td>
                    <td className="bg-transparent py-3"><a href={`mailto:${c.email}`} className="text-primary">{c.email}</a></td>
                    <td className="bg-transparent py-3 text-white">{c.subject}</td>
                    <td className="bg-transparent py-3 text-white-50 small" style={{ maxWidth: '300px' }}>{c.message}</td>
                    <td className="bg-transparent py-3 pe-4 text-white-50 small"><Clock size={14} className="me-1"/>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Join Requests Table */}
        <h3 className="text-white mb-3 fw-bold">Join Requests</h3>
        <div className="glass-panel p-0 overflow-hidden rounded-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th className="bg-transparent text-white-50 py-3 ps-4 border-bottom border-white border-opacity-10">Name</th>
                  <th className="bg-transparent text-white-50 py-3 border-bottom border-white border-opacity-10">Email</th>
                  <th className="bg-transparent text-white-50 py-3 border-bottom border-white border-opacity-10">DOB</th>
                  <th className="bg-transparent text-white-50 py-3 border-bottom border-white border-opacity-10">Location</th>
                  <th className="bg-transparent text-white-50 py-3 pe-4 border-bottom border-white border-opacity-10">Date</th>
                </tr>
              </thead>
              <tbody>
                {joins.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-4 bg-transparent text-white-50">No join requests yet.</td></tr>
                )}
                {joins.map((j) => (
                  <tr key={j.id}>
                    <td className="bg-transparent py-3 ps-4 text-white">{j.name}</td>
                    <td className="bg-transparent py-3"><a href={`mailto:${j.email}`} className="text-primary">{j.email}</a></td>
                    <td className="bg-transparent py-3 text-white">{j.dob}</td>
                    <td className="bg-transparent py-3 text-white">{j.location}</td>
                    <td className="bg-transparent py-3 pe-4 text-white-50 small"><Clock size={14} className="me-1"/>{new Date(j.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
