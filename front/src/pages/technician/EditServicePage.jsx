import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Package, DollarSign, Tag, Image as ImageIcon, ArrowLeft, Save } from 'lucide-react';

const EditServicePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

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
        const fetchService = async () => {
            try {
                const { data } = await api.get(`/services/${id}`);
                const service = data.data.service;
                setFormData({
                    title: service.title,
                    description: service.description,
                    price: service.price,
                    category: service.category,
                });
                setPreviewUrl(service.headerImage);
            } catch (error) {
                toast.error('Failed to fetch service details');
                navigate('/technician/dashboard');
            } finally {
                setIsFetching(false);
            }
        };
        fetchService();
    }, [id, navigate]);

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
            // If image is changed, we might need multipart, but if only text is changed, JSON is fine.
            // Let's use FormData to be safe if image is included.
            if (headerImage) {
                const data = new FormData();
                data.append('title', formData.title);
                data.append('description', formData.description);
                data.append('price', formData.price);
                data.append('category', formData.category);
                data.append('headerImage', headerImage);

                await api.patch(`/services/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.patch(`/services/${id}`, formData);
            }

            toast.success('Service updated successfully!');
            navigate('/technician/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update service');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="text-gray-500 font-medium">Loading service details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Discard Changes</span>
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-indigo-600 p-6 md:p-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Service</h1>
                                <p className="text-indigo-100 opacity-90 mt-2">Update your service information and pricing.</p>
                            </div>
                            <Package size={48} className="text-white/20 hidden md:block" />
                        </div>
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
                                    <label className="text-sm font-semibold text-gray-700">
                                        Service Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        placeholder="e.g. Deep House Cleaning"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            required
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none bg-white font-medium"
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
                                <label className="text-sm font-semibold text-gray-700">
                                    Service Description
                                </label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    placeholder="Describe your service in detail..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">
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
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold text-gray-900"
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
                                    <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-all group overflow-hidden">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImageIcon size={40} className="text-gray-400 group-hover:text-indigo-500 mb-3 transition-colors" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold text-indigo-600">Change image</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">PNG, JPG or WEBP (Max. 5MB)</p>
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
                                            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <p className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Current Image</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 py-4 text-lg font-bold"
                                onClick={() => navigate('/technician/dashboard')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-2 py-4 text-lg font-bold flex items-center justify-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditServicePage;
