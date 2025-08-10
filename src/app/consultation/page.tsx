'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/layout/AppLayout';

const doctors = [
  // Delhi/NCR
  { name: 'Dr. Vivek Marwah', specialty: 'Minimally invasive laparoscopy', city: 'New Delhi', state: 'Delhi', highlights: 'Guinness World Record holder.' },
  { name: 'Dr. Rahul Manchanda', specialty: 'Endoscopic and infertility specialist', city: 'New Delhi', state: 'Delhi', highlights: '' },
  // UP
  { name: 'Dr. Meenakshi Maurya', specialty: 'Experienced gynecologist', city: 'Greater Noida', state: 'Uttar Pradesh', highlights: 'Operates multiple clinics.' },
  { name: 'Dr. Chitra Varma', specialty: 'Nearly 40 years of experience', city: 'Lucknow', state: 'Uttar Pradesh', highlights: 'Admired for her friendly approach.' },
  { name: 'Dr. Sunita Chandra', specialty: 'Infertility specialist and laparoscopic surgeon', city: 'Lucknow', state: 'Uttar Pradesh', highlights: 'Over 30 years of practice.' },
  { name: 'Dr. Archana Trivedi', specialty: 'Laparoscopic and hysteroscopic surgeries', city: 'Kanpur', state: 'Uttar Pradesh', highlights: 'Skilled in high-risk pregnancies.' },
  // Rajasthan
  { name: 'Dr. Rachna Mishra', specialty: 'Laparoscopic & fertility expert', city: 'Jaipur', state: 'Rajasthan', highlights: 'Former Medical Director at Apollo.' },
  // West Bengal
  { name: 'Dr. Ankita Mandal', specialty: 'Gynecologist', city: 'Durgapur', state: 'West Bengal', highlights: '' },
  { name: 'Dr. Debalina Brahma', specialty: '30 years experience', city: 'Kolkata', state: 'West Bengal', highlights: '' },
  { name: 'Dr. Gouri Kumra', specialty: 'Menopause, adolescence, infertility', city: 'Kolkata', state: 'West Bengal', highlights: '' },
  { name: 'Dr. Dibyendu Banerjee', specialty: 'ICSI, laparoscopy, infertility', city: 'Kolkata', state: 'West Bengal', highlights: '' },
  { name: 'Dr. Tamami Chowdhury', specialty: 'Laparoscopic surgeon and OB-GYN', city: 'Siliguri', state: 'West Bengal', highlights: 'Notable regional recognition.' },
  { name: 'Dr. Monika Agarwal', specialty: 'Comprehensive women’s care', city: 'Siliguri', state: 'West Bengal', highlights: '' },
  { name: 'Dr. Arnab Basak', specialty: 'Fertility, high-risk pregnancy, laparoscopy', city: 'Kolkata', state: 'West Bengal', highlights: '31 years of experience.' },
  { name: 'Dr. Irina Dey', specialty: 'OB-GYN', city: 'Kolkata', state: 'West Bengal', highlights: 'Recognized credentials and patient care.' },
  // Bihar
  { name: 'Dr. Sarika Rai', specialty: 'Over 30 years’ experience', city: 'Patna', state: 'Bihar', highlights: '' },
  // Telangana
  { name: 'Dr. Anuradha Panda', specialty: 'High-risk, laparoscopy, infertility', city: 'Hyderabad', state: 'Telangana', highlights: '' },
  { name: 'Dr. Rooma Sinha', specialty: 'High-risk, laparoscopy, infertility', city: 'Hyderabad', state: 'Telangana', highlights: '' },
  { name: 'Dr. Roya Rozati', specialty: 'Gynecologist', city: 'Hyderabad', state: 'Telangana', highlights: '' },
  { name: 'Dr. Shilpa Reddy', specialty: 'Gynecologist', city: 'Hyderabad', state: 'Telangana', highlights: '' },
  { name: 'Dr. Manjula Anagani', specialty: 'Gynecologist', city: 'Hyderabad', state: 'Telangana', highlights: '' },
  // Kerala
  { name: 'Dr. Sheila Balakrishnan', specialty: 'IVF pioneer', city: 'Trivandrum', state: 'Kerala', highlights: 'Authored key textbooks.' },
  { name: 'Dr. Teena Anne Joy', specialty: 'Gynecologist', city: 'Unknown', state: 'Kerala', highlights: '' },
  { name: 'Dr. Zareena A K', specialty: 'Gynecologist', city: 'Unknown', state: 'Kerala', highlights: '' },
  { name: 'Dr. Anne Joy', specialty: 'Gynecologist', city: 'Unknown', state: 'Kerala', highlights: '' },
  { name: 'Dr. George Paul', specialty: 'Gynecologist', city: 'Unknown', state: 'Kerala', highlights: '' },
  { name: 'Dr. Sindhu', specialty: 'Gynecologist', city: 'Unknown', state: 'Kerala', highlights: '' },
  { name: 'Dr. Veena Choodamani', specialty: 'Gynecologist', city: 'Unknown', state: 'Kerala', highlights: '' },
  { name: 'Dr. Rema Kurup', specialty: 'Gynecologist', city: 'Unknown', state: 'Kerala', highlights: '' },
  { name: 'Dr. N. Syamala', specialty: 'Gynecologist', city: 'Unknown', state: 'Kerala', highlights: '' },
  { name: 'Dr. Devika Rani', specialty: 'Gynecologist', city: 'Unknown', state: 'Kerala', highlights: '' },
  // Odisha
  { name: 'Dr. Sabina Musa Kazi', specialty: 'Painless deliveries, advanced endoscopic surgery', city: 'Bhubaneswar', state: 'Odisha', highlights: '' },
  { name: 'Dr. Ushashree Das', specialty: 'Gynecologic oncologist', city: 'Bhubaneswar', state: 'Odisha', highlights: 'International fellowship.' },
  // Jharkhand
  { name: 'Dr. Anshu Agarwal', specialty: 'Minimal access surgery and infertility', city: 'Ranchi', state: 'Jharkhand', highlights: 'Reassuring and explanatory approach.' },
  { name: 'Dr. Aarti Jyoti', specialty: 'Laparoscopic surgeries and infertility', city: 'Ranchi', state: 'Jharkhand', highlights: 'Over 17 years of experience.' },
  // Maharashtra
  { name: 'Dr. Shalaka Shimpi', specialty: 'High-risk pregnancy, endometriosis', city: 'Pune', state: 'Maharashtra', highlights: '' },
  { name: 'Dr. Swati Malpani', specialty: 'Maternal-fetal medicine', city: 'Nagpur', state: 'Maharashtra', highlights: 'Stitchless hysterectomy.' },
  { name: 'Dr. Kishore Pandit', specialty: 'Over 24 years of experience', city: 'Pune', state: 'Maharashtra', highlights: '' },
  { name: 'Dr. Vinod Bharti', specialty: 'Gynecologist', city: 'Pune', state: 'Maharashtra', highlights: 'At Rising Medicare Hospital.' },
  // Tamil Nadu
  { name: 'Dr. Rajini Premalatha', specialty: 'Soft spoken and strict', city: 'Madurai', state: 'Tamil Nadu', highlights: 'At Grace Nursing Home.' },
  { name: 'Dr. Jalaja', specialty: 'Decades of trusted experience', city: 'Madurai', state: 'Tamil Nadu', highlights: 'At Lakshmi Hospital.' },
  { name: 'Dr. Swathika Manoharan', specialty: 'Gynecologist', city: 'Coimbatore', state: 'Tamil Nadu', highlights: '' },
  { name: 'Dr. Janani', specialty: 'Gynecologist', city: 'Coimbatore', state: 'Tamil Nadu', highlights: '' },
  { name: 'Dr. Renukadevi', specialty: 'Gynecologist', city: 'Coimbatore', state: 'Tamil Nadu', highlights: '' },
  { name: 'Dr. Kumudham', specialty: 'Gynecologist', city: 'Coimbatore', state: 'Tamil Nadu', highlights: '' },
  { name: 'Dr. Sharadha', specialty: 'Gynecologist', city: 'Coimbatore', state: 'Tamil Nadu', highlights: '' },
  { name: 'Dr. Chitra', specialty: 'Gynecologist', city: 'Coimbatore', state: 'Tamil Nadu', highlights: '' },
  // Karnataka
  { name: 'Dr. Priya Ballal', specialty: 'Amazing and non-judgmental', city: 'Mangalore', state: 'Karnataka', highlights: '' },
  { name: 'Dr. Deepak Shedde', specialty: 'Gynecologist', city: 'Mangalore', state: 'Karnataka', highlights: '' },
  { name: 'Dr. Hema Mallya', specialty: 'Gynecologist', city: 'Mangalore', state: 'Karnataka', highlights: '' },
  { name: 'Dr. Farida Bengali', specialty: 'A legend', city: 'Bengaluru', state: 'Karnataka', highlights: '' },
  { name: 'Dr. Deepthi RK Shashidhar', specialty: 'Open-minded and listens', city: 'Bengaluru', state: 'Karnataka', highlights: '' },
  // Kashmir
  { name: 'Dr. Shahida Mir', specialty: 'Gynecologist', city: 'Unknown', state: 'Kashmir', highlights: '' },
  { name: 'Dr. Syed Naseer', specialty: 'Gynecologist', city: 'Unknown', state: 'Kashmir', highlights: '' },
  { name: 'Dr. Shora', specialty: 'Gynecologist', city: 'Unknown', state: 'Kashmir', highlights: '' },
  { name: 'Dr. Rajni Bala', specialty: 'Gynecologist', city: 'Unknown', state: 'Kashmir', highlights: '' },
  // Andhra Pradesh
  { name: 'Dr. Ramya Sadaram', specialty: 'Gynecologist', city: 'Visakhapatnam', state: 'Andhra Pradesh', highlights: '' },
  { name: 'Dr. Radhika', specialty: 'Gynecologist', city: 'Visakhapatnam', state: 'Andhra Pradesh', highlights: '' },
  // Madhya Pradesh
  { name: 'Dr. Komal Vijayvargiya', specialty: 'Gynecologist', city: 'Indore', state: 'Madhya Pradesh', highlights: '' },
  { name: 'Dr. Sunita Bhatnagar', specialty: 'Gynecologist', city: 'Indore', state: 'Madhya Pradesh', highlights: '' },
  // Tripura
  { name: 'Dr. Suchandra Mukhopadhyay', specialty: 'Gynecologist', city: 'Agartala', state: 'Tripura', highlights: '' },
  { name: 'Dr. Piya Ray', specialty: 'Gynecologist', city: 'Agartala', state: 'Tripura', highlights: '' },
  // Gujarat
  { name: 'Dr. Nisarg Dharaiya', specialty: 'Gynecologist', city: 'Unknown', state: 'Gujarat', highlights: '' },
  { name: 'Dr. Rupal Shah', specialty: 'Gynecologist', city: 'Unknown', state: 'Gujarat', highlights: '' },
  // Assam
  { name: 'Prof. Dipika Deka', specialty: 'Gynecologist', city: 'Guwahati', state: 'Assam', highlights: 'At NBWCC.' },
];

const allStates = [...new Set(doctors.map(doc => doc.state))].sort();


export default function ConsultationPage() {
    const [selectedState, setSelectedState] = useState('');

    const filteredDoctors = selectedState ? doctors.filter(doc => doc.state === selectedState) : doctors;

  return (
    <AppLayout>
        <div className="container mx-auto py-8">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl">Gyno-Consultation</CardTitle>
                <CardDescription>Connect with professional gynecologists across the country.</CardDescription>
            </CardHeader>

            <div className="mb-8 flex justify-center">
                 <Select onValueChange={setSelectedState} value={selectedState}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Filter by State" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All States</SelectItem>
                        {allStates.map(state => (
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
                </CardContent>
                <CardFooter>
                    <Button className="w-full">Book a Slot</Button>
                </CardFooter>
            </Card>
            ))}
        </div>
        </div>
    </AppLayout>
  );
}
