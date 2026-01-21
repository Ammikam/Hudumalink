import { Layout } from '@/components/Layout/Layout';

export default function ProposalsPage() {
  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-4xl font-bold mb-8">My Proposals</h1>
        <p className="text-gray-600">Track proposals you've sent.</p>
        <div className="mt-8 p-8 bg-gray-100 rounded-xl text-center">
          <p className="text-xl">No proposals sent yet</p>
        </div>
      </div>
    </Layout>
  );
}