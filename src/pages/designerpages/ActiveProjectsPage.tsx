import { Layout } from '@/components/Layout/Layout';

export default function ActiveProjectsPage() {
  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-4xl font-bold mb-8">Active Projects</h1>
        <p className="text-gray-600">Projects you're currently working on.</p>
        <div className="mt-8 p-8 bg-gray-100 rounded-xl text-center">
          <p className="text-xl">No active projects</p>
        </div>
      </div>
    </Layout>
  );
}