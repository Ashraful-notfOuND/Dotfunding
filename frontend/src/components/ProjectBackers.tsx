import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Users, DollarSign, Gift, MessageSquare, Calendar, FileText, Download } from 'lucide-react';

interface Backer {
  id: string;
  amount: number;
  date: string;
  backer: {
    id: string;
    name: string;
    email: string | null;
  };
  reward: {
    id: string;
    title: string;
    amount: number;
  } | null;
  pledgeType: 'reward' | 'no-reward';
  message: string | null;
  transactionId: string;
}

interface ProjectBackersProps {
  projectId: string;
  creatorId: string;
}

export function ProjectBackers({ projectId, creatorId }: ProjectBackersProps) {
  const [backers, setBackers] = useState<Backer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalBackers: 0,
    totalPledges: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchBackers();
  }, [projectId, creatorId]);

  const handleDownloadReceipt = async (tranId: string) => {
    try {
      // Fetch transaction to get receipt URL
      const response = await fetch(`http://localhost:5000/api/transactions/${tranId}`);
      if (!response.ok) throw new Error('Failed to fetch transaction');
      
      const data = await response.json();
      const receiptUrl = data.transaction?.receipt_pdf_url;
      
      if (receiptUrl) {
        // Open receipt in new tab for download
        window.open(receiptUrl, '_blank');
      } else {
        alert('Receipt not available for this transaction');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const fetchBackers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}/backers?creator_id=${creatorId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch backers');
      }

      const data = await response.json();
      setBackers(data.backers || []);
      setStats({
        totalBackers: data.totalBackers || 0,
        totalPledges: data.totalPledges || 0,
        totalAmount: data.totalAmount || 0
      });
    } catch (err) {
      console.error('Error fetching backers:', err);
      setError('Failed to load backers list');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading backers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (backers.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No backers yet</h3>
        <p className="mt-2 text-gray-600">
          Your project doesn't have any backers yet. Share it with the world!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Transaction Receipts</h3>
              <p className="text-sm text-blue-700 mt-1">
                You can download transaction receipts for each backer by clicking the "Receipt" button next to their transaction ID.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Backers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBackers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pledges</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPledges}</p>
              </div>
              <Gift className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">৳{stats.totalAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backers List */}
      <Card>
        <CardHeader>
          <CardTitle>All Backers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backers.map((backer) => (
              <div
                key={backer.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Backer Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {backer.backer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{backer.backer.name}</p>
                        {backer.backer.email && (
                          <p className="text-sm text-gray-600">{backer.backer.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Pledge Details */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="default" className="bg-green-600">
                        ৳{backer.amount.toLocaleString()}
                      </Badge>
                      
                      {backer.reward ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Gift className="h-3 w-3" />
                          {backer.reward.title}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          No Reward
                        </Badge>
                      )}

                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(backer.date), 'MMM d, yyyy')}
                      </Badge>
                    </div>

                    {/* Backer Message */}
                    {backer.message && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-blue-900 mb-1">
                              Backer's Message:
                            </p>
                            <p className="text-sm text-gray-700 italic">"{backer.message}"</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transaction ID & Receipt */}
                  <div className="text-right space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Transaction ID:</p>
                      <p className="text-xs font-mono text-gray-600 break-all">
                        {backer.transactionId?.substring(0, 16)}...
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReceipt(backer.transactionId)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Receipt
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
