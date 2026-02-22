import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  function_name: string;
  error_message: string;
  error_details: any;
  user_id: string | null;
  created_at: string;
}

const FUNCTION_NAMES = [
  'analyze-personality',
  'analyze-human-design',
  'analyze-integrated',
  'recalculate-results',
  'create-user',
  'edit-user',
];

const AdminLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [functionFilter, setFunctionFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase
      .from('edge_function_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (functionFilter && functionFilter !== 'all') {
      query = query.eq('function_name', functionFilter);
    }
    if (dateFrom) {
      query = query.gte('created_at', new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) {
      toast.error('Erro ao carregar logs: ' + error.message);
    } else {
      setLogs((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [functionFilter, dateFrom, dateTo]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClearLogs = async () => {
    if (!confirm('Tem certeza que deseja limpar os logs filtrados?')) return;

    let query = supabase.from('edge_function_logs').delete();

    if (functionFilter && functionFilter !== 'all') {
      query = query.eq('function_name', functionFilter);
    }
    if (dateFrom) {
      query = query.gte('created_at', new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    // Need at least one filter to avoid deleting everything accidentally
    if (!functionFilter || functionFilter === 'all') {
      if (!dateFrom && !dateTo) {
        query = query.lt('created_at', new Date().toISOString());
      }
    }

    const { error } = await query;
    if (error) {
      toast.error('Erro ao limpar logs: ' + error.message);
    } else {
      toast.success('Logs limpos com sucesso');
      fetchLogs();
    }
  };

  const getFunctionColor = (name: string) => {
    const colors: Record<string, string> = {
      'analyze-personality': 'bg-blue-500/10 text-blue-500',
      'analyze-human-design': 'bg-purple-500/10 text-purple-500',
      'analyze-integrated': 'bg-green-500/10 text-green-500',
      'recalculate-results': 'bg-orange-500/10 text-orange-500',
      'create-user': 'bg-cyan-500/10 text-cyan-500',
      'edit-user': 'bg-pink-500/10 text-pink-500',
    };
    return colors[name] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-2xl">Logs de Erro</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleClearLogs}>
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="w-48">
              <Select value={functionFilter} onValueChange={setFunctionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as funções" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as funções</SelectItem>
                  {FUNCTION_NAMES.map(fn => (
                    <SelectItem key={fn} value={fn}>{fn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              placeholder="De"
              className="w-40"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              placeholder="Até"
              className="w-40"
            />
          </div>

          {/* Table */}
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {loading ? 'Carregando...' : 'Nenhum log encontrado.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Data/Hora</TableHead>
                  <TableHead className="w-[180px]">Função</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead className="w-[100px]">Usuário</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <>
                    <TableRow key={log.id} className="cursor-pointer" onClick={() => toggleRow(log.id)}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getFunctionColor(log.function_name)}>
                          {log.function_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[400px] truncate text-sm">
                        {log.error_message}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.user_id ? log.user_id.slice(0, 8) + '...' : '—'}
                      </TableCell>
                      <TableCell>
                        {expandedRows.has(log.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(log.id) && (
                      <TableRow key={`${log.id}-details`}>
                        <TableCell colSpan={5}>
                          <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-64">
                            {JSON.stringify(log.error_details, null, 2)}
                          </pre>
                          {log.user_id && (
                            <p className="text-xs text-muted-foreground mt-2">
                              User ID completo: {log.user_id}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogs;
