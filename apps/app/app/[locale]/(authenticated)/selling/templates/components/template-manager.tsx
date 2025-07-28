'use client';

import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/design-system/components';
import {
  Copy,
  DollarSign,
  Edit,
  MoreHorizontal,
  Package,
  Plus,
  Star,
  Tag,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '@/lib/locale-format';
import { TemplateForm } from './template-form';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  condition: string | null;
  brand: string | null;
  size: string | null;
  color: string | null;
  basePrice: number | null;
  tags: string[];
  isDefault: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
}

interface TemplateManagerProps {
  initialTemplates: Template[];
  categories: Category[];
  locale: string;
  dictionary: Record<string, string>;
}

export function TemplateManager({
  initialTemplates,
  categories,
  locale,
  dictionary,
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTemplate = async (templateData: Partial<Template>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/seller/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        const { template } = await response.json();
        setTemplates((prev) => [template, ...prev]);
        setIsCreateOpen(false);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTemplate = async (
    id: string,
    templateData: Partial<Template>
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/seller/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        const { template } = await response.json();
        setTemplates((prev) => prev.map((t) => (t.id === id ? template : t)));
        setEditingTemplate(null);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/seller/templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    const duplicateData = {
      name: `${template.name} (Copy)`,
      description: template.description,
      category: template.category,
      condition: template.condition,
      brand: template.brand,
      size: template.size,
      color: template.color,
      basePrice: template.basePrice,
      tags: template.tags,
      isDefault: false,
    };

    await handleCreateTemplate(duplicateData);
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      await fetch(`/api/seller/templates/${templateId}`, {
        method: 'POST',
      });
      // Increment usage count locally
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
        )
      );
    } catch (error) {}
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'No category';
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || 'Unknown category';
  };

  const getConditionText = (condition: string | null) => {
    if (!condition) return 'No condition set';
    switch (condition) {
      case 'NEW_WITH_TAGS':
        return 'New with tags';
      case 'NEW_WITHOUT_TAGS':
        return 'New without tags';
      case 'VERY_GOOD':
        return 'Very good';
      case 'GOOD':
        return 'Good';
      case 'SATISFACTORY':
        return 'Satisfactory';
      default:
        return condition;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {templates.length} template{templates.length !== 1 ? 's' : ''}
          </Badge>
          {templates.some((t) => t.isDefault) && (
            <Badge>
              <Star className="mr-1 h-3 w-3" />
              {templates.filter((t) => t.isDefault).length} default
            </Badge>
          )}
        </div>

        <Dialog onOpenChange={setIsCreateOpen} open={isCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <TemplateForm
              categories={categories}
              isLoading={isLoading}
              onCancel={() => setIsCreateOpen(false)}
              onSubmit={handleCreateTemplate}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-lg">No templates yet</h3>
              <p className="mb-4 text-muted-foreground">
                Create your first template to speed up listing creation
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card className="relative" key={template.id}>
              {template.isDefault && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Star className="mr-1 h-3 w-3" />
                    Default
                  </Badge>
                </div>
              )}

              <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="h-8 w-8 bg-background/80 hover:bg-background/90"
                      size="icon"
                      variant="ghost"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        handleUseTemplate(template.id);
                        window.location.href = `/selling/new?template=${template.id}`;
                      }}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Use Template
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="pr-8 text-lg">{template.name}</CardTitle>
                {template.description && (
                  <p className="line-clamp-2 text-muted-foreground text-sm">
                    {template.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span>{getCategoryName(template.category)}</span>
                  </div>

                  {template.condition && (
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{getConditionText(template.condition)}</span>
                    </div>
                  )}

                  {template.basePrice && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>
                        ${(Number(template.basePrice) / 100).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {template.brand && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Brand:</span>{' '}
                      {template.brand}
                    </div>
                  )}

                  {(template.size || template.color) && (
                    <div className="space-y-1 text-sm">
                      {template.size && (
                        <div>
                          <span className="text-muted-foreground">Size:</span>{' '}
                          {template.size}
                        </div>
                      )}
                      {template.color && (
                        <div>
                          <span className="text-muted-foreground">Color:</span>{' '}
                          {template.color}
                        </div>
                      )}
                    </div>
                  )}

                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          className="text-xs"
                          key={index}
                          variant="secondary"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge className="text-xs" variant="secondary">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t pt-2 text-muted-foreground text-xs">
                  <span>Used {template.usageCount} times</span>
                  <span>
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    handleUseTemplate(template.id);
                    window.location.href = `/selling/new?template=${template.id}`;
                  }}
                  size="sm"
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Template Dialog */}
      <Dialog
        onOpenChange={() => setEditingTemplate(null)}
        open={!!editingTemplate}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <TemplateForm
              categories={categories}
              initialData={editingTemplate}
              isLoading={isLoading}
              onCancel={() => setEditingTemplate(null)}
              onSubmit={(data) =>
                handleUpdateTemplate(editingTemplate.id, data)
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
