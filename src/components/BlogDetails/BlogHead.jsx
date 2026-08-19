import React from 'react'
import { DateIcon, UserIcon } from '../../utils/Icons';
import { Link } from 'react-router-dom';
import moment from 'moment/moment';

const BlogHead = ({ blogsDetails }) => {
  // Calculate reading time
  const calculateReadingTime = (text) => {
    if (!text) return 1;
    const words = text.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // Average reading speed: 200 words/min
    return minutes;
  };

  const readingTime = calculateReadingTime(blogsDetails?.description);

  return (
    <>
      {blogsDetails && (
        <>
          {/* Breadcrumb Navigation */}
          <nav className='mb-6' aria-label='Breadcrumb'>
            <ol className='flex items-center space-x-2 text-sm text-gray-400'>
              <li>
                <Link to='/' className='hover:text-purple-400 transition-colors'>
                  Home
                </Link>
              </li>
              <li>
                <span className='mx-2'>/</span>
              </li>
              <li>
                <Link to='/blog' className='hover:text-purple-400 transition-colors'>
                  Blog
                </Link>
              </li>
              {blogsDetails.category_name && (
                <>
                  <li>
                    <span className='mx-2'>/</span>
                  </li>
                  <li>
                    <Link 
                      to={`/blog/category/${blogsDetails.cat_id}`} 
                      className='hover:text-purple-400 transition-colors capitalize'
                    >
                      {blogsDetails.category_name}
                    </Link>
                  </li>
                </>
              )}
              <li>
                <span className='mx-2'>/</span>
              </li>
              <li className='text-purple-300 truncate max-w-xs' aria-current='page'>
                {blogsDetails.title}
              </li>
            </ol>
          </nav>

          <div className='w-full flex flex-col lg:flex-row justify-between items-center gap-16 lg:gap-0'>
          <div className='w-full lg:w-[40%]'>
            <div className='flex flex-col'>
              <div className='text-3xl xs:text-4xl md:text-5xl font-bold text-white'>{blogsDetails?.title}</div>
              <div className='flex justify-start gap-6 items-center mt-9 flex-wrap'>
                <div className='flex justify-between items-center gap-4'>
                  <UserIcon />
                  <p className='text-[#CACACA] text-sm xs:text-base font-medium'>By {blogsDetails?.author}</p>
                </div>
                <div className='flex justify-center items-center gap-4'>
                  <DateIcon />
                  <p className='text-[#CACACA] text-sm xs:text-base font-medium'>
                    {moment(blogsDetails.created_date).format('YYYY-MM-DD')}
                  </p>
                </div>
                <div className='flex justify-center items-center gap-2'>
                  <svg className='w-4 h-4 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                  <p className='text-[#CACACA] text-sm xs:text-base font-medium'>
                    {readingTime} min read
                  </p>
                </div>
              </div>
              {/* Display Tags below author and date */}
              {blogsDetails?.tags && (
                <div className='flex flex-wrap gap-2 items-center mt-4'>
                  {blogsDetails.tags.split(',').map((tag, index) => (
                    <span 
                      key={index} 
                      className='bg-purple-600/20 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/30'
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className='w-full lg:w-[60%] text-end flex lg:justify-end items-center'>
            <div className='flex flex-col gap-3 justify-center items-center'>
              <div className='w-[200px] h-auto sm:w-[460px] sm:h-[460px] relative'>
                <img
                  alt={blogsDetails?.image_caption || blogsDetails?.image_alt || blogsDetails?.title}
                  className="relative w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  src={blogsDetails?.image}
                  loading="lazy"
                />
                <div className='absolute -top-3 -left-3 w-full h-full bg-[#ba12fe] -z-[9999]'
                  style={{ boxShadow: '0 0 20px 0 #ba12fe' }}></div>
              </div>
              {blogsDetails?.image_caption && (
                <p className='text-sm font-medium tracking-wide text-center text-gray-300 mt-2'>
                  {blogsDetails.image_caption}
                </p>
              )}
            </div>
          </div>
        </div>
        </>
      )}
    </>
  )
}

export default BlogHead
