'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userType, setUserType] = useState('self');
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);

  const generateAndStoreUniqueId = (email: string) => {
    const newId = `HER${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(`${email}_uniqueId`, newId);

    // In a real app, this map would be stored in a secure backend database.
    const idMap = JSON.parse(localStorage.getItem('uniqueIdMap') || '{}');
    idMap[newId] = email;
    localStorage.setItem('uniqueIdMap', JSON.stringify(idMap));

    return newId;
  };

  const validateFamilyMemberId = (id: string): boolean => {
    // Check if the ID exists in the stored CSV data
    const csvData = localStorage.getItem('nari_care_users_csv');
    if (!csvData) return false;
    
    // Split CSV into rows and check if any row contains the ID
    const rows = csvData.split('\n');
    for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
      if (rows[i].includes(id)) {
        return true;
      }
    }
    
    // Also check the uniqueIdMap as a fallback
    const idMap = JSON.parse(localStorage.getItem('uniqueIdMap') || '{}');
    return idMap.hasOwnProperty(id);
  };

  const storeUserDataForCSV = (email: string, name: string, type: string, id: string, age?: number, medicalHistory?: string) => {
    // Store user data in localStorage for CSV format
    const userData = {
      email,
      name,
      type,
      id,
      age: age || 'N/A',
      medicalHistory: medicalHistory || 'N/A',
      signupDate: new Date().toISOString()
    };

    // Get existing CSV data or initialize with headers
    let csvData = localStorage.getItem('nari_care_users_csv');
    
    if (!csvData) {
      csvData = 'Email,Name,User Type,Unique ID,Age,Medical History,Signup Date\n';
    }
    
    // Format the new row
    const newRow = `"${userData.email}","${userData.name}","${userData.type}","${userData.id}","${userData.age}","${userData.medicalHistory}","${userData.signupDate}"\n`;
    
    // Append the new row
    localStorage.setItem('nari_care_users_csv', csvData + newRow);

    // Also store in JSON format for easy access
    const existingUsers = JSON.parse(localStorage.getItem('userRegistry') || '[]');
    existingUsers.push(userData);
    localStorage.setItem('userRegistry', JSON.stringify(existingUsers));
  };

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIdError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    localStorage.setItem('currentUserEmail', email);
    localStorage.setItem(`${email}_userType`, userType);

    if (userType === 'self') {
      const age = formData.get('age') as string;
      const medicalHistory = formData.get('medicalHistory') as string;

      localStorage.setItem(`${email}_userProfile`, JSON.stringify({ name, age: parseInt(age, 10) || null, medicalHistory }));

      const newId = generateAndStoreUniqueId(email);
      setUniqueId(newId);
      
      // Store data for CSV
      storeUserDataForCSV(
        email, 
        name, 
        'self', 
        newId, 
        parseInt(age, 10) || undefined, 
        medicalHistory
      );
      
      toast({
        title: 'Account Created!',
        description: 'Your unique ID has been generated.',
      });

      // Redirect immediately after a brief delay to show the success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } else {
      // family member
      const femaleMemberId = formData.get('femaleMemberId') as string;
      
      // Validate the family member ID
      if (!validateFamilyMemberId(femaleMemberId)) {
        setIsLoading(false);
        setIdError('Invalid ID. Please enter a valid unique ID of the female user.');
        return;
      }
      
      localStorage.setItem(`${email}_userProfile`, JSON.stringify({ name, age: null, medicalHistory: '' }));
      localStorage.setItem(`${email}_uniqueId`, femaleMemberId);
      
      // Store data for CSV
      storeUserDataForCSV(
        email, 
        name, 
        'family', 
        femaleMemberId
      );
      
      toast({
        title: 'Account Created!',
        description: 'Family account created successfully.',
      });

      // Immediate navigation for family members
      router.push('/dashboard');
    }
  };

  if (uniqueId) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-pink-300 via-white to-pink-200 px-4 py-8">
        <Card className="w-full max-w-md p-8 shadow-xl border-none bg-white/95 backdrop-blur-sm rounded-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-800">Welcome to NariCare!</CardTitle>
            <CardDescription>Your account has been created successfully.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-pink-200 bg-pink-50 text-pink-800">
              <Terminal className="h-4 w-4 text-pink-600" />
              <AlertTitle className="text-pink-700">Your Unique ID</AlertTitle>
              <AlertDescription className="text-pink-600">
                Please save this ID. You can share it with family members to let them track your health with your permission.
                <p className="font-bold text-xl mt-2 break-all tracking-wider">{uniqueId}</p>
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground mt-4 text-center">Redirecting you to the dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-pink-300 via-white to-pink-200 px-6 py-10">
      <Card className="w-full max-w-md p-8 shadow-2xl border-none bg-white/95 backdrop-blur-sm rounded-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-800">Create an Account</CardTitle>
          <CardDescription className="text-gray-600">
            Join NariCare to take control of your health.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-3">
              <Label className="font-semibold text-gray-700">Signing up for:</Label>
              <RadioGroup defaultValue="self" onValueChange={setUserType} className="grid grid-cols-2 gap-4">
                <Label
                  htmlFor="self"
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-white p-5 hover:bg-pink-50 hover:border-pink-300 cursor-pointer transition-all duration-200",
                    userType === 'self' && "border-pink-500 bg-pink-50 ring-2 ring-pink-200"
                  )}
                >
                  <RadioGroupItem value="self" id="self" className="sr-only" />
                  <span className="font-medium text-gray-800">Myself</span>
                </Label>
                <Label
                  htmlFor="family"
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-white p-5 hover:bg-pink-50 hover:border-pink-300 cursor-pointer transition-all duration-200",
                    userType === 'family' && "border-pink-500 bg-pink-50 ring-2 ring-pink-200"
                  )}
                >
                  <RadioGroupItem value="family" id="family" className="sr-only" />
                  <span className="font-medium text-gray-800">A Family Member</span>
                </Label>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-gray-700">Your Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                required
                className="border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent rounded-lg"
              />
            </div>

            {userType === 'family' ? (
              <div className="space-y-2">
                <Label htmlFor="femaleMemberId" className="font-semibold text-gray-700">Female User's Unique ID (HER...)</Label>
                <Input
                  id="femaleMemberId"
                  name="femaleMemberId"
                  type="text"
                  placeholder="Enter the user's ID to track"
                  required
                  className="border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent rounded-lg"
                />
                {idError && (
                  <p className="text-sm text-red-500">{idError}</p>
                )}
                <p className="text-xs text-gray-500">
                  You need the unique ID of the female user to create a family account.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="age" className="font-semibold text-gray-700">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="Your age"
                    required
                    className="border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalHistory" className="font-semibold text-gray-700">Pre-existing Conditions (optional)</Label>
                  <Textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    placeholder="e.g., Thyroid, PCOS"
                    className="border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent rounded-lg"
                  />
                  <p className="text-xs text-gray-500">This helps us personalize your predictions.</p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-gray-700">Your Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold text-gray-700">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent rounded-lg"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 font-bold text-base py-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/signin"
              className="underline text-pink-600 hover:text-pink-700 font-semibold transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}