'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@repo/design-system/components';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const templateSchema = z.object({
  name: z
    .string()
    .min(1, 'Template name is required')
    .max(100, 'Name too long'),
  description: z.string().optional(),
  category: z.string().optional(),
  condition: z
    .enum([
      'NEW_WITH_TAGS',
      'NEW_WITHOUT_TAGS',
      'VERY_GOOD',
      'GOOD',
      'SATISFACTORY',
    ])
    .optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  basePrice: z.string().optional(),
  isDefault: z.boolean().optional(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

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
}

interface Category {
  id: string;
  name: string;
}

interface TemplateFormProps {
  categories: Category[];
  initialData?: Template | null;
  onSubmit: (
    data: TemplateFormData & { basePrice?: string; tags: string[] }
  ) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function TemplateForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: TemplateFormProps) {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      condition:
        initialData?.condition &&
        [
          'NEW_WITH_TAGS',
          'NEW_WITHOUT_TAGS',
          'VERY_GOOD',
          'GOOD',
          'SATISFACTORY',
        ].includes(initialData.condition)
          ? (initialData.condition as
              | 'NEW_WITH_TAGS'
              | 'NEW_WITHOUT_TAGS'
              | 'VERY_GOOD'
              | 'GOOD'
              | 'SATISFACTORY')
          : undefined,
      brand: initialData?.brand || '',
      size: initialData?.size || '',
      color: initialData?.color || '',
      basePrice: initialData?.basePrice
        ? (Number(initialData.basePrice) / 100).toString()
        : '',
      isDefault: initialData?.isDefault,
    },
  });

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFormSubmit = (data: TemplateFormData) => {
    const submitData = {
      ...data,
      basePrice: data.basePrice,
      tags,
    };
    onSubmit(submitData);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-4">
        {/* Template Name */}
        <div>
          <Label htmlFor="name">Template Name *</Label>
          <Input
            id="name"
            {...register('name')}
            className="mt-1"
            placeholder="e.g., Men's Designer Jeans"
          />
          {errors.name && (
            <p className="mt-1 text-red-600 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            className="mt-1"
            placeholder="Optional description for this template..."
            rows={3}
          />
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            onValueChange={(value) => setValue('category', value)}
            value={watch('category') || ''}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition */}
        <div>
          <Label htmlFor="condition">Condition</Label>
          <Select
            onValueChange={(value) =>
              setValue(
                'condition',
                value as
                  | 'NEW_WITH_TAGS'
                  | 'NEW_WITHOUT_TAGS'
                  | 'VERY_GOOD'
                  | 'GOOD'
                  | 'SATISFACTORY'
              )
            }
            value={watch('condition') || ''}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No condition</SelectItem>
              <SelectItem value="NEW_WITH_TAGS">New with tags</SelectItem>
              <SelectItem value="NEW_WITHOUT_TAGS">New without tags</SelectItem>
              <SelectItem value="VERY_GOOD">Very good</SelectItem>
              <SelectItem value="GOOD">Good</SelectItem>
              <SelectItem value="SATISFACTORY">Satisfactory</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Brand */}
        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            {...register('brand')}
            className="mt-1"
            placeholder="e.g., Nike, Adidas, Zara..."
          />
        </div>

        {/* Size and Color */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="size">Size</Label>
            <Input
              id="size"
              {...register('size')}
              className="mt-1"
              placeholder="e.g., M, 32W 34L, 8.5..."
            />
          </div>
          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              {...register('color')}
              className="mt-1"
              placeholder="e.g., Blue, Black, Red..."
            />
          </div>
        </div>

        {/* Base Price */}
        <div>
          <Label htmlFor="basePrice">Base Price ($)</Label>
          <Input
            id="basePrice"
            min="0"
            step="0.01"
            type="number"
            {...register('basePrice')}
            className="mt-1"
            placeholder="0.00"
          />
          <p className="mt-1 text-muted-foreground text-sm">
            Optional starting price for listings using this template
          </p>
        </div>

        {/* Tags */}
        <div>
          <Label>Tags</Label>
          <div className="mt-1 space-y-2">
            <div className="flex gap-2">
              <Input
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag..."
                value={newTag}
              />
              <Button onClick={handleAddTag} type="button" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    className="flex items-center gap-1"
                    key={tag}
                    variant="secondary"
                  >
                    {tag}
                    <Button
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveTag(tag)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Default Template */}
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={watch('isDefault')}
            id="isDefault"
            onCheckedChange={(checked) => setValue('isDefault', !!checked)}
          />
          <Label className="text-sm" htmlFor="isDefault">
            Set as default template
          </Label>
        </div>
        {watch('isDefault') && (
          <p className="text-muted-foreground text-sm">
            This template will be automatically selected when creating new
            listings
          </p>
        )}
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Name:</span>{' '}
            {watch('name') || 'Template name'}
          </div>
          {watch('description') && (
            <div>
              <span className="font-medium">Description:</span>{' '}
              {watch('description')}
            </div>
          )}
          {watch('category') && (
            <div>
              <span className="font-medium">Category:</span>{' '}
              {categories.find((c) => c.id === watch('category'))?.name}
            </div>
          )}
          {watch('condition') && (
            <div>
              <span className="font-medium">Condition:</span>{' '}
              {watch('condition')
                ?.replace(/_/g, ' ')
                .toLowerCase()
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </div>
          )}
          {watch('brand') && (
            <div>
              <span className="font-medium">Brand:</span> {watch('brand')}
            </div>
          )}
          {(watch('size') || watch('color')) && (
            <div className="flex gap-4">
              {watch('size') && (
                <span>
                  <span className="font-medium">Size:</span> {watch('size')}
                </span>
              )}
              {watch('color') && (
                <span>
                  <span className="font-medium">Color:</span> {watch('color')}
                </span>
              )}
            </div>
          )}
          {watch('basePrice') && (
            <div>
              <span className="font-medium">Price:</span> ${watch('basePrice')}
            </div>
          )}
          {tags.length > 0 && (
            <div>
              <span className="font-medium">Tags:</span>{' '}
              <div className="mt-1 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge className="text-xs" key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={isLoading} type="submit">
          {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'} Template
        </Button>
      </div>
    </form>
  );
}
