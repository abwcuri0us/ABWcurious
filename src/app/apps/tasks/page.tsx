import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: 'desc' } });
  const notes = await prisma.note.findMany({ orderBy: { createdAt: 'desc' } });

  async function createTask(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    if (title) {
      await prisma.task.create({ data: { title, description } });
      revalidatePath('/apps/tasks');
    }
  }

  async function toggleTask(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const completedStr = formData.get('completed') as string;
    if (id) {
      const completed = completedStr === 'true';
      await prisma.task.update({ where: { id }, data: { completed: !completed } });
      revalidatePath('/apps/tasks');
    }
  }

  async function deleteTask(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (id) {
      await prisma.task.delete({ where: { id } });
      revalidatePath('/apps/tasks');
    }
  }

  async function createNote(formData: FormData) {
    'use server';
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    if (title && content) {
      await prisma.note.create({ data: { title, content, color: '#06BBCC' } });
      revalidatePath('/apps/tasks');
    }
  }

  async function deleteNote(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (id) {
      await prisma.note.delete({ where: { id } });
      revalidatePath('/apps/tasks');
    }
  }

  return (
    <div className="min-vh-100 pt-5">
      <div className="container-fluid pt-5 mt-5 pb-5 mb-5" style={{ background: 'rgba(5, 5, 10, 0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container text-center text-white pt-4">
          <h1 className="display-3 text-white fw-bold mb-3" style={{ textShadow: '0 0 15px rgba(33, 150, 243, 0.6)' }}>
            <i className="bi bi-check2-square text-primary me-3"></i>Tasks & Notes
          </h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: 700 }}>
            Your personal command center for high-priority task tracking and encrypted field notes natively hitting the Prisma Engine.
          </p>
        </div>
      </div>

      <div className="container py-5 mb-5">
        <div className="row g-5">
          {/* TASKS COLUMN */}
          <div className="col-lg-6">
            <div className="glass-card p-4 rounded-4 h-100" style={{ background: 'rgba(10, 10, 20, 0.8)', border: '1px solid rgba(33, 150, 243, 0.2)' }}>
              <h3 className="text-white mb-4 fw-bold d-flex align-items-center"><i className="bi bi-list-task text-primary me-2"></i> Action Items</h3>
              
              <form action={createTask} className="mb-4">
                <div className="input-group">
                  <input type="text" name="title" className="form-control bg-dark text-white border-secondary" required placeholder="Add a new task..." />
                  <button type="submit" className="btn btn-primary fw-bold"><i className="bi bi-plus-lg"></i></button>
                </div>
                <input type="text" name="description" className="form-control bg-dark text-white border-secondary mt-2 small" placeholder="Optional description..." style={{ fontSize: '0.85rem' }} />
              </form>

              <div className="d-flex flex-column gap-3">
                {tasks.length === 0 ? <p className="text-white-50 text-center py-4">No pending tasks.</p> : tasks.map(task => (
                  <div key={task.id} className="p-3 rounded-3 d-flex justify-content-between align-items-center shadow-sm" style={{ background: task.completed ? 'rgba(33, 150, 243, 0.05)' : 'rgba(255, 255, 255, 0.03)', borderLeft: task.completed ? '4px solid #2196f3' : '4px solid #495057' }}>
                    <div>
                      <h6 className={`mb-1 ${task.completed ? 'text-white-50 text-decoration-line-through' : 'text-white'}`}>{task.title}</h6>
                      {task.description && <small className="text-white-50 d-block">{task.description}</small>}
                    </div>
                    <div className="d-flex gap-2">
                       <form action={toggleTask}>
                         <input type="hidden" name="id" value={task.id} />
                         <input type="hidden" name="completed" value={task.completed ? 'true' : 'false'} />
                         <button type="submit" className={`btn btn-sm ${task.completed ? 'btn-primary' : 'btn-outline-secondary'} rounded-circle`} style={{ width: 32, height: 32 }}><i className="bi bi-check2"></i></button>
                       </form>
                       <form action={deleteTask}>
                         <input type="hidden" name="id" value={task.id} />
                         <button type="submit" className="btn btn-sm btn-outline-danger rounded-circle" style={{ width: 32, height: 32 }}><i className="bi bi-trash"></i></button>
                       </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NOTES COLUMN */}
          <div className="col-lg-6">
            <div className="glass-card p-4 rounded-4 h-100" style={{ background: 'rgba(10, 10, 20, 0.8)', border: '1px solid rgba(0, 187, 204, 0.2)' }}>
              <h3 className="text-white mb-4 fw-bold d-flex align-items-center"><i className="bi bi-journal-text text-info me-2"></i> Field Notes</h3>
              
              <form action={createNote} className="mb-4">
                <input type="text" name="title" className="form-control bg-dark text-white border-secondary mb-2" required placeholder="Note Title" />
                <textarea name="content" className="form-control bg-dark text-white border-secondary mb-2" rows={3} required placeholder="Write down your thoughts..."></textarea>
                <button type="submit" className="btn btn-info w-100 fw-bold text-dark">Save Note</button>
              </form>

              <div className="row g-3">
                {notes.length === 0 ? <p className="text-white-50 text-center py-4 w-100">No notes written.</p> : notes.map(note => (
                  <div key={note.id} className="col-12">
                    <div className="p-3 rounded-3 shadow-sm position-relative" style={{ background: 'rgba(255, 255, 255, 0.05)', borderTop: `3px solid ${note.color || '#06BBCC'}` }}>
                      <form action={deleteNote} className="position-absolute top-0 end-0 mt-2 me-2">
                         <input type="hidden" name="id" value={note.id} />
                         <button type="submit" className="btn btn-link text-danger p-0 border-0"><i className="bi bi-x-circle-fill"></i></button>
                      </form>
                      <h6 className="text-white mb-2 pe-4">{note.title}</h6>
                      <p className="text-white-75 mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
