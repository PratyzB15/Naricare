import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Privacy and Data Information</CardTitle>
            <CardDescription>How your data is handled in this prototype.</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <h3>User Data Handling</h3>
            <p>
              Thank you for trying out NariCare! This application is currently a prototype designed to showcase functionality.
              To provide a personalized and persistent experience without requiring a full backend database and authentication system,
              this app uses your browser's <strong>Local Storage</strong>.
            </p>
            
            <h4>What is Local Storage?</h4>
            <p>
              Local Storage is a way for websites to store data on your computer. This means your cycle data, profile information, and predictions
              are saved directly in your browser. This data is not sent to any server and is only accessible on the device you are currently using.
            </p>

            <h4>What Does This Mean for You?</h4>
            <ul>
              <li>
                <strong>Data Persistence:</strong> Your data will be remembered between visits on the same browser.
              </li>
              <li>
                <strong>Privacy:</strong> Your data stays on your machine. No other user can see your information, and developers do not have access to it.
              </li>
              <li>
                <strong>Data Loss:</strong> If you clear your browser's cache or use a different browser or device, your data will not be available.
              </li>
            </ul>

            <h4>In a Real Application</h4>
            <p>
              In a production-ready version of this application, all user data would be securely stored in a cloud database. You would have a secure account with a password,
              and all data would be encrypted and protected, accessible only to you after you sign in. The principles of data privacy and security would be strictly enforced.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
