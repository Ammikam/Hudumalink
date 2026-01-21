import { Layout } from '@/components/Layout/Layout';

export default function OpenProjectsPage() {
  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-4xl font-bold mb-8">Open Projects</h1>
        <p className="text-gray-600">Browse projects posted by clients and send proposals.</p>
        {/* Add project list here later */}
        <div className="mt-8 p-8 bg-gray-100 rounded-xl text-center">
          <p className="text-xl">Project list coming soon...</p>
        </div>
      </div>
    </Layout>
  );
}