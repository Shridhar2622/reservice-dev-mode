import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { ArrowRight, Star, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Professional services</span>{' '}
                                    <span className="block text-indigo-600 xl:inline">at your doorstep</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Book trusted professionals for cleaning, repair, painting, and more. Experience the best service delivery with verified experts.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                                    <Link to="/services">
                                        <Button size="lg" className="w-full sm:w-auto flex items-center gap-2">
                                            Get Started <ArrowRight size={20} />
                                        </Button>
                                    </Link>
                                    <Link to="/services">
                                        <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                            View Services
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <img
                        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
                        src="https://images.unsplash.com/photo-1581578731117-104f2a41272c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80"
                        alt="Service professional working"
                    />
                </div>
            </div>

            {/* Features Section */}
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Why Choose Us</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            A better way to get things done
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                                    <Star size={24} />
                                </div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Top Rated Professionals</h3>
                                <p className="mt-2 text-base text-gray-500">
                                    We verify every professional to ensure you get high-quality service every time.
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                                    <Shield size={24} />
                                </div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Secure Payments</h3>
                                <p className="mt-2 text-base text-gray-500">
                                    Pay securely online or cash on delivery after service satisfaction.
                                </p>
                            </div>

                            <div className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                                    <Clock size={24} />
                                </div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">On-Time Service</h3>
                                <p className="mt-2 text-base text-gray-500">
                                    We respect your time. Our professionals arrive at your scheduled slot.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
