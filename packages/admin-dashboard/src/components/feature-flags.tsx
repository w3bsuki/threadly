import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components/card';
import { Button } from '@repo/design-system/components/button';
import { Badge } from '@repo/design-system/components/badge';
import { Switch } from '@repo/design-system/components/switch';
import { Input } from '@repo/design-system/components/input';
import { Label } from '@repo/design-system/components/label';
import { Textarea } from '@repo/design-system/components/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/design-system/components/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/design-system/components/table';
import { 
  Flag, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Settings,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { formatDate, formatPercentage } from '../utils/formatters';
import type { FeatureFlag } from '../types';

interface FeatureFlagsProps {
  flags: FeatureFlag[];
  onUpdate: (flag: FeatureFlag) => void;
  onCreate: (flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDelete: (flagId: string) => void;
  loading?: boolean;
}

export function FeatureFlags({ 
  flags, 
  onUpdate, 
  onCreate, 
  onDelete, 
  loading = false 
}: FeatureFlagsProps) {
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleToggleFlag = (flag: FeatureFlag) => {
    onUpdate({
      ...flag,
      enabled: !flag.enabled,
      updatedAt: new Date(),
    });
  };

  const handleUpdateRollout = (flag: FeatureFlag, percentage: number) => {
    onUpdate({
      ...flag,
      rolloutPercentage: Math.max(0, Math.min(100, percentage)),
      updatedAt: new Date(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Flag className="h-6 w-6" />
            Feature Flags
          </h2>
          <p className="text-muted-foreground">
            Manage feature rollouts and gradual deployments
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Flag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CreateFlagDialog 
              onCreate={(flag) => {
                onCreate(flag);
                setIsCreateDialogOpen(false);
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Flags</p>
                <p className="text-2xl font-bold">{flags.length}</p>
              </div>
              <Flag className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enabled</p>
                <p className="text-2xl font-bold text-green-600">
                  {flags.filter(f => f.enabled).length}
                </p>
              </div>
              <Activity className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Partial Rollout</p>
                <p className="text-2xl font-bold text-orange-600">
                  {flags.filter(f => f.enabled && f.rolloutPercentage < 100).length}
                </p>
              </div>
              <Users className="h-5 w-5 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Targeted</p>
                <p className="text-2xl font-bold text-purple-600">
                  {flags.filter(f => f.targetUsers && f.targetUsers.length > 0).length}
                </p>
              </div>
              <Settings className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rollout</TableHead>
                <TableHead>Targeting</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags.map((flag) => (
                <TableRow key={flag.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{flag.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {flag.description}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={() => handleToggleFlag(flag)}
                      />
                      <Badge variant={flag.enabled ? "default" : "secondary"}>
                        {flag.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={flag.rolloutPercentage}
                          onChange={(e) => 
                            handleUpdateRollout(flag, parseInt(e.target.value) || 0)
                          }
                          className="w-20"
                          disabled={!flag.enabled}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                      {flag.enabled && flag.rolloutPercentage < 100 && (
                        <Badge variant="outline" className="text-xs">
                          Partial Rollout
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      {flag.targetUsers && flag.targetUsers.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {flag.targetUsers.length} users
                        </Badge>
                      )}
                      {flag.targetRoles && flag.targetRoles.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {flag.targetRoles.join(', ')}
                        </Badge>
                      )}
                      {(!flag.targetUsers || flag.targetUsers.length === 0) && 
                       (!flag.targetRoles || flag.targetRoles.length === 0) && (
                        <span className="text-sm text-muted-foreground">All users</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(flag.createdAt, 'short')}</div>
                      <div className="text-muted-foreground">
                        by {flag.createdBy}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingFlag(flag)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(flag.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {flags.length === 0 && (
            <div className="text-center py-8">
              <Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No feature flags</h3>
              <p className="text-muted-foreground mb-4">
                Create your first feature flag to manage gradual rollouts
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Flag
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingFlag && (
        <Dialog open={true} onOpenChange={() => setEditingFlag(null)}>
          <DialogContent>
            <EditFlagDialog 
              flag={editingFlag}
              onUpdate={(flag) => {
                onUpdate(flag);
                setEditingFlag(null);
              }}
              onCancel={() => setEditingFlag(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface CreateFlagDialogProps {
  onCreate: (flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function CreateFlagDialog({ onCreate, onCancel }: CreateFlagDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: false,
    rolloutPercentage: 0,
    targetUsers: [] as string[],
    targetRoles: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      createdBy: 'current-admin', // This would come from auth context
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Create Feature Flag</DialogTitle>
        <DialogDescription>
          Create a new feature flag for gradual rollout management.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor="name">Flag Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., new_checkout_flow"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this flag controls..."
            required
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(enabled) => setFormData(prev => ({ ...prev, enabled }))}
          />
          <Label htmlFor="enabled">Enable immediately</Label>
        </div>
        
        <div>
          <Label htmlFor="rollout">Initial Rollout Percentage</Label>
          <Input
            id="rollout"
            type="number"
            min="0"
            max="100"
            value={formData.rolloutPercentage}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              rolloutPercentage: parseInt(e.target.value) || 0 
            }))}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.name || !formData.description}>
          Create Flag
        </Button>
      </DialogFooter>
    </form>
  );
}

interface EditFlagDialogProps {
  flag: FeatureFlag;
  onUpdate: (flag: FeatureFlag) => void;
  onCancel: () => void;
}

function EditFlagDialog({ flag, onUpdate, onCancel }: EditFlagDialogProps) {
  const [formData, setFormData] = useState({
    name: flag.name,
    description: flag.description,
    enabled: flag.enabled,
    rolloutPercentage: flag.rolloutPercentage,
    targetUsers: flag.targetUsers || [],
    targetRoles: flag.targetRoles || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...flag,
      ...formData,
      updatedAt: new Date(),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Edit Feature Flag</DialogTitle>
        <DialogDescription>
          Update the configuration for {flag.name}.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        <div>
          <Label htmlFor="name">Flag Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(enabled) => setFormData(prev => ({ ...prev, enabled }))}
          />
          <Label htmlFor="enabled">Enabled</Label>
        </div>
        
        <div>
          <Label htmlFor="rollout">Rollout Percentage</Label>
          <Input
            id="rollout"
            type="number"
            min="0"
            max="100"
            value={formData.rolloutPercentage}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              rolloutPercentage: parseInt(e.target.value) || 0 
            }))}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Update Flag
        </Button>
      </DialogFooter>
    </form>
  );
}