'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design-system/components';
import { Button } from '@repo/design-system/components';
import { Input } from '@repo/design-system/components';
import { Badge } from '@repo/design-system/components';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/design-system/components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design-system/components';
import { Checkbox } from '@repo/design-system/components';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/design-system/components';
import { MapPin, Plus, Edit, Trash2, Star } from 'lucide-react';
// import { toast } from 'sonner';

const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  streetLine1: z.string().min(1, 'Street address is required'),
  streetLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().optional(),
  isDefault: z.boolean(),
  type: z.enum(['SHIPPING', 'BILLING']),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  type: 'SHIPPING' | 'BILLING';
  createdAt: string;
}

export function AddressManagement() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      company: '',
      streetLine1: '',
      streetLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      phone: '',
      isDefault: false,
      type: 'SHIPPING',
    },
  });

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Handle form submission
  const onSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true);
    try {
      const url = editingAddress ? `/api/addresses/${editingAddress.id}` : '/api/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save address');
      }

      setDialogOpen(false);
      setEditingAddress(null);
      form.reset();
      fetchAddresses();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle address deletion
  const deleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      fetchAddresses();
    } catch (error) {
    }
  };

  // Handle edit address
  const editAddress = (address: Address) => {
    setEditingAddress(address);
    form.reset({
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      streetLine1: address.streetLine1,
      streetLine2: address.streetLine2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault,
      type: address.type,
    });
    setDialogOpen(true);
  };

  // Handle new address
  const newAddress = () => {
    setEditingAddress(null);
    form.reset();
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading addresses...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Management
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={newAddress} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="streetLine1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="streetLine2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apartment, suite, etc. (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="MX">Mexico</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Type</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SHIPPING">Shipping</SelectItem>
                                <SelectItem value="BILLING">Billing</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isDefault"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Set as default</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Address'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
            <p className="text-muted-foreground mb-4">
              Add an address to make checkout faster and easier.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="border rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">
                        {address.firstName} {address.lastName}
                      </h3>
                      <Badge variant={address.type === 'SHIPPING' ? 'default' : 'secondary'}>
                        {address.type}
                      </Badge>
                      {address.isDefault && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    
                    {address.company && (
                      <p className="text-sm text-muted-foreground">{address.company}</p>
                    )}
                    
                    <p className="text-sm">
                      {address.streetLine1}
                      {address.streetLine2 && `, ${address.streetLine2}`}
                    </p>
                    <p className="text-sm">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-sm">{address.country}</p>
                    
                    {address.phone && (
                      <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editAddress(address)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteAddress(address.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}