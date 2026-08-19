import React from 'react'
import moment from 'moment/moment';
import { Link } from 'react-router-dom';


const BlogList = ({ filteredBlogs }) => {
    return (
        <>
            {filteredBlogs.length === 0 ? (
                <>
                    <div className='text-center'>
                        <div className="flex flex-col items-center justify-center h-[50vh] text-white">
                            <div className="mb-4">
                                <svg
                                    className="w-24 h-24 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9.172 9.172a4 4 0 015.656 5.656m-6.828-6.828a4 4 0 000 5.656m0 0a4 4 0 005.656 0m-5.656 5.656a4 4 0 010-5.656"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold mb-2">No Blogs Found</h2>
                            <p className="text-gray-400 mb-6 px-8 lg:w-[70%]">
                                It seems we couldn't find any blogs matching your criteria.
                                Try adjusting your search or selecting a different category.
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-16 gap-x-10 gap-y-10 justify-items-center'>
                        {
                            filteredBlogs.map((blog, index) => {
                                // Create SEO-friendly slug from title
                                const slug = blog.slug || blog.title
                                    .toLowerCase()
                                    .replace(/[^\w\s-]/g, '')
                                    .replace(/\s+/g, '-')
                                    .replace(/--+/g, '-')
                                    .trim();

                                // Extract short description (120 characters from content)
                                const getShortDescription = (content) => {
                                    if (!content) return 'Read this article to learn more...';
                                    const plainText = content.replace(/<[^>]*>/g, '').trim();
                                    return plainText.length > 120 
                                        ? plainText.substring(0, 120) + '...' 
                                        : plainText;
                                };

                                // Get category name (handle different API response structures)
                                const categoryName = blog.category_name || blog.category || blog.cat_name || null;

                                return (
                                    <Link key={index}
                                        to={`/blog/${blog.slug || slug}`}
                                        style={{
                                            border: '1px solid rgb(45, 55, 72)',
                                            borderRadius: '0.375rem'
                                        }}
                                    >
                                        <div className='rounded-md p-4'>
                                            <img src={blog.image} alt={blog.title} className="w-full h-[200px] object-contain" />
                                        </div>
                                        <div className='p-4'
                                            style={{
                                                background: '#1a1f2c',
                                                borderRadius: ' 0 0 0.375rem 0.375rem'
                                            }}>
                                            {categoryName && (
                                                <span className='inline-block bg-purple-600 text-white text-xs px-3 py-1 rounded-full mb-2'>
                                                    {categoryName}
                                                </span>
                                            )}
                                            <p className='text-white font-semibold text-base mt-1 line-clamp-2 min-h-[48px]'>
                                                {blog.title}
                                            </p>
                                            <p className='text-gray-400 text-sm mt-2 line-clamp-3 min-h-[60px]'>
                                                {getShortDescription(blog.description || blog.content || blog.blog_description)}
                                            </p>
                                            <div className='flex justify-between items-center mt-2'>
                                                <p className='text-[#CACACA] text-sm mt-3 font-medium'>By {blog.author}</p>
                                                <p className='text-[#CACACA] text-sm mt-3 font-medium'>
                                                    {moment(blog.created_date).format('YYYY-MM-DD')}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })
                        }
                    </div>
                </>
            )
            }
        </>
    )
}

export default BlogList
