import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Package, DollarSign, Tag, FileText, Image as ImageIcon, ArrowLeft } from 'lucide-react';

const CreateServicePage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const categories = [
        'Cleaning',
        'Plumbing',
        'Electrical',
        'Painting',
        'Carpentry',
        'AC Repair',
        'Appliance Repair',
        'Pest Control',
        'Gardening',
        'Renovation'
    ];

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
    });
    const [headerImage, setHeaderImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        // Categories are now static
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setHeaderImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('category', formData.category);
            if (headerImage) {
                data.append('headerImage', headerImage);
            }

            await api.post('/services', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Service created successfully!');
            navigate('/technician/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create service');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Dashboard</span>
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-indigo-600 p-6 md:p-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Create New Service</h1>
                        <p className="text-indigo-100 opacity-90 mt-2">Add a new service to your profile to start receiving bookings.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                        {/* Basic Info Section */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                                <Package size={20} className="text-indigo-600" />
                                Service Details
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                        Service Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        placeholder="e.g. Deep House Cleaning"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                        Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            required
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none appearance-none bg-white"
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <Tag size={18} className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    Service Description
                                </label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    placeholder="Describe your service in detail..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                    Price ($)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="price"
                                        required
                                        min="0"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                    />
                                    <DollarSign size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Image Section */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                                <ImageIcon size={20} className="text-indigo-600" />
                                Service Image
                            </h2>

                            <div className="flex flex-col md:flex-row items-start gap-8">
                                <div className="flex-1 w-full">
                                    <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImageIcon size={40} className="text-gray-400 group-hover:text-indigo-500 mb-3 transition-colors" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">PNG, JPG or WEBP (Max. 5MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>

                                {previewUrl && (
                                    <div className="w-full md:w-64">
                                        <p className="text-sm font-semibold text-gray-600 mb-2">Image Preview</p>
                                        <div className="relative rounded-2xl overflow-hidden aspect-video md:aspect-square bg-gray-100 border border-gray-200 shadow-inner">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setHeaderImage(null);
                                                    setPreviewUrl(null);
                                                }}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-md transition-colors"
                                            >
                                                <ArrowLeft size={14} className="rotate-45" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 py-4 text-lg"
                                onClick={() => navigate('/technician/dashboard')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-2 py-4 text-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating Service...' : 'Publish Service'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateServicePage;
