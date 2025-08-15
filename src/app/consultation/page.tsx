'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Terminal, Copy } from 'lucide-react';


const doctors = [
  // Delhi/NCR
  { name: 'Dr. Vivek Marwah', specialty: 'Minimally invasive laparoscopy', city: 'New Delhi', state: 'Delhi', highlights: 'Guinness World Record holder.', fee: 1500, phone: '+91 9811012345', address: 'Apollo Hospital, Sarita Vihar, New Delhi' },
  { name: 'Dr. Rahul Manchanda', specialty: 'Endoscopic and infertility specialist', city: 'New Delhi', state: 'Delhi', highlights: '', fee: 1200, phone: '+91 9810167890', address: 'Pushpawati Singhania Research Institute, New Delhi' },
  // UP
  { name: 'Dr. Meenakshi Maurya', specialty: 'Experienced gynecologist', city: 'Greater Noida', state: 'Uttar Pradesh', highlights: 'Operates multiple clinics.', fee: 800, phone: '+91 9958012345', address: 'Yatharth Super Speciality Hospital, Greater Noida' },
  { name: 'Dr. Chitra Varma', specialty: 'Nearly 40 years of experience', city: 'Lucknow', state: 'Uttar Pradesh', highlights: 'Admired for her friendly approach.', fee: 1000, phone: '+91 9415012345', address: 'Varma Polyclinic, Lucknow' },
  { name: 'Dr. Sunita Chandra', specialty: 'Infertility specialist and laparoscopic surgeon', city: 'Lucknow', state: 'Uttar Pradesh', highlights: 'Over 30 years of practice.', fee: 1100, phone: '+91 9839012345', address: 'Raj-Sunita Hospital, Lucknow' },
  { name: 'Dr. Archana Trivedi', specialty: 'Laparoscopic and hysteroscopic surgeries', city: 'Kanpur', state: 'Uttar Pradesh', highlights: 'Skilled in high-risk pregnancies.', fee: 900, phone: '+91 9415112345', address: 'Madhuraj Hospital, Kanpur' },
  // Rajasthan
  { name: 'Dr. Rachna Mishra', specialty: 'Laparoscopic & fertility expert', city: 'Jaipur', state: 'Rajasthan', highlights: 'Former Medical Director at Apollo.', fee: 1300, phone: '+91 9829012345', address: 'Apex Hospitals, Jaipur' },
  // West Bengal
  { name: 'Dr. Ankita Mandal', specialty: 'Gynecologist', city: 'Durgapur', state: 'West Bengal', highlights: '', fee: 700, phone: '+91 9434012345', address: 'The Mission Hospital, Durgapur' },
  { name: 'Dr. Debalina Brahma', specialty: '30 years experience', city: 'Kolkata', state: 'West Bengal', highlights: '', fee: 1200, phone: '+91 9830012345', address: 'Health Point Hospital, Kolkata' },
  { name: 'Dr. Gouri Kumra', specialty: 'Menopause, adolescence, infertility', city: 'Kolkata', state: 'West Bengal', highlights: '', fee: 1000, phone: '+91 9831012345', address: 'AMRI Hospitals, Salt Lake, Kolkata' },
  { name: 'Dr. Dibyendu Banerjee', specialty: 'ICSI, laparoscopy, infertility', city: 'Kolkata', state: 'West Bengal', highlights: '', fee: 1400, phone: '+91 9836012345', address: 'Kolkata Gynaecology, Kolkata' },
  { name: 'Dr. Tamami Chowdhury', specialty: 'Laparoscopic surgeon and OB-GYN', city: 'Siliguri', state: 'West Bengal', highlights: 'Notable regional recognition.', fee: 800, phone: '+91 9434112345', address: 'Neotia Getwel Healthcare Centre, Siliguri' },
  { name: 'Dr. Monika Agarwal', specialty: 'Comprehensive women’s care', city: 'Siliguri', state: 'West Bengal', highlights: '', fee: 750, phone: '+91 9800012345', address: 'Dr. Agarwal\'s Clinic, Siliguri' },
  { name: 'Dr. Arnab Basak', specialty: 'Fertility, high-risk pregnancy, laparoscopy', city: 'Kolkata', state: 'West Bengal', highlights: '31 years of experience.', fee: 1500, phone: '+91 9831112345', address: 'Bhagirathi Neotia Woman and Child Care Centre, Kolkata' },
  { name: 'Dr. Irina Dey', specialty: 'OB-GYN', city: 'Kolkata', state: 'West Bengal', highlights: 'Recognized credentials and patient care.', fee: 1100, phone: '+91 9830112345', address: 'Woodlands Multispeciality Hospital, Kolkata' },
  // Bihar
  { name: 'Dr. Sarika Rai', specialty: 'Over 30 years’ experience', city: 'Patna', state: 'Bihar', highlights: '', fee: 900, phone: '+91 9431012345', address: 'Ford Hospital, Patna' },
  // Telangana
  { name: 'Dr. Anuradha Panda', specialty: 'High-risk, laparoscopy, infertility', city: 'Hyderabad', state: 'Telangana', highlights: '', fee: 1300, phone: '+91 9848012345', address: 'Apollo Cradle, Jubilee Hills, Hyderabad' },
  { name: 'Dr. Rooma Sinha', specialty: 'High-risk, laparoscopy, infertility', city: 'Hyderabad', state: 'Telangana', highlights: '', fee: 1400, phone: '+91 9849012345', address: 'MaxCure Hospitals, Hyderabad' },
  { name: 'Dr. Roya Rozati', specialty: 'Gynecologist', city: 'Hyderabad', state: 'Telangana', highlights: '', fee: 1200, phone: '+91 9866012345', address: 'Maternal Health & Research Trust, Hyderabad' },
  // Maharashtra
  { name: 'Dr. Shalaka Shimpi', specialty: 'High-risk pregnancy, endometriosis', city: 'Pune', state: 'Maharashtra', highlights: '', fee: 1000, phone: '+91 9822012345', address: 'Cloudnine Hospital, Pune' },
  { name: 'Dr. Swati Malpani', specialty: 'Maternal-fetal medicine', city: 'Nagpur', state: 'Maharashtra', highlights: 'Stitchless hysterectomy.', fee: 900, phone: '+91 9823012345', address: 'Malpani Infertility Clinic, Nagpur' },
  // Tamil Nadu
  { name: 'Dr. Rajini Premalatha', specialty: 'Soft spoken and strict', city: 'Madurai', state: 'Tamil Nadu', highlights: 'At Grace Nursing Home.', fee: 800, phone: '+91 9443012345', address: 'Grace Nursing Home, Madurai' },
  // Karnataka
  { name: 'Dr. Priya Ballal', specialty: 'Amazing and non-judgmental', city: 'Mangalore', state: 'Karnataka', highlights: '', fee: 950, phone: '+91 9845012345', address: 'KMC Hospital, Mangalore' },
  { name: 'Dr. Farida Bengali', specialty: 'A legend', city: 'Bengaluru', state: 'Karnataka', highlights: '', fee: 1500, phone: '+91 9844012345', address: 'Bengali Women\'s Hospital, Bengaluru' },
];

const allStates = [...new Set(doctors.map(doc => doc.state))].sort();

const timeSlots = ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"];

const BookingDialog = ({ doctor }: { doctor: (typeof doctors)[0] }) => {
    const [step, setStep] = useState(1);
    const [consultationType, setConsultationType] = useState<'online' | 'offline' | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [appointmentId, setAppointmentId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleConfirm = () => {
        const newId = `APT${Math.floor(1000 + Math.random() * 9000)}`;
        setAppointmentId(newId);
        setStep(3);
    }
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard!' });
    };

    const handlePayment = () => {
        toast({
            title: 'Redirecting to Payment',
            description: 'You will be redirected to a secure payment gateway.',
        });
        // In a real app, you would redirect to a payment URL.
        // For this prototype, we'll just show a success message after a delay.
        setTimeout(() => {
            toast({
                title: 'Payment Successful!',
                description: `Your payment of ₹${doctor.fee} has been received.`,
            })
        }, 2000);
    }


    const renderStepOne = () => (
        <>
            <DialogHeader>
                <DialogTitle>Book an Appointment with {doctor.name}</DialogTitle>
                <DialogDescription>Choose your preferred consultation method.</DialogDescription>
            </DialogHeader>
            <RadioGroup onValueChange={(value: 'online' | 'offline') => setConsultationType(value)} className="grid grid-cols-2 gap-4 py-4">
                 <Label htmlFor="offline" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", consultationType === 'offline' && "border-primary")}>
                    <RadioGroupItem value="offline" id="offline" className="sr-only" />
                    <span>Offline Visit</span>
                </Label>
                 <Label htmlFor="online" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", consultationType === 'online' && "border-primary")}>
                    <RadioGroupItem value="online" id="online" className="sr-only" />
                    <span>Online Video Call</span>
                </Label>
            </RadioGroup>
            <DialogFooter>
                <Button onClick={() => setStep(2)} disabled={!consultationType}>Next</Button>
            </DialogFooter>
        </>
    );
     const renderStepTwo = () => (
        <>
            <DialogHeader>
                <DialogTitle>Select Date and Time</DialogTitle>
                <DialogDescription>Choose a slot for your {consultationType} consultation.</DialogDescription>
            </DialogHeader>
             <div className="grid md:grid-cols-2 gap-4 py-4">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                />
                <div className="grid grid-cols-2 gap-2 content-start">
                    {timeSlots.map(slot => (
                        <Button 
                            key={slot} 
                            variant={selectedTime === slot ? 'default' : 'outline'}
                            onClick={() => setSelectedTime(slot)}
                        >
                            {slot}
                        </Button>
                    ))}
                </div>
            </div>
             <DialogFooter>
                 <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                 <Button onClick={handleConfirm} disabled={!selectedDate || !selectedTime}>Confirm Appointment</Button>
            </DialogFooter>
        </>
    );

    const renderStepThree = () => (
        <>
             <DialogHeader>
                <DialogTitle className="text-green-600">Appointment Confirmed!</DialogTitle>
                <DialogDescription>Your appointment with {doctor.name} is scheduled.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Your Appointment ID</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                        <span className="font-mono text-lg">{appointmentId}</span>
                         <Button variant="ghost" size="icon" onClick={() => copyToClipboard(appointmentId!)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </AlertDescription>
                </Alert>
                <div className="text-sm">
                    <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {selectedTime}</p>
                    <p><strong>Type:</strong> {consultationType}</p>
                    <p><strong>Doctor:</strong> {doctor.name} ({doctor.specialty})</p>
                    <p><strong>Consultation Fee:</strong> ₹{doctor.fee}</p>
                </div>

                {consultationType === 'offline' ? (
                     <div>
                        <h4 className="font-semibold">Chamber Details</h4>
                        <p className="text-sm text-muted-foreground">{doctor.address}</p>
                        <p className="text-sm text-muted-foreground">Phone: {doctor.phone}</p>
                    </div>
                ) : (
                    <div>
                        <h4 className="font-semibold">Online Consultation</h4>
                        <p className="text-sm text-muted-foreground">A Google Meet link will be sent to your registered email and phone number 15 minutes before your scheduled time.</p>
                        <Button className="mt-2 w-full" onClick={handlePayment}>Pay ₹{doctor.fee} Now</Button>
                    </div>
                )}
            </div>
             <DialogFooter>
                 <DialogClose asChild>
                    <Button>Close</Button>
                 </DialogClose>
            </DialogFooter>
        </>
    );
    
    return (
        <DialogContent className="max-w-xl">
           {step === 1 && renderStepOne()}
           {step === 2 && renderStepTwo()}
           {step === 3 && renderStepThree()}
        </DialogContent>
    );
};


const DoctorListPage = ({ doctors, states }: { doctors: any[], states: string[] }) => {
    const [selectedState, setSelectedState] = useState('');

    const filteredDoctors = selectedState ? doctors.filter(doc => doc.state === selectedState) : doctors;

    return (
        <div className="container mx-auto py-8">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl">Gyno-Consultation</CardTitle>
                <CardDescription>Connect with professional gynecologists across the country.</CardDescription>
            </CardHeader>

            <div className="mb-8 flex justify-center">
                 <Select onValueChange={(value) => setSelectedState(value === "all" ? "" : value)} value={selectedState}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Filter by State" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {states.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                <Card key={doctor.name} className="flex flex-col">
                    <CardHeader>
                        <CardTitle>{doctor.name}</CardTitle>
                        <CardDescription>{doctor.specialty} - {doctor.city}, {doctor.state}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {doctor.highlights && <p className="text-sm text-muted-foreground">"{doctor.highlights}"</p>}
                        <p className="font-bold text-primary mt-2">Fee: ₹{doctor.fee}</p>
                    </CardContent>
                    <CardFooter>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full">Book an Appointment</Button>
                            </DialogTrigger>
                            <BookingDialog doctor={doctor} />
                        </Dialog>
                    </CardFooter>
                </Card>
                ))}
            </div>
        </div>
    )
}

export default function ConsultationPage() {
    // This component remains client-side to handle the stateful filtering and dialogs.
    // The data is passed down from a parent Server Component if we were to fully optimize.
    // For this case, keeping it simple as the data is a small, static array.
    return (
        <AppLayout>
            <DoctorListPage doctors={doctors} states={allStates} />
        </AppLayout>
    );
}