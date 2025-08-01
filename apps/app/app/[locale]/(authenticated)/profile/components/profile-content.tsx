'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@repo/ui/components';
import { format } from 'date-fns';
import {
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
  DollarSign,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  updateNotificationSettings,
  updateShippingAddress,
  updateUserProfile,
} from '../actions/profile-actions';
import { AddressManagement } from './address-management';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30)
    .optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const notificationSchema = z.object({
  emailMarketing: z.boolean(),
  emailOrders: z.boolean(),
  emailMessages: z.boolean(),
  emailUpdates: z.boolean(),
  pushNotifications: z.boolean(),
  pushMessages: z.boolean(),
  pushOffers: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type NotificationFormData = z.infer<typeof notificationSchema>;

interface UserStats {
  products_sold: number;
  total_earnings: number;
  products_bought: number;
  total_spent: number;
  active_listings: number;
  followers_count: number;
  following_count: number;
}

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
  emailAddresses: Array<{
    emailAddress: string;
  }>;
  createdAt?: Date;
}

interface ProfileContentProps {
  user: User;
  stats: UserStats;
}

export function ProfileContent({ user, stats }: ProfileContentProps) {
  const router = useRouter();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
      bio: '',
      phone: '',
      website: '',
    },
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailMarketing: true,
      emailOrders: true,
      emailMessages: true,
      emailUpdates: false,
      pushNotifications: true,
      pushMessages: true,
      pushOffers: false,
    },
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      const result = await updateUserProfile(data);
      if (result.success) {
        router.refresh();
      } else {
      }
    } catch (error) {
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onSubmitNotifications = async (data: NotificationFormData) => {
    setIsUpdatingNotifications(true);
    try {
      const result = await updateNotificationSettings(data);
      if (result.success) {
        // Show success message
      } else {
      }
    } catch (error) {
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage alt={user.firstName} src={user.imageUrl} />
              <AvatarFallback className="text-2xl">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-bold text-2xl">
                {user.firstName} {user.lastName}
              </h2>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {user.emailAddresses[0]?.emailAddress}
              </p>
              {user.createdAt && (
                <p className="mt-1 flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
                </p>
              )}
            </div>
            <div className="text-right">
              <Badge className="mb-2" variant="outline">
                Verified Member
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Items Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.products_sold}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              ${stats.total_earnings.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Items Bought</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.products_bought}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              ${stats.total_spent.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Active Listings
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.active_listings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.followers_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Following</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.following_count}</div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs className="space-y-4" defaultValue="profile">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form
                  className="space-y-4"
                  onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
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
                      control={profileForm.control}
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
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="@username" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be displayed on your public profile
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-20"
                            placeholder="Tell us about yourself..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Brief description for your profile
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+1 (555) 123-4567"
                              type="tel"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://yourwebsite.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button disabled={isUpdatingProfile} type="submit">
                    {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="address">
          <AddressManagement />
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Business Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="font-medium text-sm">
                        Monthly Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="font-bold text-2xl">
                        ${stats.total_earnings.toFixed(2)}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        +20.1% from last month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="font-medium text-sm">
                        Conversion Rate
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="font-bold text-2xl">
                        {stats.active_listings > 0
                          ? (
                              (stats.products_sold / stats.active_listings) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Views to sales ratio
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="font-medium text-sm">
                        Avg Sale Price
                      </CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="font-bold text-2xl">
                        $
                        {stats.products_sold > 0
                          ? (
                              stats.total_earnings / stats.products_sold
                            ).toFixed(2)
                          : '0.00'}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Per item sold
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Business Insights</h4>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between rounded-[var(--radius-lg)] border p-4">
                      <div>
                        <div className="font-medium">Performance Overview</div>
                        <div className="text-muted-foreground text-sm">
                          Track your selling metrics and growth
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>

                    <div className="flex items-center justify-between rounded-[var(--radius-lg)] border p-4">
                      <div>
                        <div className="font-medium">Sales Reports</div>
                        <div className="text-muted-foreground text-sm">
                          Detailed analytics and reporting
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Reviews & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="font-medium text-sm">
                        Average Rating
                      </CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="font-bold text-2xl">4.8</div>
                      <p className="text-muted-foreground text-xs">
                        Based on 23 reviews
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="font-medium text-sm">
                        Response Rate
                      </CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="font-bold text-2xl">95%</div>
                      <p className="text-muted-foreground text-xs">
                        Within 24 hours
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Recent Reviews</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border p-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">John Doe</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                className="h-3 w-3 fill-current text-yellow-400"
                                key={star}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Great seller! Item was exactly as described and
                          shipped quickly.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border p-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>SM</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            Sarah Miller
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4].map((star) => (
                              <Star
                                className="h-3 w-3 fill-current text-yellow-400"
                                key={star}
                              />
                            ))}
                            <Star className="h-3 w-3 text-gray-300" />
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          Good quality item. Would buy from this seller again.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    View All Reviews
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form
                  className="space-y-6"
                  onSubmit={notificationForm.handleSubmit(
                    onSubmitNotifications
                  )}
                >
                  <div className="space-y-4">
                    <h4 className="font-medium">Email Notifications</h4>

                    <FormField
                      control={notificationForm.control}
                      name="emailOrders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-[var(--radius-lg)] border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Order Updates
                            </FormLabel>
                            <FormDescription>
                              Get notified about order status changes
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="emailMessages"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-[var(--radius-lg)] border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              New Messages
                            </FormLabel>
                            <FormDescription>
                              Email when you receive new messages
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="emailMarketing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-[var(--radius-lg)] border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Marketing Emails
                            </FormLabel>
                            <FormDescription>
                              Receive emails about promotions and new features
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Push Notifications</h4>

                    <FormField
                      control={notificationForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-[var(--radius-lg)] border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Enable Push Notifications
                            </FormLabel>
                            <FormDescription>
                              Allow notifications on this device
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="pushMessages"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-[var(--radius-lg)] border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Message Notifications
                            </FormLabel>
                            <FormDescription>
                              Push notifications for new messages
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button disabled={isUpdatingNotifications} type="submit">
                    {isUpdatingNotifications
                      ? 'Updating...'
                      : 'Save Preferences'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-[var(--radius-lg)] border p-4">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-muted-foreground text-sm">
                      Add an extra layer of security to your account
                    </div>
                  </div>
                  <Badge variant="outline">Managed by Clerk</Badge>
                </div>

                <div className="flex items-center justify-between rounded-[var(--radius-lg)] border p-4">
                  <div>
                    <div className="font-medium">Password</div>
                    <div className="text-muted-foreground text-sm">
                      Change your account password
                    </div>
                  </div>
                  <Badge variant="outline">Managed by Clerk</Badge>
                </div>

                <div className="flex items-center justify-between rounded-[var(--radius-lg)] border p-4">
                  <div>
                    <div className="font-medium">Connected Accounts</div>
                    <div className="text-muted-foreground text-sm">
                      Manage social media connections
                    </div>
                  </div>
                  <Badge variant="outline">Managed by Clerk</Badge>
                </div>
              </div>

              <p className="text-muted-foreground text-sm">
                Security settings are managed through our authentication
                provider for enhanced security.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
