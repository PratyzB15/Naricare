// src/app/sos/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { ShieldAlert, Phone, Siren, UserPlus, Trash2, PhoneCall, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type EmergencyContact = {
    id: string;
    name: string;
    phone: string;
};

type LocationData = {
    latitude: number;
    longitude: number;
    timestamp: number;
    placeName?: string;
};

// Emergency service numbers (India-specific)
const EMERGENCY_SERVICES = {
    police: '100',
    ambulance: '102',
    fire: '101',
    womenHelpline: '1091',
    disasterManagement: '108'
};

// Reverse geocoding function using OpenStreetMap Nominatim API
const getPlaceName = async (latitude: number, longitude: number): Promise<string> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        if (data?.display_name) {
            return data.display_name;
        }
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
        console.warn('Failed to fetch place name:', error);
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
};

export default function SOSPage() {
  const [sosActivated, setSosActivated] = useState(false);
  const [action, setAction] = useState<'services' | 'contacts' | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [shareLocation, setShareLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const savedContacts = localStorage.getItem('emergencyContacts');
    if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
    }
    
    const savedLocationPreference = localStorage.getItem('shareLocation');
    if (savedLocationPreference !== null) {
        setShareLocation(JSON.parse(savedLocationPreference));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
        localStorage.setItem('emergencyContacts', JSON.stringify(contacts));
        localStorage.setItem('shareLocation', JSON.stringify(shareLocation));
    }
  }, [contacts, shareLocation, isClient]);

  const getLocation = (): Promise<LocationData> => {
    return new Promise(async (resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error('Geolocation is not supported by this browser.');
        setLocationError(error.message);
        reject(error);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: position.timestamp
          };

          let fullLocation = {
            ...location,
            placeName: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
          };

          if (shareLocation) {
            try {
              const placeName = await getPlaceName(location.latitude, location.longitude);
              fullLocation.placeName = placeName;
            } catch (err) {
              console.warn('Could not get place name:', err);
            }
          }

          setLocationError(null);
          resolve(fullLocation);
        },
        (error) => {
          let errorMsg = 'Error getting location: ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg += 'Permission denied. Please enable location services.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg += 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMsg += 'Location request timed out. Please try again.';
              break;
            default:
              errorMsg += error.message;
          }
          setLocationError(errorMsg);
          reject(new Error(errorMsg));
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
        setContacts([...contacts, { ...newContact, id: Date.now().toString() }]);
        setNewContact({ name: '', phone: '' });
        toast({ title: 'Contact Added' });
    }
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast({ title: 'Contact Removed' });
  };

  const initiatePhoneCall = (phoneNumber: string) => {
    const telLink = `tel:${phoneNumber}`;
    window.location.href = telLink;
    
    setTimeout(() => {
      toast({
        title: 'Calling...',
        description: `Dialing ${phoneNumber}. If call didn't start automatically, please dial manually.`
      });
    }, 1000);
  };

  const handleCall = async (serviceName: string, phoneNumber?: string) => {
    try {
      let finalPhoneNumber = phoneNumber;
      
      // Use predefined emergency numbers if no specific number provided
      if (!phoneNumber) {
        const serviceKey = serviceName.toLowerCase().replace(/\s+/g, '');
        finalPhoneNumber = EMERGENCY_SERVICES[serviceKey as keyof typeof EMERGENCY_SERVICES] || '100';
      }
      
      let locationInfo = '';
      let locationDetails = '';

      if (shareLocation) {
        try {
          const location = await getLocation();
          const lat = location.latitude.toFixed(6);
          const lng = location.longitude.toFixed(6);
          const coords = `${lat}° ${location.latitude >= 0 ? 'N' : 'S'}, ${lng}° ${location.longitude >= 0 ? 'E' : 'W'}`;
          const placeName = location.placeName || `${lat}, ${lng}`;

          // ✅ Now using plain text with formatting
          locationInfo = ` from ${coords} (${placeName})`;
          locationDetails = `From: ${coords}\nLocation: ${placeName}`;
        } catch (error) {
          console.error('Failed to get location:', error);
          locationDetails = "Could not retrieve your location.";
        }
      } else {
        locationDetails = "Location sharing is disabled.";
      }

      // ✅ Fixed: Using plain text for toast
      toast({
        title: `Calling ${serviceName}`,
        description: `Calling ${serviceName}... ${locationDetails}`,
        duration: 5000,
      });

      // Initiate the actual phone call
      if (finalPhoneNumber) {
        initiatePhoneCall(finalPhoneNumber);
      }
      
      // Reset the SOS state after calling
      setSosActivated(false);
      setAction(null);
    } catch (error) {
      console.error('Error in handleCall:', error);
      toast({
        title: 'Call Failed',
        description: 'Could not initiate the call. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const renderInitialView = () => (
    <>
      <button
          onClick={() => setSosActivated(true)}
          className="w-48 h-48 rounded-full bg-destructive/20 border-4 border-destructive flex items-center justify-center animate-pulse hover:scale-105 transition-transform duration-200"
      >
          <div className="w-36 h-36 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground">
              <ShieldAlert className="w-16 h-16" />
          </div>
      </button>
      <p className="text-muted-foreground px-4 text-center">
          Press the button for emergency options. Your location will be shared with emergency services.
      </p>
    </>
  );

  const renderSosOptions = () => (
      <div className="w-full space-y-4">
          <h3 className="text-lg font-semibold">What's your emergency?</h3>
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="location-sharing"
              checked={shareLocation}
              onCheckedChange={setShareLocation}
            />
            <Label htmlFor="location-sharing">Share my live location</Label>
          </div>
          {locationError && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{locationError}</p>
          )}
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
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-4 w-4 text-destructive" />
            <span className="text-sm">
              {shareLocation 
                ? "Your live location will be shared" 
                : "Location sharing is disabled"}
            </span>
          </div>
          {locationError && shareLocation && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{locationError}</p>
          )}
           <p className="text-sm text-muted-foreground">Your {shareLocation ? 'live location' : 'phone number'} will be used to contact the nearest help.</p>
          <Button size="lg" className="w-full" onClick={() => handleCall('Police', EMERGENCY_SERVICES.police)}>
              <Siren className="mr-2 h-5 w-5"/> Police (100)
          </Button>
          <Button size="lg" className="w-full" onClick={() => handleCall('Ambulance', EMERGENCY_SERVICES.ambulance)}>
              <Phone className="mr-2 h-5 w-5"/> Ambulance (102)
          </Button>
          <Button size="lg" className="w-full" onClick={() => handleCall('Fire Department', EMERGENCY_SERVICES.fire)}>
              <Siren className="mr-2 h-5 w-5"/> Fire Department (101)
          </Button>
          <Button size="lg" className="w-full" onClick={() => handleCall('Women Helpline', EMERGENCY_SERVICES.womenHelpline)}>
              <Phone className="mr-2 h-5 w-5"/> Women Helpline (1091)
          </Button>
          <Button size="lg" className="w-full" onClick={() => handleCall('Disaster Management', EMERGENCY_SERVICES.disasterManagement)}>
              <Siren className="mr-2 h-5 w-5"/> Disaster Management (108)
          </Button>
           <Button variant="ghost" onClick={() => setAction(null)}>Back</Button>
      </div>
  );
  
  const renderContactList = () => (
      <div className="w-full space-y-4">
          <h3 className="text-lg font-semibold">Call a Personal Contact</h3>
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-4 w-4 text-destructive" />
            <span className="text-sm">
              {shareLocation 
                ? "Your live location will be shared" 
                : "Location sharing is disabled"}
            </span>
          </div>
          {locationError && shareLocation && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{locationError}</p>
          )}
          {contacts.length > 0 ? (
              contacts.map(c => (
                  <Button key={c.id} size="lg" variant="secondary" className="w-full justify-between" onClick={() => handleCall(c.name, c.phone)}>
                      <span>{c.name}</span>
                      <span className="flex items-center">
                        <span className="text-sm mr-2">{c.phone}</span>
                        <PhoneCall className="h-5 w-5"/>
                      </span>
                  </Button>
              ))
          ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No personal contacts added.</p>
          )}
          <Button variant="ghost" onClick={() => setAction(null)}>Back</Button>
      </div>
  );

  const renderContent = () => {
      if (!sosActivated) return renderInitialView();
      if (!action) return renderSosOptions();
      if (action === 'services') return renderServiceCalls();
      if (action === 'contacts') return renderContactList();
      return null;
  };

  return (
    <AppLayout>
        <div className="container mx-auto py-8">
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="w-full text-center">
                    <CardHeader>
                    <CardTitle className="text-3xl text-destructive">SOS Panic Button</CardTitle>
                    <CardDescription>
                        For immediate emergency assistance. Calls will be initiated directly.
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-6 min-h-[400px]">
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
                                            <Input 
                                              id="name" 
                                              value={newContact.name} 
                                              onChange={e => setNewContact({...newContact, name: e.target.value})} 
                                              placeholder="Enter contact name"
                                            />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input 
                                              id="phone" 
                                              type="tel" 
                                              value={newContact.phone} 
                                              onChange={e => setNewContact({...newContact, phone: e.target.value})} 
                                              placeholder="Enter phone number with country code"
                                            />
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
                             <p className="text-sm text-muted-foreground text-center py-4">No contacts added. Add contacts to call them in emergencies.</p>
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