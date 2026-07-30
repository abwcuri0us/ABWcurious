import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function BlogsPanel() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blogs</h2>
          <p className="text-muted-foreground">Manage your blog posts or read our latest articles.</p>
        </div>
        <Link href="/blogs/write">
          <Button className="gap-2 rounded-xl">
            <PenTool className="size-4" />
            Write a Blog
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border border-border bg-card/50 backdrop-blur hover:shadow-md transition-all duration-300">
          <CardHeader>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <CardTitle>Explore Blogs</CardTitle>
            <CardDescription>Read the latest articles and insights from our community.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/blogs">
              <Button variant="outline" className="w-full rounded-xl">
                Read Blogs
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
