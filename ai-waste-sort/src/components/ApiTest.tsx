import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { aiApi, restApi } from '@/lib/api';
import { getCurrentUser, isAuthenticated } from '@/services/auth';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const ApiTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const user = getCurrentUser();

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    const testResults: TestResult[] = [];

    // Test 1: Authentication Status
    testResults.push({
      name: 'Authentication Status',
      status: isAuthenticated() ? 'success' : 'warning',
      message: isAuthenticated() 
        ? `Logged in as: ${user?.name || 'Unknown'}` 
        : 'Not authenticated - some tests will be skipped',
      details: user
    });

    // Test 2: Python AI Server Health
    try {
      const aiHealthResponse = await aiApi.get('/health', { timeout: 5000 });
      testResults.push({
        name: 'AI Server (Python)',
        status: 'success',
        message: 'AI server is running and model is loaded',
        details: aiHealthResponse.data
      });
    } catch (error: any) {
      testResults.push({
        name: 'AI Server (Python)',
        status: 'error',
        message: error.code === 'ECONNREFUSED' 
          ? 'AI server not running (port 8000)' 
          : 'AI server error',
        details: error.message
      });
    }

    // Test 3: REST API Server Health
    try {
      const restHealthResponse = await restApi.get('/health', { timeout: 5000 });
      testResults.push({
        name: 'REST API Server',
        status: 'success',
        message: 'REST API server is running',
        details: restHealthResponse.data
      });
    } catch (error: any) {
      testResults.push({
        name: 'REST API Server',
        status: 'error',
        message: error.code === 'ECONNREFUSED' 
          ? 'REST server not running (port 3000)' 
          : 'REST server error',
        details: error.message
      });
    }

    // Test 4: Classification History (if authenticated)
    if (isAuthenticated() && user) {
      try {
        const historyResponse = await restApi.get(`/classification/classify/history/${user._id}`);
        testResults.push({
          name: 'Classification History API',
          status: 'success',
          message: `Found ${historyResponse.data.data?.length || 0} classification records`,
          details: historyResponse.data
        });
      } catch (error: any) {
        testResults.push({
          name: 'Classification History API',
          status: 'error',
          message: 'Failed to fetch classification history',
          details: error.response?.data || error.message
        });
      }
    } else {
      testResults.push({
        name: 'Classification History API',
        status: 'warning',
        message: 'Skipped - authentication required',
        details: null
      });
    }

    setResults([...testResults]);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status]} className="ml-2">
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="p-4 mb-6 border-dashed">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">API Integration Test</h3>
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          size="sm"
          variant="outline"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            'Run Tests'
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
              <div className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <span className="font-medium">{result.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-2">{result.message}</span>
                {getStatusBadge(result.status)}
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !isRunning && (
        <p className="text-sm text-muted-foreground">
          Click "Run Tests" to verify all API endpoints are working correctly.
        </p>
      )}
    </Card>
  );
};

export default ApiTest;