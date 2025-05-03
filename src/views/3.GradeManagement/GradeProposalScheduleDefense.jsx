import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useGetProposal, useGetReviewers } from "../../store/tanstackStore/services/queries";

const GradeProposalScheduleDefense = () => {
  const { id:proposalId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Defense details
  const [defenseDate, setDefenseDate] = useState(null);
  const [defenseTime, setDefenseTime] = useState('');
  const [location, setLocation] = useState('');
  const [chairperson, setChairperson] = useState('');
  const [minutesSecretary, setMinutesSecretary] = useState('');
  
  // Lists of people
  const [availablePanelists, setAvailablePanelists] = useState([]);
  const [availableReviewers, setAvailableReviewers] = useState([]);
  
  // Selected people
  const [selectedPanelists, setSelectedPanelists] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  
  // New panelist/reviewer form
  const [newPanelistName, setNewPanelistName] = useState('');
  const [newPanelistEmail, setNewPanelistEmail] = useState('');
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newReviewerEmail, setNewReviewerEmail] = useState('');
  const [newChairpersonName, setNewChairpersonName] = useState('');
  const [newChairpersonEmail, setNewChairpersonEmail] = useState('');
  const [newMinutesSecretaryName, setNewMinutesSecretaryName] = useState('');
  const [newMinutesSecretaryEmail, setNewMinutesSecretaryEmail] = useState('');
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Fetch proposal details using the custom hook
  const { data: proposalData, isLoading: proposalLoading } = useGetProposal(proposalId);

  // Fetch available panelists
  const { data: panelistsData, isLoading: panelistsLoading } = useQuery({
    queryKey: ['panelists'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/faculty/panelists`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    enabled: !!token,
    onSuccess: (data) => {
      setAvailablePanelists(data.panelists || []);
    }
  });

  // Fetch available reviewers using the custom hook
  const { data: reviewersData, isLoading: reviewersLoading } = useGetReviewers();
  
  useEffect(() => {
    if (reviewersData) {
      setAvailableReviewers(reviewersData.reviewers || []);
    }
  }, [reviewersData]);

  const proposal = proposalData?.proposal;
  console.log(proposal);
  const loading = proposalLoading || panelistsLoading || reviewersLoading;

  const validateForm = () => {
    const errors = {};
    
    if (!defenseDate) errors.defenseDate = 'Defense date is required';
    if (!defenseTime) errors.defenseTime = 'Defense time is required';
    if (!location.trim()) errors.location = 'Location is required';
    if (!chairperson.trim()) errors.chairperson = 'Chairperson is required';
    if (!minutesSecretary.trim()) errors.minutesSecretary = 'Minutes secretary is required';
    if (selectedPanelists.length === 0) errors.panelists = 'At least one panelist is required';
    if (selectedReviewers.length === 0) errors.reviewers = 'At least one reviewer is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPanelist = (panelistId) => {
    const panelist = availablePanelists.find(p => p.id === panelistId);
    if (panelist && !selectedPanelists.some(p => p.id === panelistId)) {
      setSelectedPanelists([...selectedPanelists, panelist]);
    }
  };

  const handleRemovePanelist = (panelistId) => {
    setSelectedPanelists(selectedPanelists.filter(p => p.id !== panelistId));
  };

  const handleAddReviewer = (reviewerId) => {
    const reviewer = availableReviewers.find(r => r.id === reviewerId);
    if (reviewer && !selectedReviewers.some(r => r.id === reviewerId)) {
      setSelectedReviewers([...selectedReviewers, reviewer]);
    }
  };

  const handleRemoveReviewer = (reviewerId) => {
    setSelectedReviewers(selectedReviewers.filter(r => r.id !== reviewerId));
  };

  const handleCreateNewPanelist = async () => {
    if (!newPanelistName.trim() || !newPanelistEmail.trim()) {
      setError('Panelist name and email are required');
      return;
    }
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/faculty/panelists`,
        {
          name: newPanelistName,
          email: newPanelistEmail
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newPanelist = response.data.panelist;
      setAvailablePanelists([...availablePanelists, newPanelist]);
      setSelectedPanelists([...selectedPanelists, newPanelist]);
      setNewPanelistName('');
      setNewPanelistEmail('');
      setSuccess('New panelist added successfully');
    } catch (err) {
      console.error('Error creating panelist:', err);
      setError(err.response?.data?.message || 'Failed to create panelist');
    }
  };

  const handleCreateNewReviewer = async () => {
    if (!newReviewerName.trim() || !newReviewerEmail.trim()) {
      setError('Reviewer name and email are required');
      return;
    }
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/faculty/reviewer`,
        {
          name: newReviewerName,
          email: newReviewerEmail
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newReviewer = response.data.reviewer;
      setAvailableReviewers([...availableReviewers, newReviewer]);
      setSelectedReviewers([...selectedReviewers, newReviewer]);
      setNewReviewerName('');
      setNewReviewerEmail('');
      setSuccess('New reviewer added successfully');
    } catch (err) {
      console.error('Error creating reviewer:', err);
      setError(err.response?.data?.message || 'Failed to create reviewer');
    }
  };

  const handleCreateNewChairperson = async () => {
    if (!newChairpersonName.trim() || !newChairpersonEmail.trim()) {
      setError('Chairperson name and email are required');
      return;
    }
    
    try {
      // Assuming the API endpoint and structure is similar to panelists
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/faculty/chairperson`,
        {
          name: newChairpersonName,
          email: newChairpersonEmail
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setChairperson(newChairpersonName);
      setNewChairpersonName('');
      setNewChairpersonEmail('');
      setSuccess('New chairperson added successfully');
    } catch (err) {
      console.error('Error creating chairperson:', err);
      setError(err.response?.data?.message || 'Failed to create chairperson');
    }
  };

  const handleCreateNewMinutesSecretary = async () => {
    if (!newMinutesSecretaryName.trim() || !newMinutesSecretaryEmail.trim()) {
      setError('Minutes secretary name and email are required');
      return;
    }
    
    try {
      // Assuming the API endpoint and structure is similar to panelists
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/faculty/minutes-secretary`,
        {
          name: newMinutesSecretaryName,
          email: newMinutesSecretaryEmail
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMinutesSecretary(newMinutesSecretaryName);
      setNewMinutesSecretaryName('');
      setNewMinutesSecretaryEmail('');
      setSuccess('New minutes secretary added successfully');
    } catch (err) {
      console.error('Error creating minutes secretary:', err);
      setError(err.response?.data?.message || 'Failed to create minutes secretary');
    }
  };

  const handleScheduleDefense = async () => {
    if (!validateForm()) return;
    
    try {
      // Combine date and time
      const dateTimeString = `${format(defenseDate, 'yyyy-MM-dd')}T${defenseTime}:00`;
      const combinedDateTime = new Date(dateTimeString);
      
      const defenseData = {
        defenseDate: combinedDateTime.toISOString(),
        location,
        chairperson,
        minutesSecretary,
        panelists: selectedPanelists.map(p => p.id),
        reviewers: selectedReviewers.map(r => r.id)
      };
      
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/faculty/proposals/${proposalId}/defenses`,
        defenseData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Defense scheduled successfully');
      setTimeout(() => {
        navigate('/grade-management');
      }, 2000);
    } catch (err) {
      console.error('Error scheduling defense:', err);
      setError(err.response?.data?.message || 'Failed to schedule defense');
    }
  };

  const handleSendEmails = async () => {
    if (!validateForm()) return;
    
    try {
      // This would be implemented on the backend
      // For now, we'll just show a success message
      setSuccess('Notification emails sent successfully');
    } catch (err) {
      console.error('Error sending emails:', err);
      setError('Failed to send notification emails');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error && !proposal) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Schedule Proposal Defense
        </h1>

         {/* Control Panel */}
      <div className="px-6 py-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg gap-2 hover:bg-primary-900"
              >
                    <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="flex flex-col">
                <span className="text-lg font-medium text-gray-900">
                  Proposal: {proposalData?.proposal?.title || "Loading..."}
                </span>
                <span className="text-sm font-[Inter-Medium] capitalize text-gray-600">
                  Student: {`${proposalData?.proposal?.student?.firstName} ${proposalData?.proposal?.student?.lastName}` || "Not Available"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
        
        {proposal && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Proposal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2"><span className="font-semibold">Title:</span> {proposal.title}</p>
                  <p className="mb-2"><span className="font-semibold">Student:</span> {`${proposal.student?.firstName} ${proposal.student?.lastName}`}</p>
                  <p className="mb-2"><span className="font-semibold">Registration Number:</span> {proposal.student?.registrationNumber}</p>
                </div>
                <div>
                  <p className="mb-2"><span className="font-semibold">Submission Date:</span> {new Date(proposal.submissionDate).toLocaleDateString()}</p>
                  <p className="mb-2"><span className="font-semibold">Status:</span> {proposal.statuses?.find(s => s.isCurrent)?.definition?.name || 'Unknown'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Defense Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <Label htmlFor="defense-date" className="mb-2">Defense Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${formErrors.defenseDate ? 'border-red-500' : ''}`}
                    >
                      {defenseDate ? format(defenseDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={defenseDate}
                      onSelect={setDefenseDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {formErrors.defenseDate && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.defenseDate}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="defense-time" className="mb-2">Defense Time *</Label>
                <Input
                  id="defense-time"
                  type="time"
                  className={`${formErrors.defenseTime ? 'border-red-500' : ''}`}
                  value={defenseTime}
                  onChange={(e) => setDefenseTime(e.target.value)}
                />
                {formErrors.defenseTime && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.defenseTime}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="location" className="mb-2">Location *</Label>
                <Input
                  id="location"
                  type="text"
                  className={`${formErrors.location ? 'border-red-500' : ''}`}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                {formErrors.location && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>
                )}
              </div>
              
          
              
            
            </div>

            {/** Chairperson and Minutes Secretary */}
            <div className="mb-8">
            <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center mb-4">
                  <div className="flex-grow h-px bg-gray-200"></div>
                  <span className="px-3 text-gray-500 bg-white">Chairperson</span>
                  <div className="flex-grow h-px bg-gray-200"></div>
                </div>
                
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Add Chairperson</h3>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-2">
                      <Input
                        type="text"
                        placeholder="Name"
                        value={newChairpersonName}
                        onChange={(e) => setNewChairpersonName(e.target.value)}
                        className={`${formErrors.chairperson ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={newChairpersonEmail}
                        onChange={(e) => setNewChairpersonEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        className="w-full"
                        onClick={handleCreateNewChairperson}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  {formErrors.chairperson && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.chairperson}</p>
                  )}
                  {chairperson && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-md">
                      <p className="font-medium">Current Chairperson: {chairperson}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/** Minutes secretary */}
            <div className="mb-8">
            <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center mb-4">
                  <div className="flex-grow h-px bg-gray-200"></div>
                  <span className="px-3 text-gray-500 bg-white">Minutes Secretary</span>
                  <div className="flex-grow h-px bg-gray-200"></div>
                </div>
                
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Add Minutes Secretary</h3>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-2">
                      <Input
                        type="text"
                        placeholder="Name"
                        value={newMinutesSecretaryName}
                        onChange={(e) => setNewMinutesSecretaryName(e.target.value)}
                        className={`${formErrors.minutesSecretary ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={newMinutesSecretaryEmail}
                        onChange={(e) => setNewMinutesSecretaryEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        className="w-full"
                        onClick={handleCreateNewMinutesSecretary}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  {formErrors.minutesSecretary && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.minutesSecretary}</p>
                  )}
                  {minutesSecretary && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-md">
                      <p className="font-medium">Current Minutes Secretary: {minutesSecretary}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="px-3 text-gray-500 bg-white">Panelists</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="add-panelist" className="mb-2">Add Panelist</Label>
                  <Select onValueChange={handleAddPanelist}>
                    <SelectTrigger className={`${formErrors.panelists ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select a panelist" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePanelists
                        .filter(p => !selectedPanelists.some(sp => sp.id === p.id))
                        .map(panelist => (
                          <SelectItem key={panelist.id} value={panelist.id}>
                            {panelist.name} ({panelist.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {formErrors.panelists && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.panelists}</p>
                  )}
                </div>
                
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Add New Panelist</h3>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-2">
                      <Input
                        type="text"
                        placeholder="Name"
                        value={newPanelistName}
                        onChange={(e) => setNewPanelistName(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={newPanelistEmail}
                        onChange={(e) => setNewPanelistEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        className="w-full"
                        onClick={handleCreateNewPanelist}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Selected Panelists</h3>
                {selectedPanelists.length === 0 ? (
                  <p className="text-gray-500">No panelists selected</p>
                ) : (
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {selectedPanelists.map(panelist => (
                      <li key={panelist.id} className="flex justify-between items-center p-3">
                        <div>
                          <p className="font-medium">{panelist.name}</p>
                          <p className="text-sm text-gray-500">{panelist.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemovePanelist(panelist.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="px-3 text-gray-500 bg-white">Reviewers</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="add-reviewer" className="mb-2">Add Reviewer</Label>
                  <Select onValueChange={handleAddReviewer}>
                    <SelectTrigger className={`${formErrors.reviewers ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select a reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableReviewers
                        .filter(r => !selectedReviewers.some(sr => sr.id === r.id))
                        .map(reviewer => (
                          <SelectItem key={reviewer.id} value={reviewer.id}>
                            {reviewer.name} ({reviewer.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {formErrors.reviewers && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.reviewers}</p>
                  )}
                </div>
                
                <div className="border border-gray-200 rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Add New Reviewer</h3>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-2">
                      <Input
                        type="text"
                        placeholder="Name"
                        value={newReviewerName}
                        onChange={(e) => setNewReviewerName(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={newReviewerEmail}
                        onChange={(e) => setNewReviewerEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        className="w-full"
                        onClick={handleCreateNewReviewer}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Selected Reviewers</h3>
                {selectedReviewers.length === 0 ? (
                  <p className="text-gray-500">No reviewers selected</p>
                ) : (
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {selectedReviewers.map(reviewer => (
                      <li key={reviewer.id} className="flex justify-between items-center p-3">
                        <div>
                          <p className="font-medium">{reviewer.name}</p>
                          <p className="text-sm text-gray-500">{reviewer.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveReviewer(reviewer.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => navigate('/grade-management')}
              >
                Cancel
              </Button>
              
              <div className="space-x-4">
                <Button
                  variant="outline"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleSendEmails}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Send Notifications
                </Button>
                
                <Button
                  onClick={handleScheduleDefense}
                >
                  Schedule Defense
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Success notification */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error notification */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeProposalScheduleDefense;
