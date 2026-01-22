import { Layout } from '@/components/Layout/Layout';

export default function InvitesPage() {
  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-4xl font-bold mb-8">Project Invites</h1>
        <p className="text-gray-600">Clients who invited you directly.</p>
        <div className="mt-8 p-8 bg-gray-100 rounded-xl text-center">
          <p className="text-xl">No invites yet</p>
        </div>
      </div>
    </Layout>
  );
}