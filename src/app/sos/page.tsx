'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { ShieldAlert, Phone, Siren, UserPlus, Trash2, PhoneCall } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

type EmergencyContact = {
    id: string;
    name: string;
    phone: string;
}

export default function SOSPage() {
  const [sosActivated, setSosActivated] = useState(false);
  const [action, setAction] = useState<'services' | 'contacts' | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newContact, setNewContact] = useState({ name: '', phone: ''});
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
        localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
    }
  }, [contacts, isClient]);

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
        setContacts([...contacts, { ...newContact, id: Date.now().toString() }]);
        setNewContact({ name: '', phone: '' });
        toast({ title: 'Contact Added' });
    }
  }

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast({ title: 'Contact Removed' });
  }

  const handleCall = (name: string, number?: string) => {
    // In a real app, this would trigger a phone call or use a service
    alert(`Calling ${name}${number ? ` at ${number}` : ''}...`);
  }

  const renderInitialView = () => (
    <>
      <button
          onClick={() => setSosActivated(true)}
          className="w-48 h-48 rounded-full bg-destructive/20 border-4 border-destructive flex items-center justify-center animate-pulse"
      >
          <div className="w-36 h-36 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground">
              <ShieldAlert className="w-16 h-16" />
          </div>
      </button>
      <p className="text-muted-foreground px-4">
          Press the button for emergency options.
      </p>
    </>
  );

  const renderSosOptions = () => (
      <div className="w-full space-y-4">
          <h3 className="text-lg font-semibold">What's your emergency?</h3>
          <Button size="lg" className="w-full" onClick={() => setAction('services')}>
              <Siren className="mr-2 h-5 w-5"/>
              Call Emergency Services
          </Button>
           <Button size="lg" variant="secondary" className="w-full" onClick={() => setAction('contacts')}>
              <PhoneCall className="mr-2 h-5 w-5"/>
              Call a Personal Contact
          </Button>
           <Button variant="ghost" onClick={() => setSosActivated(false)}>Cancel</Button>
      </div>
  );

  const renderServiceCalls = () => (
      <div className="w-full space-y-4">
          <h3 className="text-lg font-semibold">Contacting Nearby Services</h3>
           <p className="text-sm text-muted-foreground">Your live location would be used to contact the nearest help.</p>
          <Button size="lg" className="w-full" onClick={() => handleCall('Police')}>
              <Siren className="mr-2 h-5 w-5"/> Police
          </Button>
          <Button size="lg" className="w-full" onClick={() => handleCall('Hospital')}>
              <Phone className="mr-2 h-5 w-5"/> Hospital
          </Button>
           <Button variant="ghost" onClick={() => setAction(null)}>Back</Button>
      </div>
  );
  
  const renderContactList = () => (
      <div className="w-full space-y-4">
          <h3 className="text-lg font-semibold">Call a Personal Contact</h3>
          {contacts.length > 0 ? (
              contacts.map(c => (
                  <Button key={c.id} size="lg" variant="secondary" className="w-full justify-between" onClick={() => handleCall(c.name, c.phone)}>
                      {c.name}
                      <PhoneCall className="h-5 w-5"/>
                  </Button>
              ))
          ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No personal contacts added.</p>
          )}
          <Button variant="ghost" onClick={() => setAction(null)}>Back</Button>
      </div>
  )

  const renderContent = () => {
      if (!sosActivated) return renderInitialView();
      if (!action) return renderSosOptions();
      if (action === 'services') return renderServiceCalls();
      if (action === 'contacts') return renderContactList();
  }

  return (
    <AppLayout>
        <div className="container mx-auto py-8">
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="w-full text-center">
                    <CardHeader>
                    <CardTitle className="text-3xl text-destructive">SOS Panic Button</CardTitle>
                    <CardDescription>
                        For immediate emergency assistance.
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-6 min-h-[300px]">
                        {renderContent()}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            Emergency Contacts
                             <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="icon"><UserPlus className="h-4 w-4"/></Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Add New Contact</DialogTitle></DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input id="name" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" type="tel" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" onClick={handleAddContact}>Save Contact</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardTitle>
                        <CardDescription>Manage your personal emergency contacts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {contacts.length === 0 ? (
                             <p className="text-sm text-muted-foreground text-center py-4">No contacts added.</p>
                        ) : (
                            <ul className="space-y-2">
                                {contacts.map(c => (
                                    <li key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                                        <div>
                                            <p className="font-medium">{c.name}</p>
                                            <p className="text-sm text-muted-foreground">{c.phone}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(c.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </AppLayout>
  );
}
