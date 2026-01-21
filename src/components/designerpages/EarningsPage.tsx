import { Layout } from '@/components/Layout/Layout';

export default function EarningsPage() {
  return (
    <Layout>
      <div className="container mx-auto py-12">
        <h1 className="text-4xl font-bold mb-8">Earnings & Reviews</h1>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-600">Total Earnings</p>
            <p className="text-4xl font-bold mt-2">KSh 0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-600">Average Rating</p>
            <p className="text-4xl font-bold mt-2">—</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-600">Reviews</p>
            <p className="text-4xl font-bold mt-2">0</p>
          </div>
        </div>
        <div className="bg-gray-100 p-8 rounded-xl text-center">
          <p className="text-xl">Earnings will appear here after completing projects</p>
        </div>
      </div>
    </Layout>
  );
}