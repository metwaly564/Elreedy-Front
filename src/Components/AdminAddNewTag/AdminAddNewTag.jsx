import React, { useState } from 'react';

export default function AdminAddNewTag() {
     const TestToken = localStorage.getItem('userToken');

    
    const [formData, setFormData] = useState({
        nameEn: '',
        nameAr: '',
        rank: '',
        categoryId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch('http://127.0.0.1:3000/api/v1/tags/tag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Token': TestToken
                },
                body: JSON.stringify({
                    nameEn: formData.nameEn,
                    nameAr: formData.nameAr,
                    rank: Number(formData.rank),
                    categoryId: Number(formData.categoryId)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create tag');
            }

            setSuccess(true);
            // Reset form on success
            setFormData({
                nameEn: '',
                nameAr: '',
                rank: '',
                categoryId: ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add New Tag</h1>
            
            <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
                <div className="mb-5">
                    <label htmlFor="nameEn" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        English Name
                    </label>
                    <input
                        type="text"
                        id="nameEn"
                        name="nameEn"
                        value={formData.nameEn}
                        onChange={handleChange}
                        className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                    />
                </div>
                
                <div className="mb-5">
                    <label htmlFor="nameAr" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Arabic Name
                    </label>
                    <input
                        type="text"
                        id="nameAr"
                        name="nameAr"
                        value={formData.nameAr}
                        onChange={handleChange}
                        className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                    />
                </div>
                
                <div className="mb-5">
                    <label htmlFor="rank" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Rank
                    </label>
                    <input
                        type="number"
                        id="rank"
                        name="rank"
                        value={formData.rank}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                    />
                </div>
                
                <div className="mb-5">
                    <label htmlFor="categoryId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Category ID
                    </label>
                    <input
                        type="number"
                        id="categoryId"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={loading}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    {loading ? 'Creating...' : 'Create Tag'}
                </button>
                
                {error && (
                    <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
                        Tag created successfully!
                    </div>
                )}
            </form>
        </div>
    );
}