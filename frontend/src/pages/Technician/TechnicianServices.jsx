import React, { useState, useEffect } from 'react';
import { useTechnician } from '../../context/TechnicianContext';
import { Plus, X, Image as ImageIcon, Loader } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ServiceCard from '../../components/common/ServiceCard';
import client from '../../api/client';
import toast from 'react-hot-toast';

const TechnicianServices = () => {
    const { technicianProfile } = useTechnician();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'Carpentry',
        description: '',
        price: '',
        originalPrice: '',
        headerImage: null
    });

    const CATEGORIES = [
        'Carpentry',
        'Plumbing',
        'Electrical',
        'Cleaning',
        'HVAC',
        'Painting',
        'Appliances'
    ];

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const technicianId = technicianProfile?.user?._id || technicianProfile?.user;
            if (!technicianId) {
                // If no technician profile yet, just stop or set empty
                setServices([]);
                setLoading(false);
                return;
            }
            const res = await client.get(`/services?technician=${technicianId}`);
            setServices(res.data.data.services);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { id, value, files } = e.target;
        if (id === 'headerImage') {
            setFormData(prev => ({ ...prev, headerImage: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            category: 'Carpentry',
            description: '',
            price: '',
            originalPrice: '',
            headerImage: null
        });
        setEditingServiceId(null);
    };

    const handleEditClick = (service) => {
        setFormData({
            title: service.title,
            category: service.category,
            description: service.description,
            price: service.price,
            originalPrice: service.originalPrice || '',
            headerImage: service.headerImage // URL string. Logic needs to handle mixed types (File vs URL)
        });
        setEditingServiceId(service._id);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (service) => {
        if (!window.confirm(`Are you sure you want to delete "${service.title}"?`)) return;

        try {
            await client.delete(`/services/${service._id}`);
            toast.success('Service deleted successfully');
            fetchServices();
        } catch (err) {
            toast.error('Failed to delete service');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('description', formData.description);
            data.append('price', formData.price);
            if (formData.originalPrice) data.append('originalPrice', formData.originalPrice);

            // Handle Image: Only append if it's a new File object
            // If it's a string (URL from existing service), backend ignores it or we don't send it.
            if (formData.headerImage && typeof formData.headerImage !== 'string') {
                data.append('headerImage', formData.headerImage);
            }

            if (editingServiceId) {
                // UPDATE
                await client.patch(`/services/${editingServiceId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Service updated successfully!');
            } else {
                // CREATE
                await client.post('/services', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Service created successfully!');
            }

            setIsModalOpen(false);
            resetForm();
            fetchServices();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save service');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    // Helper to get preview URL safely
    const getPreviewUrl = () => {
        if (!formData.headerImage) return null;
        if (typeof formData.headerImage === 'string') return formData.headerImage; // Existing URL
        return URL.createObjectURL(formData.headerImage); // New File
    };

    if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Services</h2>
                    <p className="text-slate-500">Manage the services you offer to customers.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add New Service
                </Button>
            </div>

            {/* List Services */}
            {services.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No services yet</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mb-6">Create a focused service card to attract customers.</p>
                    <Button variant="outline" onClick={() => setIsModalOpen(true)}>Create First Service</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map(service => (
                        <div key={service._id} className={!technicianProfile.isOnline ? "grayscale opacity-75 transition-all" : "transition-all"}>
                            <ServiceCard
                                variant="technician"
                                service={{
                                    ...service,
                                    id: service._id,
                                    rating: 4.8,
                                    image: service.headerImage || 'https://images.unsplash.com/photo-1581578731117-104f2a41d58e?auto=format&fit=crop&q=80&w=1000'
                                }}
                                onEdit={handleEditClick}
                                onDelete={handleDeleteClick}
                                onBook={() => { }}
                            />
                            {!technicianProfile.isOnline && (
                                <p className="text-center text-xs font-bold text-slate-500 mt-2 uppercase tracking-wide">Offline - Hidden from Search</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Service Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold">{editingServiceId ? 'Edit Service' : 'Create Service'}</h3>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <Input
                                id="title"
                                label="Service Title (Custom Name)"
                                placeholder="e.g. Expert Carpentry"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                                <select
                                    id="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                                >
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    id="price"
                                    label="Price (₹)"
                                    type="number"
                                    placeholder="499"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                />
                                <Input
                                    id="originalPrice"
                                    label="Original Price (Optional)"
                                    type="number"
                                    placeholder="799"
                                    value={formData.originalPrice}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Custom Image Upload UI */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Service Image</label>
                                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group">
                                    <input
                                        type="file"
                                        id="headerImage"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setFormData(prev => ({ ...prev, headerImage: file }));
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />

                                    {formData.headerImage ? (
                                        <div className="relative">
                                            <img
                                                src={getPreviewUrl()}
                                                alt="Preview"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                <span className="text-white font-bold flex items-center gap-2">
                                                    <ImageIcon className="w-5 h-5" /> Change Image
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-8 flex flex-col items-center">
                                            <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 text-blue-500 rounded-full flex items-center justify-center mb-3">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                            <p className="font-bold text-slate-700 dark:text-slate-200">Click to upload image</p>
                                            <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px recommended)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium min-h-[100px]"
                                    placeholder="Describe what you offer..."
                                    required
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full" size="lg">
                                    {editingServiceId ? 'Update Service' : 'Create Service'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TechnicianServices;
