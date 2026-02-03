import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const TechnicianOnboardingPage = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true); // Initial loading true to fetch
    const [isExistingProfile, setIsExistingProfile] = useState(false);

    // Profile Data
    const [profileData, setProfileData] = useState({
        bio: '',
        skills: '', // Comma separated string input, converted to array
        latitude: '',
        longitude: ''
    });

    useEffect(() => {
        if (user?.isTechnicianOnboarded) {
            navigate('/technician/dashboard');
            return;
        }

        const checkExistingProfile = async () => {
            try {
                const { data } = await api.get('/technicians/me');
                if (data.data.profile) {
                    // If profile is already marked completed, sync and redirect
                    if (data.data.profile.isProfileCompleted) {
                        await refreshUser();
                        navigate('/technician/dashboard');
                        return;
                    }

                    setProfileData({
                        bio: data.data.profile.bio || '',
                        skills: (data.data.profile.skills || []).join(', '),
                        latitude: data.data.profile.location?.coordinates?.[1]?.toString() || '',
                        longitude: data.data.profile.location?.coordinates?.[0]?.toString() || ''
                    });
                    setIsExistingProfile(true);
                    setStep(2); // Skip to docs since profile exists
                }
            } catch (error) {
                console.error('Error checking profile', error);
            } finally {
                setLoading(false);
            }
        };
        checkExistingProfile();
    }, []);

    // Documents
    const [documents, setDocuments] = useState({
        aadharCard: null,
        panCard: null,
        resume: null
    });

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setDocuments({ ...documents, [e.target.name]: e.target.files[0] });
    };

    const submitProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Form Data for Profile
            const formData = new FormData();
            formData.append('bio', profileData.bio);

            // Skills processing
            const skillsArray = profileData.skills.split(',').map(s => s.trim()).filter(s => s);
            skillsArray.forEach(skill => formData.append('skills[]', skill)); // Appending array properly usually depends on backend, but form-data often handles same-key repeats as array
            // NOTE: Backend validation expects Joi.array().single(), so sending the same key multiple times or JSON string might be needed.
            // Let's try appending as simple fields first, but backend might need adjustments. 
            // Better approach for 'skills' might be to send them individually if backend parses array, OR just send as text if backend supported it. 
            // Looking at Joi: `skills: Joi.array().items(Joi.string().trim()).min(1).single().required()`
            // Since we are using FormData (for image support potential), array handling can be tricky.
            // Let's assume standard Express multer/body-parser array handling: `skills`

            // Actually, for profile creation, the backend `technicianRoutes.js` uses `upload.single('profilePhoto')`.
            // So we can send JSON if we don't upload photo here, OR use FormData if we do. 
            // The route uses `upload.single('profilePhoto')`, so we MUST use FormData.
            // Express body-parser with multer should handle `skills` as an array if multiple fields are sent, OR we can send passed indices.

            // Quick fix: Send skills one by one.
            skillsArray.forEach(skill => formData.append('skills', skill));

            // Location
            formData.append('location[type]', 'Point');
            formData.append('location[coordinates][0]', profileData.longitude);
            formData.append('location[coordinates][1]', profileData.latitude);

            if (isExistingProfile) {
                await api.patch('/technicians/profile', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/technicians/profile', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            await refreshUser();
            toast.success('Profile created! Now upload documents.');
            setStep(2);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Profile creation failed');
        } finally {
            setLoading(false);
        }
    };

    const submitDocuments = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            if (documents.aadharCard) formData.append('aadharCard', documents.aadharCard);
            if (documents.panCard) formData.append('panCard', documents.panCard);
            if (documents.resume) formData.append('resume', documents.resume);

            await api.post('/technicians/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await refreshUser();
            toast.success('Documents uploaded! Pending verification.');
            navigate('/technician/dashboard');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Document upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 max-w-3xl w-full mx-auto p-8">
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">
                        Technician Onboarding - Step {step} of 2
                    </h1>

                    {step === 1 && (
                        <form onSubmit={submitProfile} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Professional Bio</label>
                                <textarea
                                    name="bio"
                                    rows={4}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={profileData.bio}
                                    onChange={handleProfileChange}
                                    placeholder="Tell us about your experience..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Skills (comma separated)
                                </label>
                                <input
                                    type="text"
                                    name="skills"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={profileData.skills}
                                    onChange={handleProfileChange}
                                    placeholder="e.g. Plumbing, Electrician, AC Repair"
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="text-sm text-gray-700 mb-2 font-bold flex items-center gap-2">
                                    Service Location
                                </label>
                                <p className="text-xs text-gray-500 mb-4">We use your location to show you jobs in your area.</p>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                                        <input
                                            type="text"
                                            name="latitude"
                                            required
                                            readOnly
                                            className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            value={profileData.latitude}
                                            placeholder="Fetching..."
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                                        <input
                                            type="text"
                                            name="longitude"
                                            required
                                            readOnly
                                            className="block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            value={profileData.longitude}
                                            placeholder="Fetching..."
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                if (navigator.geolocation) {
                                                    navigator.geolocation.getCurrentPosition(
                                                        (position) => {
                                                            setProfileData({
                                                                ...profileData,
                                                                latitude: position.coords.latitude.toString(),
                                                                longitude: position.coords.longitude.toString()
                                                            });
                                                            toast.success('Location updated!');
                                                        },
                                                        (error) => {
                                                            toast.error('Location access denied. Please enter manually if possible or allow access.');
                                                        }
                                                    );
                                                } else {
                                                    toast.error('Geolocation is not supported by your browser.');
                                                }
                                            }}
                                            className="h-10 px-4"
                                        >
                                            Auto-Fetch Location
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? 'Saving...' : 'Next: Upload Documents'}
                            </Button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={submitDocuments} className="space-y-6">
                            <div className="bg-yellow-50 p-4 rounded-md text-yellow-800 text-sm mb-4">
                                Please upload valid documents. Accepted formats: PDF, JPG, PNG.
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Aadhar Card</label>
                                <input
                                    type="file"
                                    name="aadharCard"
                                    required
                                    onChange={handleFileChange}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">PAN Card</label>
                                <input
                                    type="file"
                                    name="panCard"
                                    required
                                    onChange={handleFileChange}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Resume / CV</label>
                                <input
                                    type="file"
                                    name="resume"
                                    onChange={handleFileChange}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>

                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? 'Uploading...' : 'Complete Registration'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TechnicianOnboardingPage;
