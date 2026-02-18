
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import StepGuide from './components/StepGuide';
import { Persona, AppointmentType, TimeSlot } from './types';
import { APPOINTMENT_TYPES } from './constants';
import { fetchAvailability, createBooking } from './services/mockApi';

const App: React.FC = () => {
  const [step, setStep] = useState<'persona' | 'type' | 'calendar' | 'form' | 'success'>('persona');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedType, setSelectedType] = useState<AppointmentType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    propertyAddress: '',
    closingDate: '',
    agentName: '',
    companyName: ''
  });

  useEffect(() => {
    if (step === 'calendar' && selectedType) {
      loadSlots();
    }
  }, [selectedDate, selectedType, step]);

  const loadSlots = async () => {
    setIsLoading(true);
    const slots = await fetchAvailability(selectedType!.id, selectedDate);
    setAvailableSlots(slots);
    setIsLoading(false);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const id = await createBooking({
      persona: selectedPersona,
      type: selectedType?.id,
      slot: selectedSlot,
      ...formData
    });
    setBookingId(id);
    setIsLoading(false);
    setStep('success');
  };

  const renderPersonaSelection = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-fadeIn">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-blue mb-3 tracking-tight">Secure your closing experience</h1>
        <p className="text-slate-500 text-sm md:text-base">Select your role to view available appointment types.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['Buyer', 'Seller', 'Real Estate Agent', 'Lender'] as Persona[]).map((p) => (
          <button
            key={p}
            onClick={() => { setSelectedPersona(p); setStep('type'); }}
            className="group p-6 bg-white border border-slate-200 rounded-xl text-left hover:border-brand-teal hover:shadow-lg transition-all flex justify-between items-center"
          >
            <div>
              <span className="block text-brand-blue text-xl font-bold mb-0.5">{p}</span>
              <span className="text-slate-400 text-xs">Schedule a {p.toLowerCase()} service</span>
            </div>
            <span className="text-brand-teal transform translate-x-0 group-hover:translate-x-1 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTypeSelection = () => {
    const eligibleTypes = APPOINTMENT_TYPES.filter(t => t.personaEligibility.includes(selectedPersona!));
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-fadeIn">
        <button onClick={() => setStep('persona')} className="mb-6 text-brand-blue text-sm font-semibold flex items-center hover:opacity-75 transition-opacity">
          <span className="mr-1">←</span> <span>Back</span>
        </button>
        <h2 className="text-2xl font-bold text-brand-blue mb-6">Choose Appointment Type</h2>
        <div className="space-y-3">
          {eligibleTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedType(t); setStep('calendar'); }}
              className="w-full p-5 bg-white border border-slate-200 rounded-xl text-left hover:border-brand-blue hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-brand-blue transition-colors">{t.title}</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal bg-teal-50 px-2 py-0.5 rounded">
                  {t.locationType}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-3">{t.description}</p>
              <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> {t.durationMinutes} min</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderCalendar = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <button onClick={() => setStep('type')} className="mb-4 text-brand-blue text-sm font-semibold hover:opacity-75 flex items-center">
            <span className="mr-1">←</span> Back
          </button>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-brand-blue mb-3">{selectedType?.title}</h2>
            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <p>{selectedType?.description}</p>
              <div className="flex flex-col space-y-1 bg-slate-50 p-3 rounded-lg">
                <span className="font-semibold text-slate-800">Duration: {selectedType?.durationMinutes} minutes</span>
                <span className="font-semibold text-slate-800">Format: {selectedType?.locationType === 'inOffice' ? 'In Person (WCT Office)' : 'Remote (Digital)'}</span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="font-bold uppercase tracking-brand text-[10px] text-slate-400 mb-3">Preparation Checklist</h4>
              <ul className="text-[11px] space-y-2 text-slate-500">
                <li className="flex items-start">
                  <span className="mr-2 text-brand-teal font-bold">•</span>
                  <span>Valid government-issued photo ID</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-brand-teal font-bold">•</span>
                  <span>All required closing documentation</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-brand-teal font-bold">•</span>
                  <span>Proof of wire transfer (if required)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-800">Available Slots</h3>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-slate-200 rounded-md px-3 py-1.5 text-xs focus:ring-1 focus:ring-brand-blue outline-none"
              />
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-24 space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
                  <span className="text-xs text-slate-400 font-medium">Loading availability...</span>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => { setSelectedSlot(slot); setStep('form'); }}
                      className="py-2.5 px-2 border border-slate-100 bg-slate-50 rounded-lg text-xs font-semibold hover:border-brand-teal hover:bg-white hover:text-brand-blue hover:shadow-sm transition-all text-slate-600"
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 text-slate-400 text-sm">
                  No availability on {new Date(selectedDate).toLocaleDateString()}.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-xl">
        <div className="mb-8">
           <button onClick={() => setStep('calendar')} className="mb-4 text-brand-blue text-xs font-bold uppercase tracking-wider hover:opacity-75 transition-opacity">← Back to calendar</button>
           <h2 className="text-2xl font-bold text-brand-blue mb-1">Confirmation Details</h2>
           <p className="text-slate-400 text-xs">
             Scheduling <strong>{selectedType?.title}</strong> for <strong>{selectedSlot?.label}</strong> on <strong>{new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</strong>
           </p>
        </div>
        
        <form onSubmit={handleBooking} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">First Name</label>
            <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-brand-blue outline-none transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Last Name</label>
            <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-brand-blue outline-none transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-brand-blue outline-none transition-colors" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone Number</label>
            <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-brand-blue outline-none transition-colors" />
          </div>

          {(selectedPersona === 'Buyer' || selectedPersona === 'Seller') && (
            <>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Property Address</label>
                <input required type="text" value={formData.propertyAddress} onChange={e => setFormData({...formData, propertyAddress: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-brand-blue outline-none transition-colors" placeholder="123 Main St, City, ST" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Est. Closing Date</label>
                <input required type="date" value={formData.closingDate} onChange={e => setFormData({...formData, closingDate: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-brand-blue outline-none transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Agent & Brokerage</label>
                <input required type="text" value={formData.agentName} onChange={e => setFormData({...formData, agentName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-brand-blue outline-none transition-colors" />
              </div>
            </>
          )}

          {selectedPersona === 'Lender' && (
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Lending Institution / Company</label>
              <input required type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-brand-blue outline-none transition-colors" />
            </div>
          )}

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Notes (Optional)</label>
            <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-brand-blue outline-none transition-colors resize-none" />
          </div>

          <div className="hidden">
            <input type="text" name="b_bot_protection" tabIndex={-1} />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              disabled={isLoading}
              className="w-full bg-brand-blue text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-800 disabled:bg-slate-300 transition-all shadow-md active:scale-[0.98]"
            >
              {isLoading ? 'Securing your slot...' : 'Confirm Appointment'}
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-4 leading-relaxed">
              By confirming, you agree to our <a href="#" className="underline">Terms of Service</a>. We prioritize your privacy and data security.
            </p>
          </div>
        </form>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center animate-fadeIn">
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-xl">
        <div className="w-16 h-16 bg-teal-50 text-brand-teal rounded-full flex items-center justify-center text-3xl mx-auto mb-6">✓</div>
        <h2 className="text-2xl font-bold text-brand-blue mb-2">Appointment Secured</h2>
        <p className="text-slate-500 text-sm mb-1">A confirmation has been sent to <strong>{formData.email}</strong></p>
        <p className="text-brand-teal font-bold text-sm tracking-widest mb-10">CONFIRMATION: {bookingId}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
          <button className="flex items-center justify-center space-x-2 border border-slate-200 py-3 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-slate-600 text-xs uppercase tracking-wider">
            <span>📅</span> <span>Add to Calendar</span>
          </button>
          <button className="flex items-center justify-center space-x-2 border border-slate-200 py-3 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-slate-600 text-xs uppercase tracking-wider">
            <span>📞</span> <span>Contact Closer</span>
          </button>
        </div>

        <StepGuide />

        <div className="mt-10">
          <button onClick={() => window.location.reload()} className="text-brand-blue text-xs font-bold uppercase tracking-widest hover:underline transition-all">Schedule Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="transition-all duration-300">
        {step === 'persona' && renderPersonaSelection()}
        {step === 'type' && renderTypeSelection()}
        {step === 'calendar' && renderCalendar()}
        {step === 'form' && renderForm()}
        {step === 'success' && renderSuccess()}
      </div>
    </Layout>
  );
};

export default App;
